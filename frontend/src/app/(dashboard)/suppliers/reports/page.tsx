"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { useSupplier } from "@/context/SupplierContext";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@/src/types/supplier";

interface ReportData {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  suspendedSuppliers: number;
  totalOutstanding: number;
  avgPaymentTerms: number;
  suppliersByCategory: Record<string, number>;
  topSuppliersByOutstanding: Supplier[];
  recentlyAdded: Supplier[];
  paymentTermsDistribution: Record<string, number>;
}

export default function SupplierReportsPage() {
  const router = useRouter();
  const { suppliers } = useSupplier();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    status: "all",
  });

  useEffect(() => {
    generateReportData();
  }, [suppliers, filters]);

  const generateReportData = () => {
    setLoading(true);

    // Filter suppliers based on selected filters
    let filteredSuppliers = suppliers;

    if (filters.category !== "all") {
      filteredSuppliers = filteredSuppliers.filter(
        (s) => s.category === filters.category
      );
    }

    if (filters.status !== "all") {
      filteredSuppliers = filteredSuppliers.filter(
        (s) => s.status === filters.status
      );
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredSuppliers = filteredSuppliers.filter(
        (s) => new Date(s.createdAt) >= cutoffDate
      );
    }

    // Calculate report data
    const totalSuppliers = filteredSuppliers.length;
    const activeSuppliers = filteredSuppliers.filter(
      (s) => s.status === "active"
    ).length;
    const inactiveSuppliers = filteredSuppliers.filter(
      (s) => s.status === "inactive"
    ).length;
    const suspendedSuppliers = filteredSuppliers.filter(
      (s) => s.status === "suspended"
    ).length;

    const totalOutstanding = filteredSuppliers.reduce(
      (sum, s) => sum + (s.outstandingBalance || 0),
      0
    );
    const avgPaymentTerms =
      filteredSuppliers.reduce((sum, s) => sum + s.paymentTerms, 0) /
        totalSuppliers || 0;

    // Suppliers by category
    const suppliersByCategory: Record<string, number> = {};
    filteredSuppliers.forEach((supplier) => {
      suppliersByCategory[supplier.category] =
        (suppliersByCategory[supplier.category] || 0) + 1;
    });

    // Top suppliers by outstanding balance
    const topSuppliersByOutstanding = filteredSuppliers
      .filter((s) => (s.outstandingBalance || 0) > 0)
      .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0))
      .slice(0, 10);

    // Recently added suppliers
    const recentlyAdded = filteredSuppliers
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    // Payment terms distribution
    const paymentTermsDistribution: Record<string, number> = {
      "0-7 days": 0,
      "8-15 days": 0,
      "16-30 days": 0,
      "31-60 days": 0,
      "60+ days": 0,
    };

    filteredSuppliers.forEach((supplier) => {
      const terms = supplier.paymentTerms;
      if (terms <= 7) paymentTermsDistribution["0-7 days"]++;
      else if (terms <= 15) paymentTermsDistribution["8-15 days"]++;
      else if (terms <= 30) paymentTermsDistribution["16-30 days"]++;
      else if (terms <= 60) paymentTermsDistribution["31-60 days"]++;
      else paymentTermsDistribution["60+ days"]++;
    });

    setReportData({
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suspendedSuppliers,
      totalOutstanding,
      avgPaymentTerms: Math.round(avgPaymentTerms),
      suppliersByCategory,
      topSuppliersByOutstanding,
      recentlyAdded,
      paymentTermsDistribution,
    });

    setLoading(false);
  };

  const exportReport = (format: "pdf" | "excel" | "csv") => {
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} report...`,
    });

    // In a real app, this would trigger the actual export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Report exported successfully as ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || !reportData) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/suppliers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Supplier Reports
            </h1>
            <p className="text-gray-600">
              Comprehensive supplier analytics and insights
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport("pdf")}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Filter the report data by date range, category, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing & Fashion</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="medical">Medical & Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Suppliers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.totalSuppliers}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Suppliers
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.activeSuppliers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Outstanding
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.totalOutstanding)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Payment Terms
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.avgPaymentTerms} days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Balances</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <span className="font-medium">
                      {reportData.activeSuppliers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Inactive</span>
                    </div>
                    <span className="font-medium">
                      {reportData.inactiveSuppliers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Suspended</span>
                    </div>
                    <span className="font-medium">
                      {reportData.suspendedSuppliers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Payment Terms Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.paymentTermsDistribution).map(
                    ([range, count]) => (
                      <div
                        key={range}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(count / reportData.totalSuppliers) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-medium text-sm w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers by Category</CardTitle>
              <CardDescription>
                Distribution of suppliers across different business categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.suppliersByCategory).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="font-medium capitalize">
                          {category.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(count / reportData.totalSuppliers) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-bold text-lg w-8">{count}</span>
                        <span className="text-sm text-gray-500 w-12">
                          {((count / reportData.totalSuppliers) * 100).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers by Outstanding Balance</CardTitle>
              <CardDescription>
                Suppliers with the highest outstanding balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topSuppliersByOutstanding.length > 0 ? (
                  reportData.topSuppliersByOutstanding.map(
                    (supplier, index) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600">
                              {supplier.contactPerson}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {formatCurrency(supplier.outstandingBalance || 0)}
                          </p>
                          <Badge
                            variant={
                              supplier.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {supplier.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No suppliers with outstanding balances
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Suppliers</CardTitle>
              <CardDescription>
                Latest suppliers added to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recentlyAdded.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-600">
                          {supplier.contactPerson} • {supplier.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Added on</p>
                      <p className="font-medium">
                        {formatDate(supplier.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
