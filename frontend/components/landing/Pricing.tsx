"use client";

import { CheckIcon, Globe, Server, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Pricing() {
  const subscriptionPlans = [
    {
      name: "Mobile Starter",
      price: "UGX 40,000",
      period: "/month",
      features: [
        "Mobile POS app",
        "Cash sales tracking",
        "Basic daily reports",
        "SMS receipts",
        "Offline mode",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Business Pro",
      price: "UGX 50,000",
      period: "/month",
      popular: true,
      features: [
        "Everything in Starter",
        "Desktop POS system",
        "Mobile Money integration",
        "Inventory management",
        "Multi-user access (3 staff)",
        "Advanced reports",
        "WhatsApp receipts",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: "UGX 100,000",
      period: "/month",
      features: [
        "Everything in Pro",
        "Multi-branch management",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated support",
        "Staff training included",
      ],
      cta: "Contact Sales",
    },
  ];

  const oneTimePlans = [
    {
      name: "Essential - Self Service",
      icon: <Wrench className="h-8 w-8 text-[#2E8B8B]" />,
      initialPrice: "UGX 400,000",
      annualPrice: "UGX 200,000",
      description: "Per Single computer",
      features: [
        "Business support: Various",
        "Supports MySQL/Maria database",
        "Includes all enterprise modules/features listed on the features page",
        "Smart Boss Web Reports",
        "24/7 remote assistance",
      ],
      cta: "Get Essential",
      popular: false,
    },
    {
      name: "PLUS - Enterprise",
      icon: <Server className="h-8 w-8 text-[#41A5A5]" />,
      initialPrice: "UGX 1,500,000",
      annualPrice: "UGX 400,000",
      description: "Supports 3 computers on LAN",
      features: [
        "Supports MariaDB database",
        "Manage multiple locations or branches on Cloud server",
        "Business Support: Various",
        "Includes all enterprise modules/features listed on the features page",
        "Access to Smart Boss Web Reports",
      ],
      cta: "Get PLUS",
      popular: true,
    },
    {
      name: "Custom Development",
      icon: <Globe className="h-8 w-8 text-[#F59E0B]" />,
      initialPrice: "Custom Quote",
      annualPrice: "Negotiable",
      description: "Tailored to your business needs",
      features: [
        "Supports MariaDB database",
        "Manage multiple business branches via VPS/Cloud server",
        "Business Support: Various",
        "Includes all enterprise modules/features listed on the features page",
        "Access to Smart Boss Web Reports",
        "3 days Staff Training plus installation support",
      ],
      cta: "Contact Us",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Flexible pricing for businesses of all sizes
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-[#41A5A5]">
            💳 Monthly Subscription Plans
          </h3>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border p-6 shadow-sm ${
                  plan.popular
                    ? "border-[#41A5A5] ring-2 ring-[#41A5A5]"
                    : "border-gray-200"
                } bg-white`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#41A5A5]">
                    Most Popular
                  </Badge>
                )}

                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#41A5A5] mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#41A5A5] hover:bg-[#2E8B8B]"
                        : "bg-gray-900 hover:bg-gray-800"
                    } text-white`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            No hidden fees • Cancel anytime • Instant activation
          </p>
        </div>

        {/* One-time Purchase Plans */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 text-[#2E8B8B]">
            💰 One-Time Purchase Plans
          </h3>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-8">
            {oneTimePlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border p-6 shadow-sm ${
                  plan.popular
                    ? "border-[#41A5A5] ring-2 ring-[#41A5A5]"
                    : "border-gray-200"
                } bg-white`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#41A5A5]">
                    Most Popular
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">{plan.icon}</div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline">
                      <span className="text-sm text-gray-600">
                        Initial Charge -{" "}
                      </span>
                      <span className="text-2xl font-bold text-[#2E8B8B]">
                        {plan.initialPrice}
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-sm text-gray-600">
                        Annual Maintenance -{" "}
                      </span>
                      <span className="text-lg font-semibold text-gray-700">
                        {plan.annualPrice}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#2E8B8B] mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#41A5A5] hover:bg-[#2E8B8B]"
                        : plan.name === "Custom Development"
                          ? "bg-[#F59E0B] hover:bg-[#D97706]"
                          : "bg-[#2E8B8B] hover:bg-[#1F5F5F]"
                    } text-white`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              One-time purchase includes lifetime license with annual
              maintenance for updates and support.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>✓ No monthly fees</span>
              <span>✓ Lifetime ownership</span>
              <span>✓ Local installation</span>
              <span>✓ Full data control</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
