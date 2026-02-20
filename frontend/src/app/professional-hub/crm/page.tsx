"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  MessageSquare,
  Eye,
  Plus,
  Search,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useCRM } from "@/context/CRMContext";

export default function ProfessionalHubCRMPage() {
  const { customers, searchCustomers, fetchCustomers, loading, getCustomerStats } = useCRM();
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    totalSpend: 0,
    averageSpend: 0,
  });

  const safeCustomers = Array.isArray(customers)
    ? customers.filter(Boolean)
    : [];

  useEffect(() => {
    const loadData = async () => {
      await fetchCustomers();
      const customerStats = await getCustomerStats();
      setStats(customerStats);
    };
    loadData();
  }, [fetchCustomers, getCustomerStats]);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    setIsSearching(true);
    if (text.trim()) {
      await searchCustomers(text);
    } else {
      await fetchCustomers();
    }
    setIsSearching(false);
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleMessage = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`sms:${phoneNumber}`, "_self");
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Wholesale":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/professional-hub">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Customer Directory
            </h1>
            <p className="text-gray-500 mt-1">Manage your professional relationships</p>
          </div>
        </div>
        <Link href="/professional-hub/crm/add">
          <Button className="w-full md:w-auto bg-brand-primary hover:bg-brand-secondary text-white shadow-sm transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Customers
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              New This Month
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Spend</CardTitle>
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">
              {stats.totalSpend.toLocaleString()} <span className="text-xs font-normal text-gray-400">UGX</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Spend</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageSpend.toLocaleString()} <span className="text-xs font-normal text-gray-400">UGX</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary w-4 h-4 transition-colors" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 border-none shadow-sm focus-visible:ring-brand-primary transition-all"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {loading || isSearching ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
            <p className="text-gray-500 font-medium">Updating directory...</p>
          </div>
        ) : safeCustomers.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Users className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold text-lg">
                {searchText
                  ? "No results found"
                  : "Your directory is empty"}
              </p>
              <p className="text-gray-400 text-center max-w-xs mt-2">
                {searchText
                  ? `We couldn't find any customers matching "${searchText}"`
                  : "Add your first customer to start tracking your professional relationships."}
              </p>
              {!searchText && (
                <Link href="/professional-hub/crm/add" className="mt-6">
                  <Button className="bg-brand-primary hover:bg-brand-secondary">
                    Add Your First Customer
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="group border-none shadow-sm hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all overflow-hidden"
              >
                <CardContent className="p-0">
                   <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
                          <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-lg">
                            {customer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                            {customer.name}
                          </h3>
                          <p className="text-gray-500 text-sm font-medium">{customer.phone}</p>
                        </div>
                      </div>
                      <Badge
                        className={`${getCustomerTypeColor(
                          customer.customerType || "Regular"
                        )} border-none shadow-none`}
                      >
                        {customer.customerType || "Regular"}
                      </Badge>
                    </div>

                    <div className="pt-2">
                      {customer.email && (
                        <p className="text-gray-500 text-sm truncate">
                          {customer.email}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-xl group-hover:bg-brand-primary/5 transition-colors">
                        <span className="text-xs text-gray-500 font-medium">Total Revenue</span>
                        <span className="font-bold text-brand-primary">
                          {customer.totalSpend.toLocaleString()} <span className="text-[10px] font-normal">UGX</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-12 text-gray-600 hover:text-green-600 hover:bg-green-50"
                      onClick={() => handleCall(customer.phone)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">Call</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleMessage(customer.phone)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">SMS</span>
                    </Button>
                    <Link href={`/professional-hub/crm/${customer.id}`} className="flex-1">
                      <Button
                        variant="ghost"
                        className="w-full rounded-none h-12 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="text-xs font-semibold">View</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
