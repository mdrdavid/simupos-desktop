"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  UtensilsCrossed,
  Scissors,
  ShoppingCart,
  Pill,
  Car,
  Hammer,
  Coffee,
  Shirt,
  Fuel,
  Building2,
  Users,
} from "lucide-react"
import Link from "next/link"

export function BusinessTypes() {
  const businessTypes = [
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Retail Shops",
      description: "Perfect for general stores, boutiques, and small retail outlets",
      features: ["Inventory tracking", "Barcode scanning", "Customer receipts", "Daily sales reports"],
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600",
      popular: true,
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8" />,
      title: "Restaurants & Cafes",
      description: "Streamline orders, payments, and kitchen management",
      features: ["Table management", "Order tracking", "Kitchen display", "Split billing"],
      color: "from-orange-500/10 to-orange-600/10",
      iconColor: "text-orange-600",
      popular: false,
    },
    {
      icon: <Scissors className="h-8 w-8" />,
      title: "Salons & Spas",
      description: "Manage appointments, services, and customer preferences",
      features: ["Service booking", "Staff scheduling", "Customer history", "Package deals"],
      color: "from-pink-500/10 to-pink-600/10",
      iconColor: "text-pink-600",
      popular: false,
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Market Vendors",
      description: "Simple sales tracking for market stalls and street vendors",
      features: ["Quick sales entry", "Mobile money", "Offline mode", "SMS receipts"],
      color: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-600",
      popular: true,
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: "Pharmacies",
      description: "Manage prescriptions, inventory, and regulatory compliance",
      features: ["Drug inventory", "Prescription tracking", "Expiry alerts", "Batch numbers"],
      color: "from-red-500/10 to-red-600/10",
      iconColor: "text-red-600",
      popular: false,
    },
    {
      icon: <Car className="h-8 w-8" />,
      title: "Auto Garages",
      description: "Track services, parts, and customer vehicle history",
      features: ["Service records", "Parts inventory", "Labor tracking", "Vehicle history"],
      color: "from-gray-500/10 to-gray-600/10",
      iconColor: "text-gray-600",
      popular: false,
    },
    {
      icon: <Hammer className="h-8 w-8" />,
      title: "Hardware Stores",
      description: "Manage tools, materials, and bulk sales efficiently",
      features: ["Bulk pricing", "Unit conversions", "Supplier tracking", "Project quotes"],
      color: "from-yellow-500/10 to-yellow-600/10",
      iconColor: "text-yellow-600",
      popular: false,
    },
    {
      icon: <Coffee className="h-8 w-8" />,
      title: "Bars & Lounges",
      description: "Handle drinks, tabs, and entertainment venue operations",
      features: ["Tab management", "Happy hour pricing", "Event tracking", "Staff tips"],
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600",
      popular: false,
    },
    {
      icon: <Shirt className="h-8 w-8" />,
      title: "Clothing Stores",
      description: "Size variants, seasonal inventory, and fashion retail",
      features: ["Size tracking", "Color variants", "Seasonal sales", "Style categories"],
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-600",
      popular: false,
    },
    {
      icon: <Fuel className="h-8 w-8" />,
      title: "Fuel Stations",
      description: "Pump management, fuel tracking, and convenience store",
      features: ["Pump integration", "Fuel monitoring", "Convenience items", "Fleet accounts"],
      color: "from-teal-500/10 to-teal-600/10",
      iconColor: "text-teal-600",
      popular: false,
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Supermarkets",
      description: "Large-scale retail with multiple departments and staff",
      features: ["Department tracking", "Staff management", "Bulk operations", "Advanced reports"],
      color: "from-cyan-500/10 to-cyan-600/10",
      iconColor: "text-cyan-600",
      popular: true,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Service Providers",
      description: "Professional services, consultancy, and freelancers",
      features: ["Time tracking", "Service packages", "Client management", "Invoice generation"],
      color: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-600",
      popular: false,
    },
  ]

  return (
    <section id="business-types" className="py-20 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perfect for <span className="text-[#41A5A5]">Every Business Type</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From small market stalls to large supermarkets, SimuPOS adapts to your business needs with specialized
            features for each industry
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businessTypes.map((business, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full">
                {business.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-[#41A5A5] text-white text-xs">Popular</Badge>
                )}

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${business.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`mb-4 p-3 bg-gray-50 rounded-lg w-fit ${business.iconColor} group-hover:bg-white/80 transition-colors`}
                  >
                    {business.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{business.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{business.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {business.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-[#41A5A5] rounded-full mr-2 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Don&apos;t See Your Business Type?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              SimuPOS is highly customizable and can be adapted for any business. Contact us to discuss your specific
              needs and get a tailored solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B] text-white px-8">Get Started</Button>
              </Link>
              <Button
                variant="outline"
                className="border-[#41A5A5] text-[#41A5A5] hover:bg-[#41A5A5] hover:text-white bg-transparent"
              >
                Contact Sales Team
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-[#41A5A5]/10 to-[#2E8B8B]/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Success Across Industries</h3>
              <p className="text-gray-600">Real results from real businesses using SimuPOS</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#41A5A5] mb-2">150+</div>
                <div className="text-sm text-gray-600">Retail Shops</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#41A5A5] mb-2">80+</div>
                <div className="text-sm text-gray-600">Restaurants & Cafes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#41A5A5] mb-2">270+</div>
                <div className="text-sm text-gray-600">Other Businesses</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
