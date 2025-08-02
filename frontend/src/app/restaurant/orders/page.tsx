/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, DollarSign, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
  const { orders, tables } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const statusOptions = ["All", "Open", "Preparing", "Ready", "Completed"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table.number.toString().includes(searchTerm) ||
      order.waiterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Ready":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage all restaurant orders</p>
        </div>
        <Link href="/restaurant/orders/new">
          <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B]">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders, tables, or waiters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "whitespace-nowrap",
                statusFilter === status && "bg-[#41A5A5] hover:bg-[#2E8B8B]"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Create your first order to get started"}
            </p>
            <Link href="/restaurant/orders/new">
              <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B]">
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#41A5A5] rounded-full flex items-center justify-center text-white font-bold">
                      {order.table.number}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Table {order.table.number}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Waiter</p>
                    <p className="font-medium">{order.waiterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Items</p>
                    <p className="font-medium">{order.items.length} items</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    UGX {order.total.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/restaurant/orders/${order.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      View Details
                    </Button>
                  </Link>
                  {order.status !== "Completed" &&
                    order.status !== "Cancelled" && (
                      <Link
                        href={`/restaurant/checkout/${order.id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full bg-[#41A5A5] hover:bg-[#2E8B8B]"
                        >
                          Checkout
                        </Button>
                      </Link>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
