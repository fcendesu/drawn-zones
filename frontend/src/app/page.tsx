import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Navigation Header */}
      <nav className="bg-black/50 backdrop-blur-md shadow-lg border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/shape.png"
                alt="DrawnZones Logo"
                width={32}
                height={32}
                className="w-8 h-8 filter brightness-0 invert"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                DrawnZones
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 active:scale-95 active:shadow-inner transition-all duration-200 font-medium shadow-lg shadow-cyan-500/25 transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Draw Zones on Maps
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent block animate-pulse">
              Save & Manage
            </span>
          </h1>

          {/* Hero Description */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create, name, and save rectangular zones on interactive maps.
            Perfect for area planning, territory management, and geographic data
            visualization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 active:scale-95 active:shadow-inner transition-all duration-200 font-medium text-lg w-full sm:w-auto shadow-xl shadow-cyan-500/25 border border-cyan-400/30 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="bg-black/40 backdrop-blur-sm text-cyan-400 px-8 py-3 rounded-lg border-2 border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 active:scale-95 active:bg-cyan-500/20 transition-all duration-200 font-medium text-lg w-full sm:w-auto shadow-lg transform hover:scale-105"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-black/40 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30">
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
            <h3 className="text-xl font-semibold text-white mb-2">
              Interactive Drawing
            </h3>
            <p className="text-gray-300">
              Draw rectangles directly on the map with intuitive click-and-drag
              functionality.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4 border border-purple-500/30">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Named Zones
            </h3>
            <p className="text-gray-300">
              Give meaningful names to your zones for easy identification and
              organization.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Persistent Storage
            </h3>
            <p className="text-gray-300">
              All your zones are safely stored and can be accessed anytime,
              anywhere.
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Built with Modern Technology
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-400">
              <span className="font-medium">React</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30 text-blue-400">
              <span className="font-medium">Next.js</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400">
              <span className="font-medium">Mapbox</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400">
              <span className="font-medium">Django</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400">
              <span className="font-medium">PostgreSQL</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-cyan-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>
              &copy; 2025 DrawnZones. Built for Full Stack Engineer Candidate
              Task by{" "}
              <a
                href="https://github.com/fcendesu"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Furkan Çakmak
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
