"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";

interface UserInfo {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function VerifyMagicLink() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email and try again."
        );
        return;
      }

      try {
        const result = await authAPI.verifyMagicLink(token);
        setStatus("success");
        setMessage("Successfully signed in!");
        setUserInfo(result.user);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } catch (error) {
        setStatus("error");
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        if (errorMessage.includes("expired")) {
          setMessage("This magic link has expired. Please request a new one.");
        } else if (errorMessage.includes("used")) {
          setMessage(
            "This magic link has already been used. Please request a new one."
          );
        } else if (errorMessage.includes("Invalid")) {
          setMessage(
            "Invalid magic link. Please check your email and try again."
          );
        } else {
          setMessage(
            "An error occurred during verification. Please try again."
          );
        }
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/20 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verifying your magic link...
              </h1>
              <p className="text-gray-300">Please wait while we sign you in.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="bg-green-500/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-green-300 mb-4">{message}</p>
              {userInfo && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm">
                    Signed in as{" "}
                    <span className="text-cyan-400">{userInfo.email}</span>
                  </p>
                </div>
              )}
              <p className="text-gray-400 text-sm">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
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
              <h1 className="text-2xl font-bold text-white mb-2">
                Verification failed
              </h1>
              <p className="text-red-300 mb-6">{message}</p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Request new magic link
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
