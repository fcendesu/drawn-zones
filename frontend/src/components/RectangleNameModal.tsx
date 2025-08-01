"use client";

import { useState, useEffect } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface RectangleNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  coordinates?: any;
  existingNames?: string[];
}

export default function RectangleNameModal({
  isOpen,
  onClose,
  onSave,
  coordinates,
  existingNames = [],
}: RectangleNameModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isNameDuplicate = Boolean(
    name.trim() &&
      existingNames.some(
        (existingName) =>
          existingName.toLowerCase() === name.trim().toLowerCase()
      )
  );

  useEffect(() => {
    if (isOpen) {
      setName("");
      setIsSubmitting(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check for duplicate names
    const trimmedName = name.trim();
    if (
      existingNames.some(
        (existingName) =>
          existingName.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError("A rectangle with this name already exists");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSave(trimmedName);
      onClose();
    } catch (error) {
      setError("Failed to save rectangle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-lg border border-cyan-500/20 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 border border-cyan-500/30">
              <svg
                className="w-5 h-5 text-cyan-400"
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
            <h2 className="text-xl font-semibold text-white">
              Name Your Rectangle
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="rectangle-name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Rectangle Name
              </label>
              <input
                id="rectangle-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                disabled={isSubmitting}
                placeholder="Enter a name for your rectangle..."
                className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                  error || isNameDuplicate
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                autoFocus
                required
                maxLength={100}
              />
              {(error || isNameDuplicate) && (
                <p className="text-red-400 text-sm mt-1">
                  {error || "A rectangle with this name already exists"}
                </p>
              )}
            </div>

            {coordinates && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">Coordinates:</p>
                <p className="text-cyan-400 text-xs font-mono break-all">
                  {JSON.stringify(coordinates, null, 2)}
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting || isNameDuplicate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Rectangle"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
