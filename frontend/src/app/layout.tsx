import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
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
import { PaymentProvider } from "@/context/PaymentContext";
import { SupplierProvider } from "@/context/SupplierContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { TransactionAnalysisProvider } from "@/context/TransactionAnalysisContext";
import { CashRegisterProvider } from "@/context/CashRegisterContext";
import { CabStoreProvider } from "@/context/CabStoreContext";
import { AccountsPayableProvider } from "@/context/AccountsPayableContext";
import { AccountsReceivableProvider } from "@/context/AccountsReceivableContext";
import { BankingProvider } from "@/context/BankingContext";
import { BookkeepingProvider } from "@/context/BookkeepingContext";
import { AdvancedAccountingProvider } from "@/context/AdvancedAccountingContext";
import { WashingBayProvider } from "@/context/WashingBayContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SimuPOS - Smart Point of Sale System for Businesses",
    template: "%s | SimuPOS - Smart POS System",
  },
  description:
    "Comprehensive POS solution for retail, restaurants, agro-products, professional services & more. Manage inventory, sales, customers, and analytics in one platform. Download on Google Play!",
  keywords: [
    "POS system",
    "point of sale",
    "inventory management",
    "business management",
    "retail POS",
    "restaurant POS",
    "agro business",
    "pharmacy POS",
    "hardware store POS",
    "small business software",
    "sales tracking",
    "customer management",
    "mobile POS",
    "offline POS",
    "Uganda business",
    "East Africa POS",
    "MTN Mobile Money",
    "Airtel Money",
    "cash register",
    "business analytics",
  ].join(", "),
  manifest: "/manifest.json",
  authors: [
    { name: "SimuPOS Team" },
    { name: "Green David", url: "https://greendavid.com" },
  ],
  creator: "SimuPOS",
  publisher: "SimuPOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://simupos.com"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://simupos.com",
    siteName: "SimuPOS",
    title: "SimuPOS - Smart Point of Sale System for All Businesses",
    description:
      "Comprehensive POS solution for supermarkets, hardware stores, wholesale, retail, restaurants, agro-products, and more. Download on Google Play!",
    images: [
      {
        url: "/images/simupos.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "SimuPOS - Smart Point of Sale System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimuPOS - Smart Point of Sale System",
    description:
      "Comprehensive POS solution for all business types. Download on Google Play!",
    images: ["/images/twitter-image.png"], // Replace with your actual Twitter image
    creator: "@simupos", // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification here
    // google: "your-google-verification-code",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SimuPOS",
  },
  other: {
    "google-play-app": "app-id=com.greendavid.SimuPOS",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SimuPOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#41A5A5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Primary Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#41A5A5" />
        <meta name="msapplication-TileColor" content="#41A5A5" />

        {/* Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#41A5A5"
        />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "SimuPOS - Smart Point of Sale System",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Android",
              description:
                "Comprehensive POS solution for supermarkets, hardware stores, wholesale, retail, restaurants, agro-products, professional services, and more. Manage inventory, sales, customers, and analytics in one powerful platform.",

              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "SimuPOS",
              },
              downloadUrl:
                "https://play.google.com/store/apps/details?id=com.greendavid.SimuPOS",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1000",
              },
              featureList: [
                "Inventory Management",
                "Sales Tracking",
                "Customer Management",
                "Multi-payment Support",
                "Offline Capability",
                "Business Analytics",
                "Multi-branch Support",
              ],
            }),
          }}
        />

        {/* Additional schema for business. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SimuPOS",
              url: "https://simupos.com",
              logo: "https://simupos.com/images/logo.png",
              description:
                "Comprehensive POS solution for all types of businesses",
              sameAs: [
                "https://play.google.com/store/apps/details?id=com.greendavid.SimuPOS",
              ],
            }),
          }}
        />

        {/* Google Play Store Smart App Banner */}
        <meta name="google-play-app" content="app-id=com.greendavid.SimuPOS" />

        {/* Apple Smart App Banner (if you have iOS app) */}
        {/* <meta name="apple-itunes-app" content="app-id=your-ios-app-id" /> */}
      </head>
      <body className={inter.className}>
        <Analytics />
        <SpeedInsights />
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
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Combined provider component
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
                            <PaymentProvider>
                              <SupplierProvider>
                                <InvoiceProvider>
                                  <RestaurantProvider>
                                    <TransactionAnalysisProvider>
                                      <CashRegisterProvider>
                                        <CabStoreProvider>
                                          <AccountsPayableProvider>
                                            <AccountsReceivableProvider>
                                              <BankingProvider>
                                                <BookkeepingProvider>
                                                  <AdvancedAccountingProvider>
                                                    <WashingBayProvider>
                                                      {children}
                                                    </WashingBayProvider>
                                                  </AdvancedAccountingProvider>
                                                </BookkeepingProvider>
                                              </BankingProvider>
                                            </AccountsReceivableProvider>
                                          </AccountsPayableProvider>
                                        </CabStoreProvider>
                                      </CashRegisterProvider>
                                    </TransactionAnalysisProvider>
                                  </RestaurantProvider>
                                </InvoiceProvider>
                              </SupplierProvider>
                            </PaymentProvider>
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
