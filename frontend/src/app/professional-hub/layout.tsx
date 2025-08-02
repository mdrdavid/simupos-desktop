import { AppFooter } from "@/components/Footer/AppFooter";
import type React from "react";
import { Header } from "./Header";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
      <AppFooter />
    </div>
  );
}
