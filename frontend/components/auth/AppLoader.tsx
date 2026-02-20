"use client";

import React from "react";

export const AppLoader = ({
  message = "Starting SimuPOS...",
  showProgress = false,
  size = "lg",
  variant = "default",
}: {
  message?: string;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pos" | "payment";
}) => {
  const sizeClasses = {
    sm: "h-16 w-16 border-t-4 border-b-4",
    md: "h-24 w-24 border-t-6 border-b-6",
    lg: "h-32 w-32 border-t-8 border-b-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // POS-specific variants
  const variantConfigs = {
    default: {
      primaryColor: "#059669", // emerald-600
      secondaryColor: "#10b981", // emerald-500
      gradient: "from-emerald-600 to-emerald-500",
      bgGradient: "from-slate-50 to-emerald-50/30",
    },
    pos: {
      primaryColor: "#2563eb", // blue-600
      secondaryColor: "#3b82f6", // blue-500
      gradient: "from-blue-600 to-blue-500",
      bgGradient: "from-slate-50 to-blue-50/30",
    },
    payment: {
      primaryColor: "#7c3aed", // violet-600
      secondaryColor: "#8b5cf6", // violet-500
      gradient: "from-violet-600 to-violet-500",
      bgGradient: "from-slate-50 to-violet-50/30",
    },
  };

  const config = variantConfigs[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${config.bgGradient}`}
    >
      {/* Main loader container */}
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        {/* POS Brand Area */}
        <div className="flex flex-col items-center space-y-6">
          {/* Animated POS Terminal */}
          <div className="relative">
            {/* Terminal Body */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700">
              {/* Terminal Screen */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 shadow-inner">
                {/* Animated display */}
                <div className="relative">
                  {/* Screen grid background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-4 gap-2 h-full">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="bg-gray-500 rounded"></div>
                      ))}
                    </div>
                  </div>

                  {/* Loading animation */}
                  <div className="relative z-10">
                    {/* Barcode scanner animation */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-1 w-32 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full animate-pulse shadow-lg"></div>
                    </div>

                    {/* Main spinner */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        {/* Outer terminal ring */}
                        <div
                          className={`${sizeClasses[size]} rounded-full border-4 border-gray-600 shadow-lg`}
                        ></div>

                        {/* Animated scanner ring */}
                        <div
                          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-transparent animate-spin`}
                          style={{
                            background: `conic-gradient(from 0deg, transparent, ${config.primaryColor}, ${config.secondaryColor}, ${config.primaryColor}, transparent)`,
                            mask: "radial-gradient(transparent 45%, black 46%)",
                            WebkitMask:
                              "radial-gradient(transparent 45%, black 46%)",
                          }}
                        ></div>

                        {/* Center display */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center shadow-inner">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status LEDs */}
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div
                        className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-red-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal buttons */}
              <div className="flex justify-center space-x-3 mt-4">
                <div className="h-3 w-3 bg-gray-600 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-600 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Brand logo/text */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div
                className={`h-8 w-8 bg-gradient-to-br ${config.gradient} rounded-lg shadow-md flex items-center justify-center`}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                SimuPOS
              </h2>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Point of Sale System
            </p>
          </div>
        </div>

        {/* Loading content */}
        <div className="text-center space-y-6">
          {/* Animated message */}
          <div className="space-y-4">
            <p
              className={`${textSizes[size]} text-gray-700 font-semibold animate-pulse`}
            >
              {message}
            </p>

            {/* POS-specific animated dots */}
            <div className="flex justify-center space-x-2">
              <div
                className="h-2 w-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>

          {/* Progress indicator (optional) */}
          {showProgress && (
            <div className="w-64 space-y-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"
                  style={{
                    width: "65%",
                    animation:
                      "pulse 2s ease-in-out infinite, progress 3s ease-in-out infinite",
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Initializing...</span>
                <span>65%</span>
              </div>
            </div>
          )}

          {/* System status indicators */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-6">
            {[
              { text: "Database", status: "connected", icon: "💾" },
              { text: "Payment", status: "ready", icon: "💳" },
              { text: "Printer", status: "online", icon: "🖨️" },
              { text: "Network", status: "stable", icon: "🌐" },
            ].map((system, index) => (
              <div
                key={system.text}
                className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <span className="text-lg">{system.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {system.text}
                  </p>
                  <p className="text-xs text-green-600 font-semibold">
                    {system.status}
                  </p>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with POS tips */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500 animate-pulse">
            Preparing your POS terminal...
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure Transactions</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Real-time Sync</span>
            </span>
          </div>
        </div>
      </div>

      {/* Custom styles for POS animations */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 45%;
          }
          50% {
            width: 75%;
          }
          100% {
            width: 45%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scanner-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-scanner {
          animation: scanner-sweep 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// POS-specific inline loader for buttons and actions
export const POSLoader = ({
  size = "sm",
  action = "processing",
}: {
  size?: "sm" | "md" | "lg";
  action?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const actionMessages = {
    processing: "Processing...",
    printing: "Printing...",
    saving: "Saving...",
    connecting: "Connecting...",
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-300 border-t-green-500 animate-spin`}
      ></div>
      <span className="text-sm text-gray-600">
        {actionMessages[action as keyof typeof actionMessages] ||
          actionMessages.processing}
      </span>
    </div>
  );
};

// Payment processing loader
export const PaymentLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Payment terminal animation */}
          <div className="relative">
            <div className="h-20 w-32 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
              <div className="h-12 w-20 bg-gray-700 rounded flex items-center justify-center">
                <div className="h-6 w-12 bg-gradient-to-r from-green-400 to-blue-500 rounded animate-pulse shadow-lg"></div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-gray-600 rounded-full"></div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Processing Payment
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we process your transaction
            </p>

            <div className="flex justify-center space-x-1 pt-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="h-2 w-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
