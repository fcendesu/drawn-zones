// lib/auth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_email_verified: boolean;
  created_at: string;
  date_joined: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_created?: boolean;
}

export interface SendMagicLinkResponse {
  message: string;
  email: string;
  expires_in_minutes: number;
  new_user: boolean;
}

export interface AuthError {
  errors?: Record<string, string[]>;
  error?: string;
}

class AuthAPI {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error: AuthError = data;
      let errorMessage = "An error occurred";

      if (error.errors) {
        // Handle validation errors
        const firstError = Object.values(error.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.error) {
        errorMessage = error.error;
      }

      throw new Error(errorMessage);
    }

    return data;
  }

  async sendMagicLink(email: string): Promise<SendMagicLinkResponse> {
    const response = await fetch(`${API_BASE}/api/auth/magic-link/send/`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse<SendMagicLinkResponse>(response);
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/api/auth/magic-link/verify/`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ token }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    // Store token in localStorage
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("auth_token", data.token);
    }

    return data;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/profile/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async updateProfile(
    userData: Partial<Pick<User, "first_name" | "last_name" | "username">>
  ): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE}/api/auth/profile/`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<{ message: string; user: User }>(response);
  }

  async checkAuthStatus(): Promise<{ authenticated: boolean; user: User }> {
    const response = await fetch(`${API_BASE}/api/auth/status/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ authenticated: boolean; user: User }>(
      response
    );
  }

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/api/auth/logout/`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ message: string }>(response);

    // Remove token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    return data;
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }
}

export const authAPI = new AuthAPI();
