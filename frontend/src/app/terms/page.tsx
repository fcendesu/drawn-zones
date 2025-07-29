"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4">
                <p>
                  By accessing or using DrawnZones (&quot;the Service&quot;),
                  you agree to be bound by these Terms of Service
                  (&quot;Terms&quot;). If you do not agree to these Terms,
                  please do not use our Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you
                  and DrawnZones. We may update these Terms from time to time,
                  and your continued use of the Service constitutes acceptance
                  of any changes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-4">
                <p>DrawnZones is a web application platform that provides:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Secure magic link authentication</li>
                  <li>User account management</li>
                  <li>Web-based application services</li>
                  <li>Data visualization and management tools</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any
                  part of our Service at any time with or without notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4">
                <p>
                  To access certain features, you must create an account by
                  providing:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>A valid email address</li>
                  <li>Optional profile information (name, username)</li>
                </ul>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the security of your account</li>
                  <li>Keeping your email address current and accessible</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Upload or transmit malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Create multiple accounts to circumvent restrictions</li>
                  <li>
                    Use the Service for commercial purposes without permission
                  </li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Magic Link Authentication
              </h2>
              <div className="space-y-4">
                <p>
                  Our authentication system uses magic links sent to your email:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Magic links are valid for 15 minutes only</li>
                  <li>Each link can only be used once</li>
                  <li>
                    You are responsible for keeping your email account secure
                  </li>
                  <li>
                    We are not liable for unauthorized access due to compromised
                    email accounts
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Privacy and Data Protection
              </h2>
              <div className="space-y-4">
                <p>
                  Your privacy is important to us. Our collection, use, and
                  protection of your personal information is governed by our
                  Privacy Policy, which is incorporated into these Terms by
                  reference.
                </p>
                <p>
                  By using our Service, you consent to the collection and use of
                  your information as described in our Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <p>
                  The Service and its original content, features, and
                  functionality are owned by DrawnZones and are protected by
                  international copyright, trademark, patent, trade secret, and
                  other intellectual property laws.
                </p>
                <p>You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Copy, modify, or distribute our content without permission
                  </li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Remove or alter any copyright notices</li>
                  <li>Use our trademarks without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Service Availability
              </h2>
              <div className="space-y-4">
                <p>
                  While we strive to provide reliable service, we do not
                  guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uninterrupted or error-free operation</li>
                  <li>That the Service will meet your specific requirements</li>
                  <li>That defects will be corrected immediately</li>
                  <li>Compatibility with all devices or software</li>
                </ul>
                <p>
                  We may perform maintenance, updates, or modifications that
                  temporarily affect Service availability.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Limitation of Liability
              </h2>
              <div className="space-y-4">
                <p>
                  To the maximum extent permitted by law, DrawnZones shall not
                  be liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Any indirect, incidental, special, or consequential damages
                  </li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from service interruptions</li>
                  <li>Actions or omissions of third parties</li>
                </ul>
                <p>
                  Our total liability shall not exceed the amount you paid for
                  the Service in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. Termination
              </h2>
              <div className="space-y-4">
                <p>
                  You may terminate your account at any time by contacting us or
                  using account deletion features.
                </p>
                <p>
                  We may terminate or suspend your account immediately, without
                  notice, if you violate these Terms or for any other reason at
                  our sole discretion.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease,
                  and we may delete your account and associated data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. Governing Law
              </h2>
              <div className="space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of [Your Jurisdiction], without regard to
                  conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the
                  Service shall be resolved through binding arbitration or in
                  the courts of [Your Jurisdiction].
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
