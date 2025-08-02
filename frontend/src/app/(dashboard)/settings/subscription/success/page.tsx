"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function SubscriptionSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/settings/subscription")
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
                <p className="text-muted-foreground mt-2">
                  Your subscription has been activated successfully. You can now access all features.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => router.push("/settings/subscription")} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Subscription
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">You will be automatically redirected in 10 seconds...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
