"use client";

import {
  Smartphone,
  WifiOff,
  DollarSign,
  BarChart2,
  CreditCard,
  Users,
  Package,
  Receipt,
  Globe,
  Shield,
  Zap,
  HeadphonesIcon,
} from "lucide-react";
import simpos from "../../public/images/simuposv1.png";
import Image from "next/image";
export function Features() {
  const mobileFeatures = [
    {
      icon: <Smartphone className="h-8 w-8 text-[#41A5A5]" />,
      title: "Mobile POS",
      desc: "Turn any smartphone into a powerful POS system",
    },
    {
      icon: <WifiOff className="h-8 w-8 text-[#41A5A5]" />,
      title: "Works Offline",
      desc: "Record sales even without internet connection",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-[#41A5A5]" />,
      title: "Mobile Money",
      desc: "Direct integration with MTN & Airtel Money",
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-[#41A5A5]" />,
      title: "Smart Reports",
      desc: "Daily SMS summaries and web analytics",
    },
  ];

  const desktopFeatures = [
    {
      icon: <CreditCard className="h-8 w-8 text-[#2E8B8B]" />,
      title: "Card Payments",
      desc: "Accept all major credit and debit cards",
    },
    {
      icon: <Users className="h-8 w-8 text-[#2E8B8B]" />,
      title: "Multi-User",
      desc: "Support for multiple staff and terminals",
    },
    {
      icon: <Package className="h-8 w-8 text-[#2E8B8B]" />,
      title: "Inventory Management",
      desc: "Track stock levels and automate reordering",
    },
    {
      icon: <Receipt className="h-8 w-8 text-[#2E8B8B]" />,
      title: "Custom Receipts",
      desc: "Branded receipts and ticket customization",
    },
  ];

  const enterpriseFeatures = [
    {
      icon: <Globe className="h-8 w-8 text-[#1a5f5f]" />,
      title: "Multi-Branch",
      desc: "Manage multiple locations from one dashboard",
    },
    {
      icon: <Shield className="h-8 w-8 text-[#1a5f5f]" />,
      title: "Secure & Reliable",
      desc: "Bank-level security with 99.9% uptime",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#1a5f5f]" />,
      title: "Lightning Fast",
      desc: "Process transactions in under 2 seconds",
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-[#1a5f5f]" />,
      title: "24/7 Support",
      desc: "Round-the-clock technical assistance",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From mobile sales tracking to enterprise-grade POS systems,
            we&apos;ve got solutions for every business size
          </p>
        </div>

        {/* Mobile Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-[#41A5A5]">
            📱 Mobile Solution
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mobileFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 p-3 bg-[#41A5A5]/10 rounded-full">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-[#2E8B8B]">
            💻 Desktop POS
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {desktopFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 p-3 bg-[#2E8B8B]/10 rounded-full">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Features */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 text-[#1a5f5f]">
            🏢 Enterprise Ready
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {enterpriseFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 p-3 bg-[#1a5f5f]/10 rounded-full">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Image */}
        <div className="mt-16 text-center">
          <Image
            src={simpos}
            alt="SimuPOS app interface"
            className="rounded-xl shadow-2xl"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  );
}
