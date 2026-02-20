"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download, Smartphone, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
      );
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      deferredPromptRef.current = event;

      // Show prompt after a short delay when the event is captured
      setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-prompt-dismissed");
        if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
           setShowPrompt(true);
        }
      }, 3000);
    };

    const handleShowCustomPrompt = () => {
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("show-pwa-install-prompt", handleShowCustomPrompt);

    // Fallback for browsers that don't support beforeinstallprompt (like Safari)
    const fallbackTimer = setTimeout(() => {
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      const standalone = checkStandalone();

      if (!standalone && !deferredPromptRef.current) {
        if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
          setShowPrompt(true);
        }
      }
    }, 6000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("show-pwa-install-prompt", handleShowCustomPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        deferredPromptRef.current = null;
        setShowPrompt(false);
      }
    } else {
      // Fallback: Link to Play Store
      window.open("https://play.google.com/store/apps/details?id=com.greendavid.SimuPOS", "_blank");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 right-4 md:right-6 z-[100] w-[calc(100%-2rem)] max-w-[350px]"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 p-5 relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#41A5A5]/10 rounded-full blur-2xl group-hover:bg-[#41A5A5]/20 transition-colors duration-500" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="bg-gradient-to-br from-[#41A5A5] to-[#2E8B8B] p-2.5 rounded-xl text-white shadow-lg">
                <Smartphone size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                <div className="bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
            </div>

            <div className="flex-1 pr-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                SimuPOS Mobile
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                Install our app for a faster, smoother experience and offline access.
              </p>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handleInstall}
                  className="w-full bg-[#2E8B8B] hover:bg-[#41A5A5] text-white rounded-xl py-2 h-9 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Download size={16} />
                  {deferredPrompt ? "Install App" : "Get on Play Store"}
                </Button>

                {!deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-[#2E8B8B] transition-colors"
                  >
                    <Play size={10} fill="currentColor" />
                    Available on Android
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logo watermark */}
          <div className="absolute bottom-[-10px] right-[-10px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
             <Image src="/images/simupos-primary.png" alt="" width={100} height={100} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
