"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="inline-flex items-center space-x-3">
              <Image
                src="/shape.png"
                alt="DrawnZones Logo"
                width={32}
                height={32}
                className="w-8 h-8 filter brightness-0 invert"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                DrawnZones
              </span>
            </Link>
            <Link
              href="/auth/signin"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <p>
                  At DrawnZones, we collect minimal information necessary to
                  provide our service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Email Address:</strong> Used for authentication and
                    account management
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Optional first name,
                    last name, and username
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Basic analytics to improve our
                    service
                  </li>
                  <li>
                    <strong>Authentication Tokens:</strong> Securely stored to
                    maintain your session
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our service</li>
                  <li>Send magic link authentication emails</li>
                  <li>Communicate important updates about your account</li>
                  <li>Improve our service and user experience</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Magic Link Authentication
              </h2>
              <div className="space-y-4">
                <p>
                  Our passwordless authentication system uses secure magic
                  links:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Magic links expire after 15 minutes for security</li>
                  <li>Links can only be used once</li>
                  <li>No passwords are stored on our servers</li>
                  <li>Authentication tokens are securely encrypted</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Data Security
              </h2>
              <div className="space-y-4">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure cookie storage for authentication tokens</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited data retention policies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Sharing and Disclosure
              </h2>
              <div className="space-y-4">
                <p>
                  We do not sell, trade, or share your personal information with
                  third parties, except:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With your explicit consent</li>
                  <li>
                    To trusted service providers who assist in our operations
                    (under strict confidentiality)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Your Rights
              </h2>
              <div className="space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Opt-out of non-essential communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Cookies and Tracking
              </h2>
              <div className="space-y-4">
                <p>We use cookies and similar technologies for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Authentication and session management</li>
                  <li>Basic analytics to improve our service</li>
                  <li>Remembering your preferences</li>
                </ul>
                <p>
                  You can control cookie settings through your browser, but some
                  functionality may be limited.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Children&apos;s Privacy
              </h2>
              <div className="space-y-4">
                <p>
                  Our service is not intended for children under 13. We do not
                  knowingly collect personal information from children under 13.
                  If you are a parent or guardian and believe your child has
                  provided us with personal information, please contact us.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Changes to This Policy
              </h2>
              <div className="space-y-4">
                <p>
                  We may update this privacy policy from time to time. We will
                  notify you of any changes by posting the new policy on this
                  page and updating the &quot;Last updated&quot; date.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Back to Sign In */}
        <div className="text-center mt-8">
          <Link
            href="/auth/signin"
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
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
