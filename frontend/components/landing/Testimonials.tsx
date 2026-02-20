"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Fatuma Nalwoga",
      role: "Market Vendor, Owino Market",
      quote:
        "SimuPOS saved me from carrying a notebook. Now I track sales on my phone and even accept Mobile Money! My daily sales increased by 40%.",
      avatar: "/avatars/fatuma.jpg",
      rating: 5,
    },
    {
      name: "Robert Ssentamu",
      role: "Restaurant Owner, Kampala",
      quote:
        "The desktop POS handles our busy restaurant perfectly. Multiple terminals, kitchen printing, and detailed reports. Best investment we made!",
      avatar: "/avatars/robert.jpg",
      rating: 5,
    },
    {
      name: "Grace Nakimera",
      role: "Supermarket Chain, Ntinda",
      quote:
        "Managing 3 branches was a nightmare before SimuPOS. Now I see everything in real-time from my phone. The enterprise features are amazing!",
      avatar: "/avatars/grace.jpg",
      rating: 5,
    },
    {
      name: "James Mukasa",
      role: "Hardware Store, Wandegeya",
      quote: "Barcode scanning and inventory management made my life so much easier. No more manual stock counting!",
      avatar: "/avatars/james.jpg",
      rating: 5,
    },
    {
      name: "Sarah Namutebi",
      role: "Pharmacy, Entebbe",
      quote:
        "The multi-payment options and receipt customization are perfect for our pharmacy. Customers love the professional receipts.",
      avatar: "/avatars/sarah.jpg",
      rating: 5,
    },
    {
      name: "David Okello",
      role: "Electronics Shop, Nakawa",
      quote:
        "Started with mobile, upgraded to desktop POS. The transition was seamless and support team was incredible!",
      avatar: "/avatars/david.jpg",
      rating: 5,
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by 50+ Businesses</h2>
          <p className="text-xl text-gray-600">See what our customers say about SimuPOS</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#41A5A5] text-white">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 italic">&quot;{testimonial.quote}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
