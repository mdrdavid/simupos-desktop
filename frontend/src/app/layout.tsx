import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { BusinessProvider } from "@/context/BusinessContext";
import { BranchProvider } from "@/context/BranchContext";
import { UserProvider } from "@/context/UserContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { CreditProvider } from "@/context/CreditContext";
import { CRMProvider } from "@/context/CRMContext";
import { AgroProductProvider } from "@/context/AgroProductContext";
import { WeldingProvider } from "@/context/WeldingContext";
import { WeldingFinancialProvider } from "@/context/WeldingFinancialContext";
import { SupplierProvider } from "@/context/SupplierContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimuPOS - Smart Point of Sale System",
  description:
    "Comprehensive POS solution for agro-products, welding services, and retail businesses",
  keywords:
    "POS, point of sale, inventory management, business management, agro products",
};

// ✅ Viewport (must be moved out of metadata)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CombinedProviders>
            {children}
            <Toaster />
          </CombinedProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

// combined provider component
function CombinedProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BusinessProvider>
        <BranchProvider>
          <UserProvider>
            <DataProvider>
              <ExpenseProvider>
                <SubscriptionProvider>
                  <CreditProvider>
                    <CRMProvider>
                      <AgroProductProvider>
                        <WeldingProvider>
                          <WeldingFinancialProvider>
                            <SupplierProvider>
                              <InvoiceProvider>
                                <RestaurantProvider>
                                  {children}
                                </RestaurantProvider>
                              </InvoiceProvider>
                            </SupplierProvider>
                          </WeldingFinancialProvider>
                        </WeldingProvider>
                      </AgroProductProvider>
                    </CRMProvider>
                  </CreditProvider>
                </SubscriptionProvider>
              </ExpenseProvider>
            </DataProvider>
          </UserProvider>
        </BranchProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
