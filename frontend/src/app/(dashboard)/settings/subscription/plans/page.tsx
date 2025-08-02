"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, X, Crown, Users, Receipt, Zap, Star, Building2, Headphones, Phone } from "lucide-react"
import Link from "next/link"
import { useSubscription } from "@/context/SubscriptionContext"

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const { plans, currentSubscription, loading } = useSubscription()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Zap className="h-6 w-6" />
      case "professional":
        return <Star className="h-6 w-6" />
      case "enterprise":
        return <Crown className="h-6 w-6" />
      default:
        return <Receipt className="h-6 w-6" />
    }
  }

  const featureComparison = [
    { label: "Basic POS", key: "basic" },
    { label: "Inventory Management", key: "hasInventoryManagement" },
    { label: "Advanced Reports", key: "hasReports" },
    { label: "Multi-Location", key: "hasMultiLocation" },
    { label: "Customer Management", key: "hasCustomerManagement" },
    { label: "Priority Support", key: "hasPrioritySupport" },
    { label: "API Access", key: "hasApiAccess" },
    { label: "Custom Branding", key: "hasCustomBranding" },
  ]

  const faqData = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash payments, MTN Mobile Money, and Airtel Money for your convenience.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all new users get a 7-day free trial with the Basic plan to test our features.",
    },
    {
      question: "What happens if I exceed my limits?",
      answer: "You'll receive notifications when approaching limits. Exceeding limits may require an upgrade.",
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Loading plans...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select the perfect plan for your business needs</p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.isPopular ? "border-teal-500 shadow-lg scale-105" : "border-gray-200"} ${
              currentSubscription?.planId === plan.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {plan.isPopular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600">Most Popular</Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">{getPlanIcon(plan.name)}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{plan.maxUsers === 0 ? "Unlimited users" : `${plan.maxUsers} users`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>
                    {plan.maxTransactions === 0
                      ? "Unlimited transactions"
                      : `${plan.maxTransactions} transactions/month`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{plan.maxLocations === 0 ? "Unlimited locations" : `${plan.maxLocations} locations`}</span>
                </div>
              </div>

              <div className="pt-4">
                {currentSubscription?.planId === plan.id ? (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Link href={`/settings/subscription/plans/${plan.id}/payment`}>
                    <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>
                      {currentSubscription ? "Switch Plan" : "Select Plan"}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Features</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{feature.label}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {feature.key === "basic" || plan[feature.key as keyof typeof plan] ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Need Help Choosing?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Our team is here to help you find the perfect plan for your business needs.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline">
                <Headphones className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
