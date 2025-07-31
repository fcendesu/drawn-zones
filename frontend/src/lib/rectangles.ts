const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Rectangle {
  id: number;
  name: string;
  coordinates: any;
  center_coordinates: [number, number];
  created_at: string;
  updated_at: string;
}

export interface CreateRectangleData {
  name: string;
  coordinates: any;
}

// Helper functions for secure cookie management
const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

class RectangleAPI {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = getCookie("auth_token");
      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "An error occurred";

      if (data.errors) {
        // Handle validation errors
        const firstError = Object.values(data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (data.error) {
        errorMessage = data.error;
      }

      throw new Error(errorMessage);
    }

    return data;
  }

  async getRectangles(): Promise<Rectangle[]> {
    console.log("Making request to get rectangles...");
    const headers = this.getHeaders();
    console.log("Request headers:", headers);

    const response = await fetch(`${API_BASE}/api/rectangles/`, {
      method: "GET",
      headers,
    });

    console.log("Response status:", response.status);
    const data = await this.handleResponse<any>(response);
    console.log("Response data:", data);

    // Handle paginated response
    if (data && data.results && Array.isArray(data.results)) {
      return data.results;
    }

    // Fallback to direct array
    return Array.isArray(data) ? data : [];
  }

  async createRectangle(data: CreateRectangleData): Promise<Rectangle> {
    const response = await fetch(`${API_BASE}/api/rectangles/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Rectangle>(response);
  }

  async updateRectangle(
    id: number,
    data: Partial<CreateRectangleData>
  ): Promise<Rectangle> {
    const response = await fetch(`${API_BASE}/api/rectangles/${id}/`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Rectangle>(response);
  }

  async deleteRectangle(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/rectangles/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      let errorMessage = "An error occurred";

      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (data.error) {
        errorMessage = data.error;
      }

      throw new Error(errorMessage);
    }
  }

  async getRectangleStats(): Promise<{
    total_rectangles: number;
    recent_rectangles: number;
  }> {
    const response = await fetch(`${API_BASE}/api/rectangles/stats/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      total_rectangles: number;
      recent_rectangles: number;
    }>(response);
  }
}

export const rectangleAPI = new RectangleAPI();
