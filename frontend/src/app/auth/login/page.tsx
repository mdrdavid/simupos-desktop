/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import Image from "next/image";
import logo from "@/public/images/simupos.png";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const router = useRouter();

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      toast({
        title: "Error",
        description: "Please enter both phone number and PIN",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Error",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login({ phone: phoneNumber, pin });

      if (success) {
        toast({
          title: "Success",
          description: "Login successful",
        });
        router.push("/dashboard"); // Navigate to dashboard after successful login
      } else {
        toast({
          title: "Error",
          description: "Invalid phone number or PIN",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-8">
            <div className=" bg-white rounded-full border-2 border-white overflow-hidden mb-4">
              <Image
                src={logo}
                alt="SimuPOS Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="tel"
                placeholder="Phone Number (256XXXXXXXXX)"
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPin ? "text" : "password"}
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="pl-10"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPin ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="text-right">
              <button
                onClick={() => router.push("/auth/pin-setup")}
                className="text-sm text-[#41A5A5] hover:underline"
              >
                Forgot PIN?
              </button>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#41A5A5] hover:bg-[#338888] h-12"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/auth/register")}
              className="w-full border-[#41A5A5] text-[#41A5A5] hover:bg-[#41A5A5]/10 h-12"
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
