"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Car, Play, ParkingCircle, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#41A5A5] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2E8B8B] rounded-full blur-[120px]" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit border-[#41A5A5] text-[#41A5A5] px-4 py-1 bg-[#41A5A5]/5">
                The #1 POS Solution in Uganda
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-tight">
                Empower Your <span className="text-[#41A5A5]">Business</span> with <span className="text-[#2E8B8B]">SimuPOS</span>
              </h1>

              <p className="max-w-[600px] text-gray-600 md:text-xl leading-relaxed">
                Transform how you sell, track, and grow. A complete mobile and desktop POS system designed for modern retailers, pharmacies, and restaurants etc.
              </p>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#41A5A5]" />
                  <span className="text-gray-700 font-medium">No Monthly Fees — Annual Renewal Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#41A5A5]" />
                  <span className="text-gray-700 font-medium">Offline Mode — Sell Anywhere, Anytime</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-[#2E8B8B] hover:bg-[#41A5A5] text-white px-8 h-14 text-lg shadow-lg hover:shadow-[#41A5A5]/20 transition-all"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 bg-white px-8 h-14 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5 fill-[#41A5A5] text-[#41A5A5]" />
                    Watch Demo
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>SimuPOS Demo</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      // src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="SimuPOS Demo Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Specialized Solutions */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Specialized Solutions</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/landing/washing-bay">
                  <Button variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                    <Car className="mr-2 h-4 w-4" />
                    Washing Bay
                  </Button>
                </Link>
                <Link href="/landing/night-parking">
                  <Button variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100">
                    <ParkingCircle className="mr-2 h-4 w-4" />
                    Night Parking
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Content - POS Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
                alt="Modern POS System"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E8B8B]/60 to-transparent flex flex-col justify-end p-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-[280px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-900">Real-time Sales</span>
                  </div>
                  <div className="text-2xl font-black text-[#2E8B8B]">UGX 2.4M</div>
                  <div className="text-xs text-green-600 font-semibold">+12% from yesterday</div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-6 bg-white p-4 rounded-xl shadow-xl hidden md:flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-[#41A5A5] rounded-full flex items-center justify-center text-white">
                  📱
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500">Mobile Ready</div>
                  <div className="text-sm font-bold text-gray-900">iOS & Android</div>
                </div>
              </motion.div>
            </div>

            {/* Background pattern */}
            <div className="absolute -bottom-6 -right-6 -z-10 w-64 h-64 bg-[#41A5A5]/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>

      {/* Trust Badges / Stats */}
      <div className="container px-4 md:px-6 mt-20">
        <div className="py-10 border-y border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-[#2E8B8B]">100+</div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Happy Businesses</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-[#2E8B8B]">1M+</div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Transactions</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-[#2E8B8B]">99.9%</div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Uptime</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-[#2E8B8B]">24/7</div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Local Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
