"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Smartphone, Wallet, Shield, Info } from "lucide-react"
import { useSubscription } from "@/context/SubscriptionContext"
import { toast } from "@/hooks/use-toast"

type PaymentMethod = "cash" | "mtn_momo" | "airtel_money"

export default function SubscriptionPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { plans, subscribe, loading } = useSubscription()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn_momo")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPlan = plans.find((plan) => plan.id === planId)

  const paymentMethods = [
    {
      key: "cash" as PaymentMethod,
      label: "Cash Payment",
      icon: <Wallet className="h-5 w-5" />,
      color: "text-green-600",
      description: "Pay at our office or authorized agent",
    },
    {
      key: "mtn_momo" as PaymentMethod,
      label: "MTN Mobile Money",
      icon: <Smartphone className="h-5 w-5" />,
      color: "text-yellow-600",
      description: "Pay using your MTN Mobile Money account",
    },
    {
      key: "airtel_money" as PaymentMethod,
      label: "Airtel Money",
      icon: <CreditCard className="h-5 w-5" />,
      color: "text-red-600",
      description: "Pay using your Airtel Money account",
    },
  ]

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case "cash":
        return "Visit our office or any authorized agent to complete your cash payment. You'll receive a confirmation SMS once payment is verified."
      case "mtn_momo":
        return "You'll receive a payment prompt on your phone. Enter your MTN Mobile Money PIN to complete the transaction."
      case "airtel_money":
        return "You'll receive a payment prompt on your phone. Enter your Airtel Money PIN to complete the transaction."
      default:
        return ""
    }
  }

  const validateForm = () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Selected plan not found",
        variant: "destructive",
      })
      return false
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return false
    }

    if ((paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") && !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return false
    }

    if (phoneNumber && !/^256\d{9}$/.test(phoneNumber.replace(/\s/g, ""))) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number (256XXXXXXXXX)",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const success = await subscribe(planId, paymentMethod)

      if (success) {
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated successfully",
        })
        router.push("/settings/subscription/success")
      } else {
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!selectedPlan) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Plan not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment for your subscription</p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{selectedPlan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">Monthly subscription</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(selectedPlan.price)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>30 days</span>
            </div>
            <div className="flex justify-between">
              <span>Users:</span>
              <span>{selectedPlan.maxUsers === 0 ? "Unlimited" : selectedPlan.maxUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Transactions:</span>
              <span>{selectedPlan.maxTransactions === 0 ? "Unlimited" : `${selectedPlan.maxTransactions}/month`}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center font-semibold">
            <span>Total Amount:</span>
            <span className="text-lg">{formatCurrency(selectedPlan.price)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.key}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === method.key ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod(method.key)}
            >
              <div className="flex items-center space-x-3">
                <div className={`${method.color}`}>{method.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{method.label}</h3>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  {paymentMethod === method.key && <div className="w-2 h-2 bg-teal-600 rounded-full"></div>}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Phone Number Input for Mobile Money */}
      {(paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") && (
        <Card>
          <CardHeader>
            <CardTitle>Phone Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="256XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={12}
              />
              <p className="text-sm text-muted-foreground">
                Enter the phone number registered with your {paymentMethod === "mtn_momo" ? "MTN" : "Airtel"} account
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Payment Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{getPaymentInstructions()}</p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="terms" className="text-sm">
                I agree to the <button className="text-teal-600 hover:underline">Terms and Conditions</button> and{" "}
                <button className="text-teal-600 hover:underline">Privacy Policy</button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Your payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <Button onClick={handlePayment} disabled={!agreedToTerms || isProcessing} className="w-full h-12" size="lg">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatCurrency(selectedPlan.price)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
