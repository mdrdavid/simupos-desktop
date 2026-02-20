/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  Rocket,
  Zap,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  PartyPopper,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    window.location.href = "/auth/login";
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Activation",
      description: "All features available immediately",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Team Management",
      description: "Add team members and set permissions",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Advanced Analytics",
      description: "Access detailed reports and insights",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Priority Support",
      description: "24/7 dedicated customer support",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-6">
        {/* Animated Success Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full shadow-lg">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg animate-bounce">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Subscription Activated
          </Badge>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
            Welcome to Premium!
          </h1>

          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Your subscription is now active. Get ready to supercharge your
            business with premium features.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/30">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-green-800">
            <Rocket className="h-5 w-5" />
            What&apos;s Now Available
          </CardTitle>
          <CardDescription className="text-green-700">
            Explore your new premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-teal-600" />
            Ready to Get Started?
          </CardTitle>
          <CardDescription>
            Here&apos;s what you can do next with your new subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Set up your team members and permissions
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">
                Explore advanced reporting and analytics
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-teal-800">
                Configure multi-location settings
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <div className="space-y-6">
        {/* Auto-redirect Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Redirecting to dashboard in{" "}
              <span className="font-bold text-green-600">{countdown}</span>{" "}
              seconds
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleContinue}
            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Launch Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/settings/subscription")}
            className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
          >
            View Subscription Details
          </Button>
        </div>

        {/* Support Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Need help? Our support team is available 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Celebration Confetti Effect (CSS-based) */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #ff0000;
          top: -10px;
          opacity: 0;
        }

        .confetti:nth-child(1) {
          left: 10%;
          background: #ff0000;
          animation: confetti-fall 3s ease-in 0s infinite;
        }
        .confetti:nth-child(2) {
          left: 20%;
          background: #00ff00;
          animation: confetti-fall 3s ease-in 0.5s infinite;
        }
        .confetti:nth-child(3) {
          left: 30%;
          background: #0000ff;
          animation: confetti-fall 3s ease-in 1s infinite;
        }
        .confetti:nth-child(4) {
          left: 40%;
          background: #ffff00;
          animation: confetti-fall 3s ease-in 1.5s infinite;
        }
        .confetti:nth-child(5) {
          left: 50%;
          background: #ff00ff;
          animation: confetti-fall 3s ease-in 2s infinite;
        }
        .confetti:nth-child(6) {
          left: 60%;
          background: #00ffff;
          animation: confetti-fall 3s ease-in 2.5s infinite;
        }
        .confetti:nth-child(7) {
          left: 70%;
          background: #ffa500;
          animation: confetti-fall 3s ease-in 0.2s infinite;
        }
        .confetti:nth-child(8) {
          left: 80%;
          background: #800080;
          animation: confetti-fall 3s ease-in 0.7s infinite;
        }
        .confetti:nth-child(9) {
          left: 90%;
          background: #008000;
          animation: confetti-fall 3s ease-in 1.2s infinite;
        }
      `}</style>

      {/* Confetti elements */}
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}
