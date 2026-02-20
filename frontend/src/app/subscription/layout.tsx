import React from "react";

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.02)_25%,rgba(68,68,68,.02)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.02)_75%)] bg-[length:10px_10px]"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div
        className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-10 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                SimuPOS Subscription Portal
              </span>
            </div>

            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-teal-700 to-blue-800 bg-clip-text text-transparent mb-4">
                Manage Your Business Growth
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Choose the perfect plan that scales with your business needs and
                budget
              </p>
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-200/60 shadow-2xl overflow-hidden">
            {/* Decorative Header Bar */}
            <div className="h-2 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500"></div>

            <div className="p-8 md:p-12">{children}</div>

            {/* Footer */}
            <div className="border-t border-gray-200/60 bg-gray-50/50 px-8 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Instant Activation</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  © {new Date().getFullYear()} SimuPOS. All rights reserved.
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <span className="text-sm font-medium text-gray-600">
                Trusted by 50+ Ugandan Businesses
              </span>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>✓ UGX 2B+ Processed</span>
                <span>✓ 99.9% Uptime</span>
                <span>✓ Local Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Optimized Background */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/50 to-transparent"></div>
    </div>
  );
}
