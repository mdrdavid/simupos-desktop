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
import Image from "next/image";
import { motion } from "framer-motion";
import simposMobile from "../../public/images/simuposv1.png";
import simposDesktop from "../../public/images/simuposv2.png";

export function Features() {
  const mobileFeatures = [
    {
      icon: <Smartphone className="h-6 w-6 text-[#41A5A5]" />,
      title: "Mobile POS",
      desc: "Turn any smartphone into a powerful POS system for sales on the go.",
    },
    {
      icon: <WifiOff className="h-6 w-6 text-[#41A5A5]" />,
      title: "Works Offline",
      desc: "Continue selling even without internet. Data syncs automatically later.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-[#41A5A5]" />,
      title: "Mobile Money",
      desc: "Accept payments via MTN & Airtel Money directly in the app.",
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-[#41A5A5]" />,
      title: "Smart Reports",
      desc: "Receive daily SMS summaries and access detailed web analytics.",
    },
  ];

  const desktopFeatures = [
    {
      icon: <CreditCard className="h-6 w-6 text-[#2E8B8B]" />,
      title: "Multi-Payment",
      desc: "Support cash, card, and mobile money payments seamlessly.",
    },
    {
      icon: <Users className="h-6 w-6 text-[#2E8B8B]" />,
      title: "Staff Management",
      desc: "Create accounts for staff with custom permissions and tracking.",
    },
    {
      icon: <Package className="h-6 w-6 text-[#2E8B8B]" />,
      title: "Advanced Inventory",
      desc: "Track stock levels, set low-stock alerts, and manage suppliers.",
    },
    {
      icon: <Receipt className="h-6 w-6 text-[#2E8B8B]" />,
      title: "Professional Receipts",
      desc: "Print branded thermal receipts or send digital ones via WhatsApp.",
    },
  ];

  const enterpriseFeatures = [
    {
      icon: <Globe className="h-6 w-6 text-[#1a5f5f]" />,
      title: "Multi-Branch",
      desc: "Monitor all your business locations from a single central dashboard.",
    },
    {
      icon: <Shield className="h-6 w-6 text-[#1a5f5f]" />,
      title: "Data Security",
      desc: "Your business data is encrypted and backed up daily in the cloud.",
    },
    {
      icon: <Zap className="h-6 w-6 text-[#1a5f5f]" />,
      title: "High Performance",
      desc: "Built for speed to handle high-volume sales without lagging.",
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6 text-[#1a5f5f]" />,
      title: "Local Support",
      desc: "Get help when you need it with our 24/7 Ugandan support team.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-[#41A5A5]/5 rounded-full blur-3xl -z-10" />

      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Powerful Features for <span className="text-[#41A5A5]">Growth</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Everything you need to manage your business efficiently, from a single small shop to a nationwide chain.
          </motion.p>
        </div>

        {/* Feature Groups */}
        <div className="space-y-24">
          {/* Mobile Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#41A5A5]/10 text-[#41A5A5] text-sm font-bold mb-6">
                <Smartphone className="h-4 w-4" />
                Mobile Solutions
              </div>
              <h3 className="text-3xl font-bold mb-8">Sales in Your Pocket</h3>
              <div className="grid sm:grid-cols-2 gap-8">
                {mobileFeatures.map((feature, index) => (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-gray-900">{feature.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#41A5A5]/20 to-transparent rounded-3xl -rotate-6 scale-105 -z-10" />
                <Image
                  src={simposMobile}
                  alt="SimuPOS mobile app interface"
                  className="rounded-3xl shadow-2xl w-full max-w-[320px]"
                />
              </div>
            </motion.div>
          </div>

          {/* Desktop Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2E8B8B]/20 to-transparent rounded-3xl rotate-3 scale-105 -z-10" />
                <Image
                  src={simposDesktop}
                  alt="SimuPOS desktop dashboard"
                  className="rounded-3xl shadow-2xl w-full max-w-[500px]"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E8B8B]/10 text-[#2E8B8B] text-sm font-bold mb-6">
                <Zap className="h-4 w-4" />
                Desktop POS
              </div>
              <h3 className="text-3xl font-bold mb-8">Full Retail Control</h3>
              <div className="grid sm:grid-cols-2 gap-8">
                {desktopFeatures.map((feature, index) => (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-gray-900">{feature.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enterprise Grid */}
          <div className="bg-gray-50 rounded-[40px] p-12 md:p-16">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold mb-4 text-[#1a5f5f]">Enterprise-Grade Infrastructure</h3>
              <p className="text-gray-600">Built to scale with your ambitions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="mb-6 p-3 bg-gray-50 rounded-xl w-fit">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-bold mb-3">{feature.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
