/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
  Users,
  Building,
  Phone,
  Mail,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccountsPayable } from "@/context/AccountsPayableContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock supplier data - in real app, this would come from your API
const mockSuppliers = [
  {
    id: "1",
    name: "Office Supplies Co.",
    contactPerson: "John Smith",
    phone: "+1-555-0101",
    email: "john@officesupplies.co",
    address: "123 Business Ave, City, State 12345",
    totalBills: 12,
    totalAmount: 45000,
    outstandingBalance: 12500,
    lastTransaction: "2024-01-15",
  },
  {
    id: "2",
    name: "Tech Equipment Ltd.",
    contactPerson: "Sarah Johnson",
    phone: "+1-555-0102",
    email: "sarah@techequipment.com",
    address: "456 Tech Street, City, State 12345",
    totalBills: 8,
    totalAmount: 120000,
    outstandingBalance: 45000,
    lastTransaction: "2024-01-10",
  },
  {
    id: "3",
    name: "Utility Services Inc.",
    contactPerson: "Mike Brown",
    phone: "+1-555-0103",
    email: "mike@utilityservices.com",
    address: "789 Utility Road, City, State 12345",
    totalBills: 24,
    totalAmount: 85000,
    outstandingBalance: 12500,
    lastTransaction: "2024-01-20",
  },
];

export default function SuppliersManagementPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // In real implementation, fetch from API
      setSuppliers(mockSuppliers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suppliers.",
        variant: "destructive",
      });
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/accounting/accounts-payable")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground">
              Manage your business suppliers and vendors
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={() =>
              router.push("/accounting/accounts-payable/suppliers/create")
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-sm text-muted-foreground">Total Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                suppliers.reduce((sum, s) => sum + s.totalAmount, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Business</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, s) => sum + s.totalBills, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Bills</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search suppliers by name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first supplier"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() =>
                  router.push("/accounting/accounts-payable/suppliers/create")
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const status = getOutstandingStatus(supplier.outstandingBalance);
            return (
              <Card
                key={supplier.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {supplier.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {supplier.contactPerson}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/accounting/accounts-payable/suppliers/${supplier.id}`
                            )
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/accounting/accounts-payable/suppliers/${supplier.id}/bills`
                            )
                          }
                        >
                          View Bills
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Supplier</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {supplier.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Total Bills</p>
                      <p className="font-semibold">{supplier.totalBills}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outstanding</p>
                      <p className="font-semibold text-red-600">
                        {formatCurrency(supplier.outstandingBalance)}
                      </p>
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge className={status.color}>{status.label}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/accounting/accounts-payable/suppliers/${supplier.id}`
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
