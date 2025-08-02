"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="text-[#41A5A5]">SimuPOS</span> - Complete Business Solution
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl leading-relaxed">
                Transform your business with our comprehensive POS system. From mobile sales tracking to full desktop
                management - perfect for Ugandan shops, restaurants, and enterprises.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="bg-[#41A5A5] hover:bg-[#2E8B8B] text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-[#41A5A5] text-[#41A5A5] hover:bg-[#41A5A5] hover:text-white bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#41A5A5]">500+</div>
                <div className="text-sm text-gray-600">Active Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#41A5A5]">30%</div>
                <div className="text-sm text-gray-600">Sales Increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#41A5A5]">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-[500px] h-[400px] bg-gradient-to-br from-[#41A5A5] to-[#2E8B8B] rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">📱💻</div>
                  <div className="text-xl font-semibold">Mobile + Desktop</div>
                  <div className="text-sm opacity-90">Complete POS Solution</div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-green-500 font-semibold">+30% Sales</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-blue-500 font-semibold">Offline Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
