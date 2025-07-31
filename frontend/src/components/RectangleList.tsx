"use client";

import { useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Rectangle {
  id: number;
  name: string;
  coordinates: any;
  center_coordinates: [number, number];
  created_at: string;
  updated_at: string;
}

interface RectangleListProps {
  rectangles?: Rectangle[];
  onRectangleSelect: (rectangle: Rectangle) => void;
  onRectangleDelete: (id: number) => void;
  selectedRectangle?: Rectangle | null;
}

export default function RectangleList({
  rectangles = [],
  onRectangleSelect,
  onRectangleDelete,
  selectedRectangle,
}: RectangleListProps) {
  const [hoveredRectangle, setHoveredRectangle] = useState<Rectangle | null>(
    null
  );

  const safeRectangles = Array.isArray(rectangles) ? rectangles : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (safeRectangles.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 713 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Rectangles Yet
          </h3>
          <p className="text-gray-400 text-sm">
            Draw your first rectangle on the map to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-lg border border-cyan-500/20">
      <div className="p-4 border-b border-cyan-500/20">
        <h3 className="text-lg font-semibold text-white">
          Saved Rectangles ({safeRectangles.length})
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {safeRectangles.map((rectangle) => (
          <div
            key={rectangle.id}
            className={`p-4 border-b border-gray-700/50 last:border-b-0 cursor-pointer transition-all duration-200 ${
              selectedRectangle?.id === rectangle.id
                ? "bg-cyan-500/20 border-l-4 border-l-cyan-400"
                : "hover:bg-gray-800/50"
            }`}
            onClick={() => onRectangleSelect(rectangle)}
            onMouseEnter={() => setHoveredRectangle(rectangle)}
            onMouseLeave={() => setHoveredRectangle(null)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">
                  {rectangle.name}
                </h4>
                <p className="text-gray-400 text-sm">
                  Created {formatDate(rectangle.created_at)}
                </p>
                {rectangle.center_coordinates && (
                  <p className="text-gray-500 text-xs mt-1">
                    Center: {rectangle.center_coordinates[1].toFixed(4)},{" "}
                    {rectangle.center_coordinates[0].toFixed(4)}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRectangleDelete(rectangle.id);
                }}
                className="text-red-400 hover:text-red-300 transition-colors p-1 opacity-0 group-hover:opacity-100"
                title="Delete rectangle"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
