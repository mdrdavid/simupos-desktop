import type React from "react";
import { Header } from "./Header";
import { ProfessionalHubBottomNav } from "@/components/professional-hub/ProfessionalHubBottomNav";
import { ProfessionalHubFinancialProvider } from "@/context/ProfessionalHubFinancialContext";
import { SalesPipelineProvider } from "@/context/SalesPipelineContext";
import { CRMProvider } from "@/context/CRMContext";
import { UserProvider } from "@/context/UserContext";
import { ProfessionalHubGuard } from "@/components/professional-hub/ProfessionalHubGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionGuard>
    <ProfessionalHubFinancialProvider>
      <CRMProvider>
        <UserProvider>
        <SalesPipelineProvider>
          <ProfessionalHubGuard>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="pb-20 pt-16">{children}</div>
              <ProfessionalHubBottomNav />
            </div>
          </ProfessionalHubGuard>
        </SalesPipelineProvider>
        </UserProvider>
      </CRMProvider>
    </ProfessionalHubFinancialProvider>
    </SubscriptionGuard>
  );
}
