/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  XCircle,
  Crown,
  Zap,
  Users,
  CreditCard,
  Calendar,
  BarChart3,
  Building,
  HeadphonesIcon,
  RotateCcw,
  Sparkles,
  Shield,
  InfinityIcon,
} from "lucide-react";
import { AppLoader } from "@/components/auth/AppLoader";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const {
    currentSubscription,
    loading,
    getDaysRemaining,
    getUsageStats,
    hasFeatureAccess,
    cancelSubscription,
    toggleAutoRenew,
    renewSubscription,
  } = useSubscription();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await cancelSubscription();
    setIsCancelling(false);
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    await renewSubscription();
    setIsRenewing(false);
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleAutoRenew();
    setIsToggling(false);
  };

  const handleUpgrade = () => {
    router.push("/subscription/plans");
  };

  if (loading) {
    return <AppLoader />;
  }

  if (!currentSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md text-center border-2 border-dashed border-gray-200">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Active Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              Get access to all premium features by choosing a plan that fits
              your business needs.
            </p>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View Available Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usage = getUsageStats();
  const daysRemaining = getDaysRemaining();
  const status = currentSubscription.status;

  const statusConfig = {
    active: {
      color: "bg-green-500",
      text: "Active",
      icon: CheckCircle2,
      variant: "default" as const,
    },
    pending: {
      color: "bg-yellow-500",
      text: "Pending",
      icon: AlertCircle,
      variant: "secondary" as const,
    },
    expired: {
      color: "bg-red-500",
      text: "Expired",
      icon: XCircle,
      variant: "destructive" as const,
    },
    cancelled: {
      color: "bg-gray-500",
      text: "Cancelled",
      icon: XCircle,
      variant: "secondary" as const,
    },
  };

  const features = [
    {
      key: "hasInventoryManagement",
      label: "Inventory Management",
      icon: BarChart3,
      description: "Track stock levels and manage products",
    },
    {
      key: "hasReports",
      label: "Advanced Reports",
      icon: Zap,
      description: "Detailed analytics and insights",
    },
    {
      key: "hasMultiLocation",
      label: "Multi-Location Support",
      icon: Building,
      description: "Manage multiple business locations",
    },
    {
      key: "hasCustomerManagement",
      label: "Customer Management",
      icon: Users,
      description: "Customer database and loyalty programs",
    },
    {
      key: "hasPrioritySupport",
      label: "Priority Support",
      icon: HeadphonesIcon,
      description: "24/7 dedicated support team",
    },
  ];

  const StatusIcon = statusConfig[status]?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Subscription Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your plan, usage, and billing preferences
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/settings/subscription/history")}
          className="border-gray-300 hover:bg-gray-50"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Billing History
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Subscription Card */}
        <div className="lg:col-span-2 space-y-8">
          {/* Subscription Status Card */}
          <Card className="border-2 border-teal-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">
                      {currentSubscription.planName} Plan
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-teal-700">
                      {formatCurrency(currentSubscription.price)} / month
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={statusConfig[status]?.variant}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {status === "active" && daysRemaining > 0 && (
                <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <AlertDescription className="flex items-center gap-2 text-green-800 font-medium">
                    <Calendar className="h-4 w-4" />
                    {daysRemaining} days remaining in your billing cycle
                  </AlertDescription>
                </Alert>
              )}

              {status === "expired" && (
                <Alert variant="destructive">
                  <AlertDescription className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Your subscription has expired. Renew to continue using
                    premium features.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-gray-500" />
                      Auto-renewal
                    </Label>
                    <p className="text-xs text-gray-600">
                      Automatically renew your subscription
                    </p>
                  </div>
                  <Switch
                    checked={currentSubscription.autoRenew}
                    onCheckedChange={handleToggle}
                    disabled={isToggling || status !== "active"}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Next Billing Date
                  </Label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(currentSubscription.nextBillingDate)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              {status === "active" && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1"
                >
                  {isCancelling ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Plan"
                  )}
                </Button>
              )}
              {status === "expired" && (
                <Button
                  onClick={handleRenew}
                  disabled={isRenewing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isRenewing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Renewing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Renew Now
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                Usage Statistics
              </CardTitle>
              <CardDescription>
                Track your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Team Users
                      </span>
                      <p className="text-xs text-gray-500">
                        Active users in your account
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {usage.usersUsed} /{" "}
                    {usage.usersLimit || (
                      <InfinityIcon className="h-4 w-4 inline" />
                    )}
                  </span>
                </div>
                <Progress
                  value={
                    (usage.usersUsed / (usage.usersLimit || usage.usersUsed)) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Monthly Transactions
                      </span>
                      <p className="text-xs text-gray-500">
                        Sales and payment processing
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {usage.transactionsUsed} /{" "}
                    {usage.transactionsLimit || (
                      <InfinityIcon className="h-4 w-4 inline" />
                    )}
                  </span>
                </div>
                <Progress
                  value={
                    (usage.transactionsUsed /
                      (usage.transactionsLimit || usage.transactionsUsed)) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Sidebar */}
        <div className="space-y-8">
          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-600" />
                Plan Features
              </CardTitle>
              <CardDescription>
                Everything included in your {currentSubscription.planName} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature) => {
                const hasAccess = hasFeatureAccess(feature.key);
                const FeatureIcon = feature.icon;

                return (
                  <div
                    key={feature.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      hasAccess
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        hasAccess
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <FeatureIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            hasAccess ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {feature.label}
                        </span>
                        {hasAccess ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    24/7 Support
                  </p>
                  <p className="text-xs text-gray-500">
                    Get help anytime you need it
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number | undefined | null) {
  if (amount == null || isNaN(amount)) {
    return "UGX ---";
  }
  return `UGX ${amount.toLocaleString()}`;
}

function formatDate(dateString: string | undefined | null) {
  if (!dateString) {
    return "Not scheduled";
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        const validDate = new Date(timestamp);
        return validDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return "Not scheduled";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Not scheduled";
  }
}

// Label component for internal use
const Label = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);
