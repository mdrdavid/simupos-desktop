"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Check,
  Crown,
  Users,
  Receipt,
  Calendar,
  CreditCard,
  Star,
  Zap,
  Shield,
  Headphones,
  Building2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/context/SubscriptionContext";

export default function SubscriptionPage() {
  const router = useRouter();
  const { currentSubscription, plans, loading, getCurrentUsage } =
    useSubscription();
  const [usage, setUsage] = useState({
    users: { current: 0, limit: 0 },
    transactions: { current: 0, limit: 0 },
    storage: { current: 0, limit: 0 },
  });

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const currentUsage = await getCurrentUsage();
    setUsage(currentUsage);
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Zap className="h-5 w-5" />;
      case "professional":
        return <Star className="h-5 w-5" />;
      case "enterprise":
        return <Crown className="h-5 w-5" />;
      default:
        return <Receipt className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Loading subscription details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing
            </p>
          </div>
        </div>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(currentSubscription.planName)}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {currentSubscription.planName} Plan
                    </h3>
                    <p className="text-muted-foreground">
                      {formatCurrency(currentSubscription.price)} per month
                    </p>
                  </div>
                </div>
                <Badge className={getPlanColor(currentSubscription.planName)}>
                  {currentSubscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="font-semibold">
                    {new Date(
                      currentSubscription.nextBillingDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">
                    {currentSubscription.status}
                  </p>
                </div>
                <div className="text-center">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Auto Renewal</p>
                  <p className="font-semibold">
                    {currentSubscription.autoRenew ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Choose a plan to get started with SimuPOS
              </p>
              <Link href="/settings/subscription/plans">
                <Button>View Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Usage Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <span
                  className={`text-sm ${getUsageColor(getUsagePercentage(usage.users.current, usage.users.limit))}`}
                >
                  {usage.users.current} /{" "}
                  {usage.users.limit === 0 ? "Unlimited" : usage.users.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  usage.users.current,
                  usage.users.limit
                )}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Transactions (This Month)
                  </span>
                </div>
                <span
                  className={`text-sm ${getUsageColor(getUsagePercentage(usage.transactions.current, usage.transactions.limit))}`}
                >
                  {usage.transactions.current} /{" "}
                  {usage.transactions.limit === 0
                    ? "Unlimited"
                    : usage.transactions.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  usage.transactions.current,
                  usage.transactions.limit
                )}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span
                  className={`text-sm ${getUsageColor(getUsagePercentage(usage.storage.current, usage.storage.limit))}`}
                >
                  {usage.storage.current}GB /{" "}
                  {usage.storage.limit === 0
                    ? "Unlimited"
                    : `${usage.storage.limit}GB`}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  usage.storage.current,
                  usage.storage.limit
                )}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 relative ${
                  plan.isPopular
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200"
                } ${currentSubscription?.planId === plan.id ? "ring-2 ring-teal-500" : ""}`}
              >
                {plan.isPopular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-teal-600">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {plan.maxUsers === 0
                        ? "Unlimited users"
                        : `${plan.maxUsers} users`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4" />
                    <span>
                      {plan.maxTransactions === 0
                        ? "Unlimited transactions"
                        : `${plan.maxTransactions} transactions/month`}
                    </span>
                  </div>
                </div>

                {currentSubscription?.planId === plan.id ? (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Link href={`/settings/subscription/plans/${plan.id}`}>
                    <Button
                      className="w-full"
                      variant={plan.isPopular ? "default" : "outline"}
                    >
                      {currentSubscription ? "Switch Plan" : "Select Plan"}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSubscription.billingHistory?.map((bill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{bill.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(bill.amount)}
                    </p>
                    <Badge
                      variant={
                        bill.status === "paid" ? "default" : "destructive"
                      }
                    >
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-center text-muted-foreground py-4">
                  No billing history available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Have questions about your subscription? Our support team is here
              to help.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Headphones className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline">View FAQ</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
