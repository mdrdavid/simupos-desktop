"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Delete, ArrowLeft, CheckCircle, Shield } from "lucide-react";

const PINSetupScreen = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (pathname.includes("change-pin")) {
      setIsChangingPin(true);
    }
  }, [pathname]);

  const handlePinInput = (digit: string) => {
    if (error) {
      setError("");
      setShake(false);
    }

    if (!isConfirming) {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);

        // Auto-advance to confirmation when PIN is complete
        if (newPin.length === 4) {
          setTimeout(() => setIsConfirming(true), 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin((prev) => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (error) {
      setError("");
      setShake(false);
    }

    if (!isConfirming) {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isConfirming) {
      setPin("");
    } else {
      setConfirmPin("");
    }
  };

  const triggerError = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  useEffect(() => {
    if (isConfirming && confirmPin.length === 4) {
      if (pin === confirmPin) {
        console.log("PIN set successfully:", pin);
        // savePinToSecureStorage(pin); // Optional: Add your logic here
        handleSuccess();
      } else {
        triggerError("PINs do not match. Please try again.");
        setTimeout(() => {
          setPin("");
          setConfirmPin("");
          setIsConfirming(false);
        }, 1000);
      }
    }
  }, [confirmPin, pin, isConfirming]);

  const renderPinDots = (value: string, isActive: boolean) => {
    return (
      <div
        className={`flex gap-4 my-8 transition-all duration-300 ${shake ? "animate-shake" : ""}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full transition-all duration-300 ${
              value.length > i
                ? "bg-gradient-to-br from-blue-600 to-cyan-500 scale-110"
                : "bg-gray-200"
            } ${
              isActive && value.length === i
                ? "ring-2 ring-blue-500 ring-offset-2"
                : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const renderKeypadButton = (digit: string, index: number) => {
    if (digit === "") return <div key={index} className="opacity-0" />;

    if (digit === "del") {
      return (
        <button
          key={index}
          onClick={handleDelete}
          className="flex items-center justify-center p-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 border border-gray-300"
        >
          <Delete className="h-7 w-7 text-gray-700" />
        </button>
      );
    }

    if (digit === "clear") {
      return (
        <button
          key={index}
          onClick={handleClear}
          className="flex items-center justify-center p-5 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 border border-red-300 text-red-700 font-semibold text-sm"
        >
          Clear
        </button>
      );
    }

    return (
      <button
        key={index}
        onClick={() => handlePinInput(digit)}
        className="text-2xl font-bold p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      >
        {digit}
      </button>
    );
  };

  const renderKeypad = () => {
    const digits = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "clear",
      "0",
      "del",
    ];

    return (
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-8">
        {digits.map(renderKeypadButton)}
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            PIN {isChangingPin ? "Changed" : "Set"} Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your PIN has been {isChangingPin ? "updated" : "set"} successfully.
          </p>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-2">
          <button
            onClick={() => router.back()}
            className="self-start p-2 rounded-xl hover:bg-gray-100 transition-colors absolute"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isChangingPin ? "Change PIN" : "Set Up Your PIN"}
          </h1>
          <p className="text-gray-600 mb-1">
            {isConfirming ? "Confirm your 4-digit PIN" : "Create a 4-digit PIN"}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure and encrypted</span>
          </div>
        </div>

        {/* PIN Display */}
        <div className="text-center">
          {renderPinDots(isConfirming ? confirmPin : pin, !isConfirming)}

          <div className="h-12 flex items-center justify-center">
            {error && (
              <p className="text-red-500 font-medium animate-fade-in bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                !isConfirming ? "bg-blue-500 scale-125" : "bg-gray-300"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isConfirming ? "bg-blue-500 scale-125" : "bg-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Keypad */}
        {renderKeypad()}

        {/* Helper Text */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Use this PIN to secure your account and authorize transactions</p>
        </div>
      </div>
    </div>
  );
};

export default PINSetupScreen;
