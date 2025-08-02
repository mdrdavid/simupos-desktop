"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Delete } from "lucide-react";

const PINSetupScreen = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    if (pathname.includes("change-pin")) {
      setIsChangingPin(true);
    }
  }, [pathname]);

  const handlePinInput = (digit: string) => {
    if (error) setError("");

    if (!isConfirming) {
      if (pin.length < 4) {
        setPin((prev) => prev + digit);
        if (pin.length === 3) {
          setIsConfirming(true);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin((prev) => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (error) setError("");

    if (!isConfirming) {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (isConfirming && confirmPin.length === 4) {
      if (pin === confirmPin) {
        console.log("PIN set successfully:", pin);
        // savePinToSecureStorage(pin); // Optional: Add your logic here
        router.push("/dashboard"); // Or wherever you want to go
      } else {
        setError("PINs do not match. Try again.");
        setPin("");
        setConfirmPin("");
        setIsConfirming(false);
      }
    }
  }, [confirmPin]);

  const renderPinDots = (value: string) => {
    return (
      <div className="flex gap-3 my-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full ${
              value.length > i ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
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
      "",
      "0",
      "del",
    ];

    return (
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-6">
        {digits.map((digit, i) => {
          if (digit === "") return <div key={i} />;
          if (digit === "del") {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="flex items-center justify-center p-4 bg-gray-200 rounded-full"
              >
                <Delete className="h-6 w-6" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handlePinInput(digit)}
              className="text-xl font-bold p-4 bg-gray-200 rounded-full"
            >
              {digit}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <Lock className="h-12 w-12 mb-4 text-black" />
      <h1 className="text-2xl font-semibold mb-2">
        {isChangingPin ? "Change PIN" : "Set Up Your PIN"}
      </h1>
      <p className="text-gray-600">
        {isConfirming ? "Confirm your PIN" : "Enter a 4-digit PIN"}
      </p>

      {renderPinDots(isConfirming ? confirmPin : pin)}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {renderKeypad()}
    </div>
  );
};

export default PINSetupScreen;
