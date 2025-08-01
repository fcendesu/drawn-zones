"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authAPI, User } from "@/lib/auth";
import { rectangleAPI, Rectangle } from "@/lib/rectangles";
import Map from "@/components/Map";
import RectangleList from "@/components/RectangleList";
import RectangleNameModal from "@/components/RectangleNameModal";
import APIKeyManager from "@/components/APIKeyManager";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const [showAllZones, setShowAllZones] = useState(true);
  const [activeTab, setActiveTab] = useState<"zones" | "api-keys">("zones");
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfile = await authAPI.getProfile();
        setUser(userProfile);
      } catch (error) {
        setError("Failed to load user profile. Please sign in again.");
        // Clear any stored token
        if (typeof window !== "undefined") {
          document.cookie =
            "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
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
      setRectangles([]); // Ensure we always have an array
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/auth/signin");
    } catch {
      // Even if logout fails on server, clear cookies and redirect
      if (typeof window !== "undefined") {
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      router.push("/auth/signin");
    }
  };

  const handleRectangleCreated = useCallback((feature: any) => {
    setPendingCoordinates(feature.geometry);
    setIsModalOpen(true);
  }, []);

  const handleRectangleSaved = useCallback(
    async (name: string) => {
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
      } catch (error) {}
    },
    [pendingCoordinates]
  );

  const handleRectangleDeleted = useCallback(
    async (id: number) => {
      try {
        await rectangleAPI.deleteRectangle(id);
        setRectangles((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return safePrev.filter((r) => r.id !== id);
        });
        if (selectedRectangle?.id === id) {
          setSelectedRectangle(null);
        }
      } catch (error) {}
    },
    [selectedRectangle]
  );

  const handleRectangleSelected = useCallback((rectangle: Rectangle) => {
    setSelectedRectangle(rectangle);
    setShowAllZones(false);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllZones(!showAllZones);
  }, [showAllZones]);

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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6">
            <p className="text-gray-400">
              Draw rectangles on the map, name them, and manage your zones.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("zones")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "zones"
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  Zones
                </button>
                <button
                  onClick={() => setActiveTab("api-keys")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "api-keys"
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  API Keys
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "zones" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-240px)] mb-16">
              {/* Rectangle List */}
              <div className="lg:col-span-1 h-full">
                <RectangleList
                  rectangles={rectangles}
                  onRectangleSelect={handleRectangleSelected}
                  onRectangleDelete={handleRectangleDeleted}
                  selectedRectangle={selectedRectangle}
                  showAllZones={showAllZones}
                  onToggleShowAll={handleToggleShowAll}
                />
              </div>

              {/* Map */}
              <div className="lg:col-span-3 bg-black/20 rounded-lg border border-cyan-500/20 overflow-hidden h-[600px]">
                <Map
                  rectangles={rectangles}
                  onRectangleCreated={handleRectangleCreated}
                  onRectangleDeleted={handleRectangleDeleted}
                  onRectangleSelected={handleRectangleSelected}
                  selectedRectangle={selectedRectangle}
                  showAllZones={showAllZones}
                />
              </div>
            </div>
          )}

          {activeTab === "api-keys" && (
            <div className="max-w-4xl mx-auto">
              <APIKeyManager />
            </div>
          )}
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
        existingNames={rectangles.map((r) => r.name)}
      />
    </div>
  );
}
