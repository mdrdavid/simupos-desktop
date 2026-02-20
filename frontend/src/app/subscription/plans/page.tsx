/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Users,
  Receipt,
  Zap,
  Star,
  Building2,
  Headphones,
  Phone,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  ChevronRight,
  InfinityIcon,
  Target,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { plans, currentSubscription, loading } = useSubscription();
  const { logout } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}`;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Zap className="h-8 w-8" />;
      case "professional":
        return <Star className="h-8 w-8" />;
      case "enterprise":
        return <Crown className="h-8 w-8" />;
      default:
        return <Receipt className="h-8 w-8" />;
    }
  };

  const getPlanGradient = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return "from-blue-500 to-blue-600";
      case "professional":
        return "from-teal-500 to-teal-600";
      case "enterprise":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPlanValue = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return {
          badge: "Perfect for startups",
          color: "bg-blue-100 text-blue-700",
        };
      case "professional":
        return {
          badge: "Ideal for growing businesses",
          color: "bg-teal-100 text-teal-700",
        };
      case "enterprise":
        return {
          badge: "For large organizations",
          color: "bg-purple-100 text-purple-700",
        };
      default:
        return {
          badge: "Flexible solution",
          color: "bg-gray-100 text-gray-700",
        };
    }
  };

  const featureComparison = [
    {
      label: "Basic POS",
      key: "basic",
      description: "Essential point of sale features",
    },
    {
      label: "Inventory Management",
      key: "hasInventoryManagement",
      description: "Track stock levels and products",
    },
    {
      label: "Advanced Reports",
      key: "hasReports",
      description: "Detailed analytics and insights",
    },
    {
      label: "Multi-Location",
      key: "hasMultiLocation",
      description: "Manage multiple business locations",
    },
    {
      label: "Customer Management",
      key: "hasCustomerManagement",
      description: "Customer database and loyalty",
    },
    {
      label: "Priority Support",
      key: "hasPrioritySupport",
      description: "24/7 dedicated support",
    },
    {
      label: "API Access",
      key: "hasApiAccess",
      description: "Integrate with other systems",
    },
    {
      label: "Custom Branding",
      key: "hasCustomBranding",
      description: "White-label solutions",
    },
  ];

  const faqData = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
      icon: Clock,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Cash payments, MTN Mobile Money, and Airtel Money for your convenience.",
      icon: Shield,
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, all new users get a 7-day free trial with the Basic plan to test our features.",
      icon: Sparkles,
    },
    {
      question: "What happens if I exceed my limits?",
      answer:
        "You'll receive notifications when approaching limits. Exceeding limits may require an upgrade.",
      icon: TrendingUp,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">
            Loading available plans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentSubscription && (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Current: {currentSubscription.planName}
              </Badge>
            )}
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-blue-50 rounded-full border border-teal-200">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">
                Flexible plans for every business
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan that grows with your business. All plans
              include our core POS features.
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const planValue = getPlanValue(plan.name);
            return (
              <Card
                key={plan.id}
                className={`relative group transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.isPopular
                    ? "border-2 border-teal-500 shadow-xl"
                    : "border-2 border-gray-200 shadow-lg"
                } ${
                  currentSubscription?.planId === plan.id
                    ? "ring-4 ring-blue-500 ring-opacity-20"
                    : ""
                }`}
                onMouseEnter={() => setSelectedPlan(plan.id)}
                onMouseLeave={() => setSelectedPlan(null)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {currentSubscription?.planId === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader
                  className={`pb-6 bg-gradient-to-br ${getPlanGradient(plan.name)} text-white rounded-t-lg`}
                >
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                        {getPlanIcon(plan.name)}
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>

                    {/* Plan Value Badge */}
                    <Badge variant="secondary" className={planValue.color}>
                      {planValue.badge}
                    </Badge>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-white/80">/month</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Key Features */}
                  <ul className="space-y-3">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5 flex-shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-center">
                        <Badge variant="outline" className="text-xs">
                          +{plan.features.length - 4} more features
                        </Badge>
                      </li>
                    )}
                  </ul>

                  <Separator />

                  {/* Plan Limits */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Users</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {plan.maxUsers === 0 ? (
                          <InfinityIcon className="h-4 w-4" />
                        ) : (
                          plan.maxUsers
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Transactions</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {plan.maxTransactions === 0 ? (
                          <InfinityIcon className="h-4 w-4" />
                        ) : (
                          `${plan.maxTransactions}/mo`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Locations</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {plan.maxLocations === 0 ? (
                          <InfinityIcon className="h-4 w-4" />
                        ) : (
                          plan.maxLocations
                        )}
                      </span>
                    </div>

                    {/* Items Limit */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Products</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {plan.maxItems === 0 ? (
                          <InfinityIcon className="h-4 w-4" />
                        ) : (
                          plan.maxItems
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {currentSubscription?.planId === plan.id ? (
                      <Button
                        variant="outline"
                        className="w-full bg-gray-100"
                        disabled
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Link
                        href={`/settings/subscription/plans/${plan.id}/payment`}
                        className="block"
                      >
                        <Button
                          className={`w-full h-12 font-semibold transition-all duration-200 ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                          size="lg"
                        >
                          {currentSubscription
                            ? "Switch to Plan"
                            : "Get Started"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-teal-600" />
              Feature Comparison
            </CardTitle>
            <CardDescription className="text-lg">
              Compare all features across our plans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                {/* Feature Headers */}
                <div className="bg-gray-50 p-6 border-r border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="space-y-1">
                    {featureComparison.map((feature) => (
                      <div
                        key={feature.key}
                        className="py-3 border-b border-gray-200 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {feature.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Columns */}
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 border-r border-gray-200 last:border-r-0 ${
                      plan.isPopular ? "bg-teal-50" : "bg-white"
                    }`}
                  >
                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          plan.isPopular
                            ? "bg-teal-100 text-teal-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getPlanIcon(plan.name)}
                        {plan.name}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {featureComparison.map((feature) => (
                        <div
                          key={feature.key}
                          className="flex justify-center py-3 border-b border-gray-200 last:border-b-0"
                        >
                          {feature.key === "basic" ||
                          plan[feature.key as keyof typeof plan] ? (
                            <div className="p-2 bg-green-100 rounded-full">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-100 rounded-full">
                              <X className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-teal-600" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Get answers to common questions about our plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqData.map((faq, index) => {
                const FaqIcon = faq.icon;
                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                        <FaqIcon className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-blue-600" />
                <span>Need Help Choosing?</span>
              </CardTitle>
              <CardDescription>
                Our team is here to help you find the perfect solution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Headphones className="h-8 w-8 text-white" />
                </div>

                <p className="text-gray-700">
                  Not sure which plan is right for you? Our experts will analyze
                  your business needs and recommend the perfect fit.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
                  </Button>
                </div>

                <div className="pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    📞 +256 700 910006
                  </p>
                  <p className="text-xs text-blue-600">
                    Available Monday - Friday, 8AM - 6PM EAT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Section - Added at the bottom */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                <LogOut className="h-6 w-6 text-white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Management
                </h3>
                <p className="text-gray-600 mt-1">
                  Need to sign out of your account?
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <LogOut className="h-5 w-5" />
                Confirm Sign Out
              </CardTitle>
              <CardDescription>
                Are you sure you want to sign out of your account?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You will need to sign in again to access your account.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
