/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  UserPlus,
  Sparkles,
  Shield,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/images/simupos.png";
import { cn } from "@/lib/utils";
import { getDashboardUrl } from "@/src/utils/dashboardUtils";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and PIN",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ phone: phoneNumber, pin });

      if (result.success) {
        setIsRedirecting(true);
        toast({
          title: "🎉 Welcome Back!",
          description: "Login successful. Redirecting to your dashboard...",
          className: "bg-green-50 border-green-200",
        });

        if (result.businessData && result.businessData.businessType) {
          const businessType = result.businessData.businessType;
          const dashboardUrl = getDashboardUrl(businessType);
          router.push(dashboardUrl);
        } else {
          router.push("/sales/pos");
        }
      } else {
        setIsLoading(false);
        toast({
          title: "Login Failed",
          description: "Invalid phone number or PIN. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description:
          "Unable to connect. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const formatPhoneNumber = (text: string) => {
    // eslint-disable-next-line prefer-const
    let cleaned = text.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+")) {
      const countryCode = cleaned.substring(0, 4);
      const rest = cleaned.substring(4).replace(/\D/g, "");

      if (rest.length <= 3) return `${countryCode} ${rest}`;
      if (rest.length <= 6)
        return `${countryCode} ${rest.substring(0, 3)} ${rest.substring(3)}`;
      return `${countryCode} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 9)}`;
    } else {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50/30 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-2xl blur-md opacity-30"></div>
              <div className="relative bg-white rounded-2xl border-2 border-white shadow-lg p-3">
                <Image
                  src={logo}
                  alt="SimuPOS Logo"
                  width={140}
                  height={140}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-center">
              Sign in to access your business dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300",
                    focusedField === "phone" ? "text-teal-500" : "text-gray-400"
                  )}
                >
                  <Phone className="h-5 w-5" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+256 XXX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "h-12 pl-10 border-2 transition-all duration-300 rounded-xl",
                    focusedField === "phone"
                      ? "border-teal-300 bg-teal-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white/80"
                  )}
                />
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <label
                htmlFor="pin"
                className="text-sm font-medium text-gray-700"
              >
                4-Digit PIN
              </label>
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300",
                    focusedField === "pin" ? "text-teal-500" : "text-gray-400"
                  )}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter your 4-digit PIN"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  onFocus={() => setFocusedField("pin")}
                  onBlur={() => setFocusedField(null)}
                  onKeyPress={handleKeyPress}
                  maxLength={4}
                  className={cn(
                    "h-12 pl-10 pr-12 border-2 transition-all duration-300 rounded-xl text-center tracking-widest font-semibold text-lg",
                    focusedField === "pin"
                      ? "border-teal-300 bg-teal-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white/80"
                  )}
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className={cn(
                    "absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300",
                    focusedField === "pin"
                      ? "text-teal-500"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Enter your 4-digit security PIN
              </p>
            </div>

            {/* Forgot PIN */}
            <div className="text-right">
              <button
                onClick={() => router.push("/auth/pin-setup")}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200 flex items-center justify-end space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span>Forgot PIN?</span>
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={
                isLoading || isRedirecting || !phoneNumber || pin.length !== 4
              }
              className={cn(
                "w-full h-12 text-lg font-semibold transition-all duration-300 rounded-xl",
                phoneNumber && pin.length === 4
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isRedirecting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Redirecting...
                </>
              ) : isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/95 px-4 text-sm text-gray-500">
                  New to SimuPOS?
                </span>
              </div>
            </div>

            {/* Create Account Button */}
            {/* Create Account Button - Updated */}
            <Button
              variant="outline"
              disabled
              className="w-full h-auto min-h-12 border-2 border-gray-300 text-gray-700 bg-gray-50 cursor-not-allowed transition-all duration-300 rounded-xl font-medium py-3 px-4"
            >
              {/* <UserPlus className="h-5 w-5 flex-shrink-0 mr-2" /> */}
              <div className="flex flex-col xs:flex-row items-center gap-1 text-center xs:text-left">
                <span className="text-sm sm:text-base whitespace-nowrap">
                  Contact to Sign Up:
                </span>
                <span className="font-bold text-teal-600 text-sm sm:text-base whitespace-nowrap">
                  256702629361
                </span>
              </div>
            </Button>

            {/* <Button
              variant="outline"
              onClick={() => router.push("/auth/register")}
              className="w-full h-12 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 transition-all duration-300 rounded-xl group"
            >
              <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Create New Account
            </Button> */}

            {/* Support Info */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                <Smartphone className="h-3 w-3" />
                <span>Need help? Contact support: 0702629361</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure login powered by SimuPOS Business Suite
          </p>
        </div>
      </div>
    </div>
  );
}
