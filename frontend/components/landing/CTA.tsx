"use client"

import { motion } from "framer-motion"
import { Mail, MessageSquare, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTA() {
  return (
    <section
      id="contact"
      className="relative py-16 bg-gradient-to-r from-[#41A5A5] to-[#2E8B8B] text-white overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-xl animate-pulse delay-300"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 opacity-90"
          >
            Join <span className="font-semibold">50+</span> businesses using SimuPOS to
            <span className="underline decoration-wavy"> boost sales by 30%</span>
          </motion.p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="flex justify-center mb-8">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-[#41A5A5] hover:bg-gray-100 text-lg px-8 py-4">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-8">
            <motion.a
              href="tel:+256700910006"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              <Phone className="h-5 w-5" />
              <span>Call: +256 (700) 910-006</span>
            </motion.a>

            <motion.a
              href="mailto:sales@simupos.com"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              <Mail className="h-5 w-5" />
              <span>Email Us</span>
            </motion.a>

            <motion.a
              href="https://wa.me/256702629361"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              <MessageSquare className="h-5 w-5" />
              <span>WhatsApp</span>
            </motion.a>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-sm opacity-80"
          >
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full">
              Simple, affordable pricing • No monthly fees • 24/7 Local Support
            </span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
