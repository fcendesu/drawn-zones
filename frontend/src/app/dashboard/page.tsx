"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, User } from "@/lib/auth";
import { rectangleAPI, Rectangle } from "@/lib/rectangles";
import Map from "@/components/Map";
import RectangleList from "@/components/RectangleList";
import RectangleNameModal from "@/components/RectangleNameModal";
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedRectangle, setSelectedRectangle] = useState<Rectangle | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfile = await authAPI.getProfile();
        setUser(userProfile);
      } catch {
        setError("Failed to load user profile. Please sign in again.");
        // Clear any stored token
        localStorage.removeItem("authToken");
        // Redirect to signin after a delay
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    if (user) {
      loadRectangles();
    }
  }, [user]);

  const loadRectangles = async () => {
    try {
      const rectanglesData = await rectangleAPI.getRectangles();
      setRectangles(Array.isArray(rectanglesData) ? rectanglesData : []);
    } catch (error) {
      console.error("Failed to load rectangles:", error);
      setRectangles([]); // Ensure we always have an array
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/auth/signin");
    } catch {
      // Even if logout fails on server, clear local storage and redirect
      localStorage.removeItem("authToken");
      router.push("/auth/signin");
    }
  };

  const handleRectangleCreated = (feature: any) => {
    setPendingCoordinates(feature.geometry);
    setIsModalOpen(true);
  };

  const handleRectangleSaved = async (name: string) => {
    try {
      const newRectangle = await rectangleAPI.createRectangle({
        name,
        coordinates: pendingCoordinates,
      });
      setRectangles((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [newRectangle, ...safePrev];
      });
      setPendingCoordinates(null);
    } catch (error) {
      console.error("Failed to save rectangle:", error);
    }
  };

  const handleRectangleDeleted = async (id: number) => {
    try {
      await rectangleAPI.deleteRectangle(id);
      setRectangles((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((r) => r.id !== id);
      });
      if (selectedRectangle?.id === id) {
        setSelectedRectangle(null);
      }
    } catch (error) {
      console.error("Failed to delete rectangle:", error);
    }
  };

  const handleRectangleSelected = (rectangle: Rectangle) => {
    setSelectedRectangle(rectangle);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/20 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="bg-red-500/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-red-300 mb-4">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/shape.png"
                alt="DrawnZones Logo"
                width={32}
                height={32}
                className="w-8 h-8 filter brightness-0 invert mr-2"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                DrawnZones
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || user?.email}!
            </h2>
            <p className="text-gray-400">
              Draw rectangles on the map, name them, and manage your zones.
            </p>
          </div>

          {/* Map and Rectangle List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Rectangle List */}
            <div className="lg:col-span-1">
              <RectangleList
                rectangles={rectangles}
                onRectangleSelect={handleRectangleSelected}
                onRectangleDelete={handleRectangleDeleted}
                selectedRectangle={selectedRectangle}
              />
            </div>

            {/* Map */}
            <div className="lg:col-span-2 bg-black/20 rounded-lg border border-cyan-500/20 overflow-hidden">
              <Map
                rectangles={rectangles}
                onRectangleCreated={handleRectangleCreated}
                onRectangleDeleted={handleRectangleDeleted}
                onRectangleSelected={handleRectangleSelected}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Rectangle Name Modal */}
      <RectangleNameModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingCoordinates(null);
        }}
        onSave={handleRectangleSaved}
        coordinates={pendingCoordinates}
      />
    </div>
  );
}
