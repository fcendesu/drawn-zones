"use client";

import { useState, useEffect } from "react";
import { APIKey, createAPIKey, getAPIKeys, deleteAPIKey } from "@/lib/auth";

interface APIKeyManagerProps {
  className?: string;
}

export default function APIKeyManager({ className = "" }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<APIKey | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await getAPIKeys();
      // Ensure keys is an array
      const safeKeys = Array.isArray(keys) ? keys : [];
      setApiKeys(safeKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
      setApiKeys([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const validateKeyName = (name: string): string | null => {
    if (!name.trim()) {
      return "API key name is required";
    }

    if (name.trim().length < 2) {
      return "API key name must be at least 2 characters long";
    }

    if (name.trim().length > 100) {
      return "API key name must be less than 100 characters";
    }

    // Check for duplicate names (case-insensitive)
    const existingNames = apiKeys.map((key) => key.name.toLowerCase());
    if (existingNames.includes(name.trim().toLowerCase())) {
      return "An API key with this name already exists";
    }

    return null;
  };

  const handleNameChange = (value: string) => {
    setNewKeyName(value);

    // Real-time validation
    if (value.trim()) {
      const validationError = validateKeyName(value);
      setNameError(validationError);
    } else {
      setNameError(null);
    }
  };

  const isFormValid = () => {
    return newKeyName.trim() && !nameError && !creating;
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the name
    const validationError = validateKeyName(newKeyName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setNameError(null);
      const newKey = await createAPIKey({ name: newKeyName.trim() });
      setApiKeys((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [newKey, ...safePrev];
      });
      setNewlyCreatedKey(newKey);
      setNewKeyName("");
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setError(null);
      await deleteAPIKey(id);
      setApiKeys((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((key) => key.id !== id);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className={`bg-black/20 rounded-lg border border-cyan-500/20 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-black/20 rounded-lg border border-cyan-500/20 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Developer API Keys</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create New Key"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {newlyCreatedKey && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <h3 className="text-green-300 font-semibold mb-2">
            New API Key Created!
          </h3>
          <p className="text-green-200 text-sm mb-3">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-black/30 rounded text-green-300 text-sm font-mono break-all">
              {newlyCreatedKey.key}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey.key)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewlyCreatedKey(null)}
            className="mt-2 text-green-300 hover:text-green-200 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateKey}
          className="mb-6 p-4 bg-black/30 rounded-lg border border-cyan-500/30"
        >
          <h3 className="text-white font-semibold mb-3">Create New API Key</h3>
          <div className="mb-4">
            <label
              htmlFor="keyName"
              className="block text-cyan-300 text-sm mb-2"
            >
              Key Name
            </label>
            <input
              type="text"
              id="keyName"
              value={newKeyName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., My App, Development, Production"
              className={`w-full p-2 bg-black/50 border rounded text-white placeholder-gray-400 focus:outline-none ${
                nameError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-cyan-500"
              }`}
              required
            />
            {nameError && (
              <p className="text-red-300 text-xs mt-1">{nameError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !isFormValid()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {creating ? "Creating..." : "Create Key"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {!Array.isArray(apiKeys) || apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No API keys found.</p>
            <p className="text-sm mt-2">
              Create your first API key to start using the API.
            </p>
          </div>
        ) : (
          apiKeys
            .filter((key) => key && typeof key === "object")
            .map((key) => (
              <div
                key={key.id || `key-${Math.random()}`}
                className="p-4 bg-black/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">
                      {key.name || "Unnamed Key"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Created:{" "}
                      {key.created_at ? formatDate(key.created_at) : "Unknown"}
                    </p>
                    {key.last_used_at && (
                      <p className="text-gray-400 text-sm">
                        Last used: {formatDate(key.last_used_at)}
                      </p>
                    )}
                    <div className="mt-2">
                      <code className="text-xs bg-black/50 px-2 py-1 rounded text-cyan-300 font-mono">
                        {key.key && key.key.length > 16
                          ? `${key.key.substring(0, 8)}...${key.key.substring(
                              key.key.length - 8
                            )}`
                          : key.key || "Invalid key"}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(key.id || 0)}
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-blue-300 font-semibold mb-2">
          How to use API keys
        </h3>
        <div className="text-blue-200 text-sm space-y-2">
          <p>Include your API key in the Authorization header:</p>
          <code className="block bg-black/30 p-2 rounded text-xs font-mono">
            Authorization: Token YOUR_API_KEY_HERE
          </code>
          <p className="mt-2">
            Example:{" "}
            <code className="bg-black/30 px-1 rounded text-xs">
              curl -H &quot;Authorization: Token YOUR_KEY&quot;
              http://localhost:8000/api/rectangles/
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
