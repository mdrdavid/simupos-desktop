"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Users,
  PieChart,
  CreditCard,
  TrendingUp,
  Shield,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  ArrowLeft,
  Moon,
} from "lucide-react";
import Navigation from "@/components/layout/washing-bay/Navigation";
import { Footer } from "@/components/layout/washing-bay/Footer";
import Link from "next/link";

export default function WashingBayLandingPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email submitted:", email);
  };

  const features = [
    {
      icon: Car,
      title: "Wash Orders & Services",
      description:
        "Digital order entry, service selection, and vehicle tracking",
    },
    {
      icon: Users,
      title: "Worker & Commission",
      description: "Auto calculation of commissions with performance reports",
    },
    {
      icon: PieChart,
      title: "Material & Cost Tracking",
      description: "Track soap, water, and material usage per wash",
    },
    {
      icon: CreditCard,
      title: "Credit Wash Management",
      description: "Record, track, and manage outstanding credit washes",
    },
    {
      icon: TrendingUp,
      title: "Expense & Cash Control",
      description: "Track daily expenses with auto net profit calculation",
    },
    {
      icon: Shield,
      title: "Reporting & Analytics",
      description: "Real-time dashboards and branch analytics",
    },
  ];

  const challenges = [
    {
      challenge: "Manual Wash Recording",
      impact: "Inconsistent totals, cash leakage",
      solution: "Digital wash orders and secure cash control",
    },
    {
      challenge: "No Worker Accountability",
      impact: "Disputes, reduced efficiency",
      solution: "Auto worker commissions and performance tracking",
    },
    {
      challenge: "No Material Tracking",
      impact: "Unknown profit margins",
      solution: "Materials usage tracking and cost analysis",
    },
    {
      challenge: "No Credit Wash Tracking",
      impact: "Lost revenue, poor collections",
      solution: "Credit wash management with automated follow-up",
    },
    {
      challenge: "Poor Visibility",
      impact: "Limited growth, delayed decisions",
      solution: "Real-time dashboards and multi-branch oversight",
    },
  ];

  const benefits = [
    {
      icon: Smartphone,
      title: "Mobile-First & Offline-Capable",
      description: "Works on any device, fully functional without internet",
    },
    {
      icon: Zap,
      title: "Unified Platform",
      description: "All modules work together in one system",
    },
    {
      icon: Users,
      title: "Multi-Branch Ready",
      description: "Centralized oversight for all your locations",
    },
    {
      icon: TrendingUp,
      title: "Accurate Profitability",
      description: "Know your true profit after all costs and commissions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/5 to-white">
      {/* Navigation Component */}
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-10 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Back Button and Night Parking Button Container */}
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

              {/* Night Parking Button */}
              <Link href="/landing/night-parking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-teal-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Moon className="mr-2 h-4 w-4 sm:mr-3 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">
                    Night Parking
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:ml-3 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-brand-primary/10 text-brand-primary px-4 py-1 text-sm">
                Powering Your Washing Bay into the Future
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your{" "}
                <span className="text-brand-primary">Washing Bay</span> Operations
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                The unified, mobile-first management solution designed to
                digitize and optimize every aspect of your washing bay
                operations, from wash orders to worker commissions and real-time
                profitability.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button className="bg-brand-primary hover:bg-brand-secondary text-white text-lg px-8 py-4">
                    <ArrowRight className="ml-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4"
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
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
                <span>•</span>
                <span>50+ Washing Bays Transformed</span>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Today&apos;s Summary</h3>
                    <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                      Live
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-teal-100 text-sm">Wash Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">Ugx 580,000</div>
                      <div className="text-teal-100 text-sm">Revenue</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        service: "Basic Wash",
                        amount: "Ugx 15,000",
                        status: "completed",
                      },
                      {
                        service: "Premium Wash",
                        amount: "Ugx 25,000",
                        status: "in_progress",
                      },
                      {
                        service: "Interior Clean",
                        amount: "Ugx 12,000",
                        status: "pending",
                      },
                    ].map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                      >
                        <div>
                          <div className="font-medium">{order.service}</div>
                          <div className="text-teal-100 text-sm">
                            {order.amount}
                          </div>
                        </div>
                        <Badge
                          className={
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "in_progress"
                                ? "bg-brand-primary"
                                : "bg-yellow-500"
                          }
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg">
                <Users className="h-6 w-6" />
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
              Stop Losing Money Daily
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Washing bays lose money due to lack of proper tracking, weak
              accountability, and poor visibility. SimuPOS solves these core
              problems.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Common Challenges
              </h3>
              {challenges.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {item.challenge}
                    </h4>
                    <p className="text-red-600 text-sm mb-2">{item.impact}</p>
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {item.solution}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">
                SimuPOS Dashboard Preview
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Real-time Analytics</span>
                    <Badge variant="secondary" className="bg-green-500">
                      Live
                    </Badge>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-full bg-green-400 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-teal-100">Accuracy</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">45%</div>
                    <div className="text-teal-100">Time Saved</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span>Worker Performance</span>
                    <span className="text-green-400">+28%</span>
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
              Complete Washing Bay Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SimuPOS combines all necessary modules into a single, seamless
              platform for total control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white"
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
                Why SimuPOS is the Trusted Choice
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join hundreds of washing bays that have transformed their
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

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-green-100 text-lg mb-6">
                  Washing Bays Transformed
                </div>

                <div className="space-y-4">
                  {[
                    { metric: "Revenue Increase", value: "45%", change: "+" },
                    {
                      metric: "Operational Efficiency",
                      value: "60%",
                      change: "+",
                    },
                    { metric: "Error Reduction", value: "85%", change: "-" },
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
              Ready to Transform Your Washing Bay?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              SimuPOS can digitize your washing bay in hours. Start your journey
              to better management today.
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

            <p className="text-teal-100 text-sm mt-4">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
