"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Users,
  TrendingUp,
  Shield,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  ArrowLeft,
  ParkingCircle,
  DollarSign,
  MapPin,
  Droplets,
} from "lucide-react";
import Link from "next/link";

export default function NightParkingLandingPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email submitted:", email);
  };

  const features = [
    {
      icon: Car,
      title: "Vehicle Check-in/out",
      description:
        "Digital parking tickets, auto fee calculation, and slot management",
    },
    {
      icon: DollarSign,
      title: "Dynamic Pricing",
      description: "Nightly, hourly, weekly, and monthly rates with discounts",
    },
    {
      icon: MapPin,
      title: "Slot Management",
      description: "Smart slot allocation and real-time occupancy tracking",
    },
    {
      icon: Users,
      title: "Worker Commissions",
      description: "Auto calculation of commissions with performance reports",
    },
    {
      icon: Shield,
      title: "Damage Recording",
      description: "Document vehicle condition with photos and notes",
    },
    {
      icon: TrendingUp,
      title: "Real-time Reporting",
      description:
        "Occupancy rates, revenue analytics, and financial summaries",
    },
  ];

  const challenges = [
    {
      challenge: "Manual Parking Recording",
      impact: "Lost tickets, cash leakage",
      solution: "Digital parking tickets and secure payment tracking",
    },
    {
      challenge: "No Slot Management",
      impact: "Poor space utilization",
      solution: "Smart slot allocation and occupancy tracking",
    },
    {
      challenge: "No Damage Tracking",
      impact: "Disputes, liability issues",
      solution: "Vehicle condition documentation with photos",
    },
    {
      challenge: "Complex Pricing",
      impact: "Revenue loss, pricing errors",
      solution: "Dynamic pricing with multiple rate types",
    },
    {
      challenge: "No Staff Accountability",
      impact: "Commission disputes",
      solution: "Auto worker commission tracking",
    },
  ];

  const benefits = [
    {
      icon: Smartphone,
      title: "Mobile-First",
      description: "Works on any device, designed for attendants",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live occupancy and revenue tracking",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Vehicle tracking and damage documentation",
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimization",
      description: "Dynamic pricing and occupancy management",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/5 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative py-10 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Back Button and Washing Bay Button Container */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Back Button */}
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to SimuPOS Home
                </Button>
              </Link>

              {/* Washing Bay Button */}
              <Link href="/landing/washing-bay" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-teal-600 hover:from-brand-secondary hover:to-teal-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Droplets className="mr-2 h-4 w-4 sm:mr-3 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">
                    Washing Bay System
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:ml-3 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-brand-primary/10 text-brand-primary px-4 py-1 text-sm">
                Smart Parking Management
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your{" "}
                <span className="text-brand-primary">Night Parking</span> Operations
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                The complete night parking management solution designed to
                automate vehicle tracking, optimize space utilization, and
                maximize revenue through smart pricing and real-time monitoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button className="bg-brand-primary hover:bg-brand-secondary text-white text-lg px-8 py-4 shadow-lg hover:shadow-brand-primary/25 transition-all">
                    <ArrowRight className="ml-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <span>4.8/5 Rating</span>
                </div>
                <span>•</span>
                <span>100+ Parking Yards Transformed</span>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300 border border-gray-100">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">
                      Today&apos;s Parking Summary
                    </h3>
                    <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                      Live
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">18</div>
                      <div className="text-teal-100 text-sm">
                        Vehicles Parked
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">Ugx 420,000</div>
                      <div className="text-teal-100 text-sm">Revenue</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        type: "SUV Overnight",
                        amount: "Ugx 50,000",
                        status: "parked",
                      },
                      {
                        type: "Sedan Hourly",
                        amount: "Ugx 15,000",
                        status: "checked_out",
                      },
                      {
                        type: "Truck Monthly",
                        amount: "Ugx 300,000",
                        status: "parked",
                      },
                    ].map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                      >
                        <div>
                          <div className="font-medium">{record.type}</div>
                          <div className="text-teal-100 text-sm">
                            {record.amount}
                          </div>
                        </div>
                        <Badge
                          className={
                            record.status === "checked_out"
                              ? "bg-green-500"
                              : record.status === "overdue"
                                ? "bg-red-500"
                                : "bg-brand-primary"
                          }
                        >
                          {record.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg">
                <ParkingCircle className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-4 rounded-xl shadow-lg">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges & Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Stop Losing Parking Revenue
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Night parking operations lose revenue due to manual tracking, poor
              space utilization, and lack of real-time monitoring. SimuPOS
              solves these core problems.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Common Parking Challenges
              </h3>
              {challenges.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow bg-white border-gray-100"
                >
                  <CardContent className="p-0">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {item.challenge}
                    </h4>
                    <p className="text-red-600 text-sm mb-2">{item.impact}</p>
                    <div className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {item.solution}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">
                Parking Dashboard Preview
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Real-time Occupancy</span>
                    <Badge variant="secondary" className="bg-green-500">
                      85% Full
                    </Badge>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-full bg-green-400 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">92%</div>
                    <div className="text-teal-100">Revenue Accuracy</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">60%</div>
                    <div className="text-teal-100">Time Saved</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>Space Utilization</span>
                    <span className="text-green-400">+35%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-brand-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Night Parking Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SimuPOS combines all necessary modules into a single platform for
              total parking management control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-primary transition-colors">
                    <feature.icon className="h-8 w-8 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why SimuPOS for Parking Management
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join hundreds of parking yards that have transformed their
                operations with our comprehensive solution.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-8 text-white shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100+</div>
                <div className="text-green-200 text-lg mb-6">
                  Parking Yards Transformed
                </div>

                <div className="space-y-4">
                  {[
                    { metric: "Revenue Increase", value: "45%", change: "+" },
                    {
                      metric: "Space Utilization",
                      value: "60%",
                      change: "+",
                    },
                    { metric: "Operational Errors", value: "85%", change: "-" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span>{stat.metric}</span>
                        <span className="text-2xl font-bold">
                          {stat.change}
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Transform Your Night Parking?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              SimuPOS can digitize your parking yard in hours. Start your
              journey to better management today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 w-full"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/70 flex-1"
                  required
                />

                <Link href="/auth/login">
                  <Button className="bg-brand-primary hover:bg-brand-secondary text-white">
                    Get Started Today
                  </Button>
                </Link>
              </form>
            </div>

            <p className="text-teal-200 text-sm mt-4">
              No credit card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
