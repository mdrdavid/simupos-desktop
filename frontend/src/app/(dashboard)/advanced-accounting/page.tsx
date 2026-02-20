"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultiCurrency from "@/components/advanced-accounting/MultiCurrency";
import TaxCompliance from "@/components/advanced-accounting/TaxCompliance";
import FixedAssets from "@/components/advanced-accounting/FixedAssets";
import Payroll from "@/components/advanced-accounting/Payroll";
import Budgeting from "@/components/advanced-accounting/Budgeting";

export default function AdvancedAccountingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Accounting</h1>
      <Tabs defaultValue="multi-currency">
        <TabsList>
          <TabsTrigger value="multi-currency">Multi-Currency</TabsTrigger>
          <TabsTrigger value="tax-compliance">Tax Compliance</TabsTrigger>
          <TabsTrigger value="fixed-assets">Fixed Assets</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting & Forecasting</TabsTrigger>
        </TabsList>
        <TabsContent value="multi-currency">
          <MultiCurrency />
        </TabsContent>
        <TabsContent value="tax-compliance">
          <TaxCompliance />
        </TabsContent>
        <TabsContent value="fixed-assets">
          <FixedAssets />
        </TabsContent>
        <TabsContent value="payroll">
          <Payroll />
        </TabsContent>
        <TabsContent value="budgeting">
          <Budgeting />
        </TabsContent>
      </Tabs>
    </div>
  );
}