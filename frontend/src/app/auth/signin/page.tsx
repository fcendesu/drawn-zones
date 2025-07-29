"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { authAPI } from "@/lib/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.sendMagicLink(email);
      setMagicLinkSent(true);
      setIsNewUser(response.new_user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send magic link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30"></div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <Image
              src="/shape.png"
              alt="DrawnZones Logo"
              width={40}
              height={40}
              className="w-10 h-10 filter brightness-0 invert"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              DrawnZones
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-300">Sign in to your account to continue</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
          {!magicLinkSent ? (
            <>
              {/* Magic Link Form */}
              <form onSubmit={handleMagicLink} className="space-y-6 mb-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Send magic link
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center text-sm text-gray-400">
                <div className="mt-4 space-x-4">
                  <Link
                    href="/privacy"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* Magic Link Sent State */
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                <svg
                  className="w-8 h-8 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-300 mb-4">
                We sent a magic link to{" "}
                <span className="text-cyan-400">{email}</span>
              </p>
              {isNewUser && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                  <p className="text-green-300 text-sm">
                    🎉 Welcome! We&apos;ve created your account for you.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-400 mb-6">
                Click the link in the email to sign in. The link will expire in
                15 minutes.
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setEmail("");
                  setError("");
                  setIsNewUser(false);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
