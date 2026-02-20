"use client";

import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-brand-primary/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-primary text-white p-2 rounded-lg">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SimuPOS</h1>
              <p className="text-xs text-gray-600">Washing Bay Management</p>
            </div>
          </div>
          <Link href="/auth/login">
            <Button className="bg-brand-primary hover:bg-brand-secondary text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
