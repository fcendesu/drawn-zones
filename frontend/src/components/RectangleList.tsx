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
  showAllZones?: boolean;
  onToggleShowAll?: () => void;
}

export default function RectangleList({
  rectangles = [],
  onRectangleSelect,
  onRectangleDelete,
  selectedRectangle,
  showAllZones = true,
  onToggleShowAll,
}: RectangleListProps) {
  const [hoveredRectangle, setHoveredRectangle] = useState<Rectangle | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safeRectangles = Array.isArray(rectangles) ? rectangles : [];

  // Calculate pagination
  const totalPages = Math.ceil(safeRectangles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRectangles = safeRectangles.slice(startIndex, endIndex);

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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
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
    <div className="bg-black/40 backdrop-blur-lg rounded-lg border border-cyan-500/20 h-full flex flex-col">
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Saved Rectangles ({safeRectangles.length})
          </h3>
          {onToggleShowAll && !showAllZones && (
            <button
              onClick={onToggleShowAll}
              className="px-3 py-1 rounded text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentRectangles.map((rectangle) => (
          <div
            key={rectangle.id}
            className={`group p-4 border-b border-gray-700/50 last:border-b-0 cursor-pointer transition-all duration-200 ${
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
                <div className="flex items-center">
                  <h4 className="font-medium text-white mb-1">
                    {rectangle.name}
                  </h4>
                  {selectedRectangle?.id === rectangle.id && (
                    <div className="ml-2 w-2 h-2 bg-cyan-400 rounded-full"></div>
                  )}
                </div>
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
                  if (
                    confirm(
                      `Are you sure you want to delete "${rectangle.name}"?`
                    )
                  ) {
                    onRectangleDelete(rectangle.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1}-
              {Math.min(endIndex, safeRectangles.length)} of{" "}
              {safeRectangles.length} zones
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded text-sm font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded text-sm font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
