"use client";

import { CheckIcon, Server, Shield, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Pricing() {
  const annualPlans = [
    {
      name: "Basic",
      icon: <ShoppingCart className="h-8 w-8 text-[#41A5A5]" />,
      initialPrice: "450,000",
      annualPrice: "360,000",
      description: "Perfect for small shops",
      features: [
        "Up to 200 Items",
        "2 User Accounts",
        "Sales Tracking",
        "Basic Inventory",
        "Digital Receipts",
        "Daily Email Reports",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Standard",
      icon: <Zap className="h-8 w-8 text-[#2E8B8B]" />,
      initialPrice: "650,000",
      annualPrice: "450,000",
      description: "Growing businesses",
      features: [
        "Up to 300 Items",
        "3 User Accounts",
        "Everything in Basic",
        "Advanced Inventory",
        "Expense Tracking",
        "SMS Notifications",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Business Pro",
      icon: <Server className="h-8 w-8 text-[#41A5A5]" />,
      initialPrice: "1,200,000",
      annualPrice: "650,000",
      description: "Complete retail solution",
      features: [
        "Up to 600 Items",
        "Up to 5 User Accounts",
        "Everything in Standard",
        "Multi-User Support",
        "Detailed Analytics",
        "24/7 Priority Support",
      ],
      cta: "Get Pro",
      popular: true,
    },
    {
      name: "Enterprise Elite",
      icon: <Shield className="h-8 w-8 text-[#1a5f5f]" />,
      initialPrice: "1,800,000",
      annualPrice: "1,000,000",
      description: "Unlimited power",
      features: [
        "Unlimited Items",
        "Up to 10 User Accounts",
        "Everything in Pro",
        "Custom Feature Requests",
        "Multi-Branch Support",
        "Dedicated Manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the best plan for your business growth. All plans include
            installation and lifetime license with annual maintenance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {annualPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl bg-white ${
                plan.popular
                  ? "border-[#41A5A5] ring-1 ring-[#41A5A5] scale-105 z-10"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#41A5A5] px-4 py-1">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <div className={`p-3 rounded-xl inline-block mb-4 ${
                  plan.popular ? "bg-[#41A5A5]/10" : "bg-gray-100"
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-500">Initial:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.initialPrice}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-500">Renewal:</span>
                    <span className="text-lg font-semibold text-[#2E8B8B]">
                      {plan.annualPrice}
                    </span>
                    <span className="text-sm text-gray-500 font-normal">/year</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  *After first year maintenance
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckIcon className="h-5 w-5 flex-shrink-0 text-[#41A5A5] mr-3 mt-0.5" />
                    <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise Elite" ? "mailto:sales@simupos.com" : "/auth/login"}
                className="mt-auto"
              >
                <Button
                  className={`w-full py-6 text-lg font-semibold rounded-xl transition-all ${
                    plan.popular
                      ? "bg-[#2E8B8B] hover:bg-[#41A5A5] text-white"
                      : "bg-gray-900 hover:bg-black text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">All Plans Include:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2">
              <CheckIcon className="h-4 w-4 text-[#41A5A5]" />
              <span className="text-sm text-gray-600">Free Installation</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckIcon className="h-4 w-4 text-[#41A5A5]" />
              <span className="text-sm text-gray-600">Staff Training</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckIcon className="h-4 w-4 text-[#41A5A5]" />
              <span className="text-sm text-gray-600">Remote Support</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckIcon className="h-4 w-4 text-[#41A5A5]" />
              <span className="text-sm text-gray-600">Offline Mode</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
