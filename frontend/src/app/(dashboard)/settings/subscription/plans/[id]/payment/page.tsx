/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  Info,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Crown,
  Star,
  Receipt,
  Building2,
  Users,
  ChevronRight,
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "@/hooks/use-toast";

type PaymentMethod = "cash" | "mtn_momo" | "airtel_money";

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const { plans, subscribe, loading } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn_momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === planId);

  const paymentMethods = [
    {
      key: "cash" as PaymentMethod,
      label: "Cash Payment",
      icon: <Wallet className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Pay at our office or authorized agent",
      features: [
        "Instant activation",
        "Receipt provided",
        "Multiple locations",
      ],
    },
    {
      key: "mtn_momo" as PaymentMethod,
      label: "MTN Mobile Money",
      icon: <Smartphone className="h-6 w-6" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      description: "Pay using your MTN Mobile Money account",
      features: ["Instant payment", "24/7 available", "Secure transaction"],
    },
    {
      key: "airtel_money" as PaymentMethod,
      label: "Airtel Money",
      icon: <CreditCard className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Pay using your Airtel Money account",
      features: ["Instant payment", "24/7 available", "Secure transaction"],
    },
  ];

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
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

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case "cash":
        return {
          title: "Cash Payment Process",
          steps: [
            "Visit our office or any authorized agent",
            "Provide your business details and plan information",
            "Make the cash payment and receive a receipt",
            "Your subscription will be activated within 2 hours",
          ],
        };
      case "mtn_momo":
        return {
          title: "MTN Mobile Money Payment",
          steps: [
            "Ensure you have sufficient funds in your MTN Mobile Money",
            "You'll receive a payment prompt on your phone",
            "Enter your MTN Mobile Money PIN to complete the transaction",
            "Subscription activates immediately upon successful payment",
          ],
        };
      case "airtel_money":
        return {
          title: "Airtel Money Payment",
          steps: [
            "Ensure you have sufficient funds in your Airtel Money",
            "You'll receive a payment prompt on your phone",
            "Enter your Airtel Money PIN to complete the transaction",
            "Subscription activates immediately upon successful payment",
          ],
        };
      default:
        return { title: "", steps: [] };
    }
  };

  const validateForm = () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Selected plan not found",
        variant: "destructive",
      });
      return false;
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return false;
    }

    if (
      (paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") &&
      !phoneNumber.trim()
    ) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    if (phoneNumber && !/^(256|0)\d{9}$/.test(phoneNumber.replace(/\s/g, ""))) {
      toast({
        title: "Error",
        description:
          "Please enter a valid phone number (256XXXXXXXXX or 0XXXXXXXXX)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const success = await subscribe(planId, paymentMethod);

      if (success) {
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated successfully",
        });
        router.push("/settings/subscription/success");
      } else {
        toast({
          title: "Payment Failed",
          description:
            "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-md text-center border-2 border-dashed border-gray-200">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Info className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Plan Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The subscription plan you&apos;re looking for doesn&apos;t exist
              or has been removed.
            </p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const instructions = getPaymentInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Complete Payment
              </h1>
              <p className="text-gray-600">
                Secure payment for your {selectedPlan.name} subscription
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Lock className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      {getPlanIcon(selectedPlan.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedPlan.name} Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        Monthly subscription
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-teal-600">
                      {formatCurrency(selectedPlan.price)}
                    </p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </div>
                    <span className="font-semibold">
                      {selectedPlan.maxUsers === 0
                        ? "Unlimited"
                        : selectedPlan.maxUsers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Receipt className="h-4 w-4" />
                      <span>Monthly Transactions</span>
                    </div>
                    <span className="font-semibold">
                      {selectedPlan.maxTransactions === 0
                        ? "Unlimited"
                        : selectedPlan.maxTransactions.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>Locations</span>
                    </div>
                    <span className="font-semibold">
                      {selectedPlan.maxLocations === 0
                        ? "Unlimited"
                        : selectedPlan.maxLocations}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-teal-600">
                    {formatCurrency(selectedPlan.price)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-teal-600" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose how you&apos;d like to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.key}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.key
                        ? `${method.borderColor} ${method.bgColor} shadow-md scale-105`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setPaymentMethod(method.key)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${method.bgColor} ${method.color}`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {method.label}
                          </h3>
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            {paymentMethod === method.key && (
                              <div className="w-2.5 h-2.5 bg-teal-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {method.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {method.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Phone Number Input for Mobile Money */}
            {(paymentMethod === "mtn_momo" ||
              paymentMethod === "airtel_money") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-teal-600" />
                    Phone Number
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {paymentMethod === "mtn_momo" ? "MTN" : "Airtel"}{" "}
                      Registered Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="256712345678 or 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 text-lg"
                      maxLength={12}
                    />
                    <p className="text-sm text-gray-500">
                      Enter the phone number registered with your{" "}
                      {paymentMethod === "mtn_momo"
                        ? "MTN Mobile Money"
                        : "Airtel Money"}{" "}
                      account
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Instructions & Security */}
          <div className="space-y-6">
            {/* Payment Instructions */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  {instructions.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {instructions.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                    <Clock className="h-4 w-4" />
                    Activation Time:{" "}
                    {paymentMethod === "cash" ? "Within 2 hours" : "Immediate"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Bank-Level Security
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your payment information is encrypted end-to-end. We never
                      store your mobile money PIN or personal financial details.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Data Protected</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>24/7 Monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium text-gray-900"
                    >
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-xs text-gray-600">
                      By proceeding, you agree to our{" "}
                      <button className="text-teal-600 hover:underline font-medium">
                        Terms of Service
                      </button>{" "}
                      and acknowledge our{" "}
                      <button className="text-teal-600 hover:underline font-medium">
                        Privacy Policy
                      </button>
                      . You authorize us to charge the specified amount to your
                      selected payment method.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <div className="sticky top-4 space-y-4">
              <Button
                onClick={handlePayment}
                disabled={!agreedToTerms || isProcessing || loading}
                className="w-full h-14 text-lg font-bold shadow-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay {formatCurrency(selectedPlan.price)}
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your payment is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
