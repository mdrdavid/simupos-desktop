"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessCategories } from "@/src/constants/business-categories";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  Mail,
  User,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/images/simupos.png";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [businessType, setBusinessType] = useState<string | undefined>(
    undefined
  );
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!phoneNumber || !pin || !confirmPin) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

    if (pin !== confirmPin) {
      toast({
        title: "Error",
        description: "PINs do not match",
        variant: "destructive",
      });
      return;
    }

    let formattedPhone = phoneNumber.replace(/[^\d]/g, "");
    if (formattedPhone.startsWith("256")) {
      formattedPhone = `+${formattedPhone}`;
    } else if (formattedPhone.startsWith("0")) {
      formattedPhone = `+256${formattedPhone.substring(1)}`;
    } else if (!formattedPhone.startsWith("+256")) {
      formattedPhone = `+256${formattedPhone}`;
    }

    if (!/^\+256[0-9]{9}$/.test(formattedPhone)) {
      toast({
        title: "Error",
        description:
          "Please enter a valid Ugandan phone number (e.g., 0711000000 or 256711000000)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        firstName,
        lastName,
        email,
        phone: formattedPhone,
        pin,
        password: pin.repeat(2),
        businessType,
      });

      if (
        result.success ||
        (result.message &&
          result.message.includes(
            "User registered successfully. Please verify your phone number."
          ))
      ) {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setPin("");
        setConfirmPin("");
        setBusinessType(undefined);
        setCurrentStep(3); // Show success step
        setTimeout(() => {
          router.push(`/auth/login`);
        }, 2000);
      } else {
        toast({
          title: "Error",
          description:
            result.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && firstName && lastName && email) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? "bg-[#41A5A5] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 2 && (
            <div
              className={`w-12 h-1 mx-2 ${
                currentStep > step ? "bg-[#41A5A5]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Tell us about yourself
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <Button
              onClick={nextStep}
              disabled={!firstName || !lastName || !email}
              className="w-full bg-[#41A5A5] hover:bg-[#338888] h-12 mt-6"
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Account Setup
              </h2>
              <p className="text-gray-600 text-sm mt-1">Secure your account</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="tel"
                placeholder="Phone Number (256XXXXXXXXX) *"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={15}
                className="pl-10 h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="4-digit PIN *"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  maxLength={4}
                  className="pl-10 h-12"
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showConfirmPin ? "text" : "password"}
                  placeholder="Confirm PIN *"
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  maxLength={4}
                  className="pl-10 h-12"
                />
                <button
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Select onValueChange={setBusinessType} value={businessType}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((category) => (
                  <SelectItem key={category.type} value={category.type}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleRegister}
                disabled={isLoading || !phoneNumber || !pin || !confirmPin}
                className="flex-1 bg-[#41A5A5] hover:bg-[#338888] h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center animate-fade-in py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Redirecting to
              login...
            </p>
            <div className="w-8 h-8 border-4 border-[#41A5A5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={prevStep}
              className="self-start mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div className="bg-white rounded-full border-4 border-white shadow-md overflow-hidden mb-4">
              <Image
                src={logo}
                alt="SimuPOS Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600 text-sm mt-1">
              Join thousands of businesses using SimuPOS
            </p>
          </div>

          {/* Step Indicator */}
          {currentStep < 3 && renderStepIndicator()}

          {/* Form Content */}
          {renderStepContent()}

          {/* Footer Links */}
          {currentStep < 3 && (
            <div className="text-center text-sm text-gray-600 mt-6 pt-4 border-t">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-[#41A5A5] font-medium hover:underline transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="text-center text-xs text-gray-500 mt-4">
          🔒 Your data is securely encrypted and protected
        </div>
      </div>
    </div>
  );
}
