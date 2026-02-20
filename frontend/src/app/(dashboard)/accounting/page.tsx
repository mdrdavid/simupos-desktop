"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  PieChart,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

const accountingModules = [
  {
    title: "Accounting Dashboard",
    description: "Financial overview and key metrics",
    icon: LayoutDashboard,
    href: "/accounting/dashboard",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Chart of Accounts",
    description: "Manage your business accounts",
    icon: Settings,
    href: "/accounting/chart-of-accounts",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Accounts Receivable",
    description: "Manage customer invoices and payments",
    icon: ArrowUpRight,
    href: "/accounting/receivables",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Accounts Payable",
    description: "Manage supplier bills and payments",
    icon: ArrowDownLeft,
    href: "/accounting/payables",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    title: "Banking",
    description: "Bank accounts and reconciliation",
    icon: Building2,
    href: "/accounting/banking",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    title: "General Ledger",
    description: "Journal entries and ledger view",
    icon: BookOpen,
    href: "/accounting/ledger",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    title: "Financial Reports",
    description: "P&L, Balance Sheet, Trial Balance",
    icon: PieChart,
    href: "/accounting/reports",
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
];

const AccountingPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Accounting Module</h1>
        <p className="text-gray-600">
          Select a module below to manage your financial records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountingModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-2 hover:border-blue-200">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className={`p-3 rounded-lg ${module.bg}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{module.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccountingPage;