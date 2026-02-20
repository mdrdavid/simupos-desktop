/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import { AccountsPayable } from "@/src/types/accountsPayable";

interface SupplierDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data - replace with actual API calls
const mockSupplier = {
  id: "1",
  name: "Office Supplies Co.",
  contactPerson: "John Smith",
  phone: "+1-555-0101",
  email: "john@officesupplies.co",
  address: "123 Business Ave, City, State 12345",
  taxNumber: "TAX-123456789",
  paymentTerms: "Net 30",
  notes: "Preferred supplier for office stationery",
  totalBills: 12,
  totalAmount: 45000,
  paidAmount: 32500,
  outstandingBalance: 12500,
  averagePaymentDays: 28,
  lastTransaction: "2024-01-15",
};

type SupplierBill = {
  id: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: "paid" | "partially_paid" | "overdue" | "received";
  description: string;
};

const mockSupplierBills: SupplierBill[] = [
  {
    id: "1",
    billNumber: "BILL-0001",
    issueDate: "2024-01-15",
    dueDate: "2024-02-14",
    totalAmount: 5000,
    paidAmount: 5000,
    balanceDue: 0,
    status: "paid",
    description: "Office stationery purchase",
  },
  {
    id: "2",
    billNumber: "BILL-0002",
    issueDate: "2024-01-10",
    dueDate: "2024-02-09",
    totalAmount: 7500,
    paidAmount: 5000,
    balanceDue: 2500,
    status: "partially_paid",
    description: "Office furniture",
  },
  {
    id: "3",
    billNumber: "BILL-0003",
    issueDate: "2024-01-05",
    dueDate: "2024-01-20",
    totalAmount: 10000,
    paidAmount: 0,
    balanceDue: 10000,
    status: "overdue",
    description: "Computer equipment",
  },
];

export default function SupplierDetailsPage({
  params,
}: SupplierDetailsPageProps) {
  const router = useRouter();
  const { getBillsBySupplier, getSupplierPayableSummary } =
    useAccountsPayable();
  const [supplier, setSupplier] = useState(mockSupplier);
  const [bills, setBills] = useState<SupplierBill[]>(mockSupplierBills);
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  useEffect(() => {
    // Resolve the async params
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      loadSupplierData();
    }
  }, [resolvedParams]);
  const loadSupplierData = async () => {
    try {
      // In real implementation, fetch from API
      setBills(mockSupplierBills);
      setSummary({
        totalBills: mockSupplier.totalBills,
        totalAmount: mockSupplier.totalAmount,
        totalPaid: mockSupplier.paidAmount,
        totalDue: mockSupplier.outstandingBalance,
        overdueAmount: 10000, // From mock data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supplier details",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "received":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getOutstandingStatus = (balance: number) => {
    if (balance === 0)
      return { color: "bg-green-100 text-green-800", label: "Paid Up" };
    if (balance < 5000)
      return { color: "bg-blue-100 text-blue-800", label: "Low Balance" };
    if (balance < 20000)
      return { color: "bg-yellow-100 text-yellow-800", label: "Moderate" };
    return { color: "bg-red-100 text-red-800", label: "High Balance" };
  };

  const status = getOutstandingStatus(supplier.outstandingBalance);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push("/accounting/accounts-payable/suppliers")
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{supplier.name}</h1>
              <p className="text-muted-foreground">
                Supplier details and transaction history
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Edit Supplier</Button>
          <Button
            onClick={() =>
              router.push("/accounting/accounts-payable/bills/create")
            }
          >
            New Bill
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Supplier Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Company Name</span>
                      </div>
                      <p className="font-semibold">{supplier.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Contact Person</span>
                      </div>
                      <p className="font-semibold">{supplier.contactPerson}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                      <p className="font-semibold">{supplier.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <p className="font-semibold">{supplier.email}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Address</span>
                      </div>
                      <p className="font-semibold">{supplier.address}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Payment Terms</span>
                      </div>
                      <p className="font-semibold">{supplier.paymentTerms}</p>
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Notes</div>
                      <p className="text-sm">{supplier.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest transactions with this supplier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bills.slice(0, 5).map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/accounting/accounts-payable/bills/${bill.id}`
                          )
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${getStatusColor(bill.status)}`}
                          >
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{bill.billNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {bill.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(bill.totalAmount)}
                          </p>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge className={`text-lg py-2 px-4 ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Outstanding Balance
                      </span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(supplier.outstandingBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Average Payment Days
                      </span>
                      <span className="font-semibold">
                        {supplier.averagePaymentDays} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Transaction
                      </span>
                      <span className="font-semibold">
                        {formatDate(supplier.lastTransaction)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bills</span>
                      <span className="font-semibold">
                        {summary?.totalBills || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Amount
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(summary?.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(summary?.totalPaid || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Balance Due</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(summary?.totalDue || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push("/accounting/accounts-payable/bills/create")
                    }
                  >
                    Create New Bill
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send Reminder
                  </Button>
                  <Button variant="outline" className="w-full">
                    View All Bills
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Bills</CardTitle>
              <CardDescription>All bills from this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="grid grid-cols-12 gap-4 p-4 border-b font-semibold text-sm bg-muted/50">
                  <div className="col-span-3">Bill Number</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2 text-right">Due Date</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/accounting/accounts-payable/bills/${bill.id}`
                      )
                    }
                  >
                    <div className="col-span-3 font-medium">
                      {bill.billNumber}
                    </div>
                    <div className="col-span-3">{bill.description}</div>
                    <div className="col-span-2 text-right">
                      {formatDate(bill.dueDate)}
                    </div>
                    <div className="col-span-2 text-right font-semibold">
                      {formatCurrency(bill.totalAmount)}
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Performance</CardTitle>
                <CardDescription>
                  Supplier payment history and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>On-time Payments</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Payment Days</span>
                    <span className="font-semibold">
                      {supplier.averagePaymentDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispute Rate</span>
                    <span className="font-semibold">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>
                  Monthly spending with this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Spending chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
