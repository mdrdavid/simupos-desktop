/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState, type QrcodeSuccessCallback, type QrcodeErrorCallback } from "html5-qrcode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle } from "lucide-react";

interface QrCodeScannerProps {
  onScanSuccess: QrcodeSuccessCallback;
  onScanFailure: QrcodeErrorCallback;
}

const QrCodeScanner = ({ onScanSuccess, onScanFailure }: QrCodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);
  const scannerContainerId = "qr-code-reader";
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const stableOnScanSuccess = useCallback(onScanSuccess, []);
  const stableOnScanFailure = useCallback(onScanFailure, []);

  const requestCameraPermission = async () => {
    try {
      setIsRequestingPermission(true);
      setPermissionError(null);
      
      // Check permission state first
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'denied') {
            setPermissionError("Camera permission denied. Please enable camera access in your browser settings and refresh the page.");
            return;
          }
        } catch {
          // Permission query not supported, continue
        }
      }
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      
      // Stop stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Initialize scanner
      isInitializedRef.current = false;
      await initializeScanner();
    } catch (error: any) {
      const errorMessages = {
        'NotAllowedError': "Camera permission denied. Please enable camera access in your browser settings.",
        'NotFoundError': "No camera found. Please connect a camera and try again.",
        'NotReadableError': "Camera is already in use by another application.",
        'OverconstrainedError': "Camera constraints could not be satisfied. Please try again."
      };
      
      setPermissionError(errorMessages[error.name as keyof typeof errorMessages] || 
        "Failed to access camera. Please try again.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const initializeScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId, false);
      }

      const qrCodeScanner = scannerRef.current;
      const currentState = qrCodeScanner.getState();

      if (currentState !== Html5QrcodeScannerState.SCANNING && !isInitializedRef.current) {
        isInitializedRef.current = true;
        
        await qrCodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          stableOnScanSuccess,
          stableOnScanFailure
        );
      }
    } catch (err: any) {
      isInitializedRef.current = false;
      
      // Handle permission denied errors without console spam
      if (err.toString().includes('Permission denied') || 
          err.toString().includes('NotAllowedError') ||
          err.name === 'NotAllowedError') {
        setPermissionError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === 'NotFoundError' || err.toString().includes('NotFoundError')) {
        setPermissionError("No camera found. Please connect a camera and try again.");
      } else if (err.name === 'NotReadableError' || err.toString().includes('NotReadableError')) {
        setPermissionError("Camera is already in use by another application.");
      } else {
        setPermissionError("Failed to start camera. Please try again.");
        console.error("Failed to start QR code scanner.", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !permissionError) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {
          isInitializedRef.current = false;
        });
      }
    };
  }, [stableOnScanSuccess, stableOnScanFailure, permissionError]);

  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Alert className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
        <div className="flex flex-col space-y-2 w-full">
          <Button 
            onClick={requestCameraPermission}
            disabled={isRequestingPermission}
            className="flex items-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>{isRequestingPermission ? "Requesting..." : "Grant Camera Access"}</span>
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                setPermissionError(null);
                isInitializedRef.current = false;
              }}
              className="text-sm flex-1"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-sm flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div id={scannerContainerId} style={{ width: "100%", height: "100%" }} />;
};

export default QrCodeScanner;