/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle, AlertCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useRestaurant();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const statusOptions = ["All", "Open", "Preparing", "Ready"];

  // Convert orders to kitchen tickets
  const kitchenTickets = orders
    .filter(
      (order) => order.status !== "Completed" && order.status !== "Cancelled"
    )
    .map((order) => ({
      id: order.id,
      orderId: order.id,
      tableNumber: order.table.number,
      items: order.items,
      priority:
        order.items.length > 5
          ? "High"
          : order.items.length > 2
            ? "Medium"
            : "Low",
      estimatedTime: order.items.reduce(
        (total, item) => total + item.menuItem.preparationTime,
        0
      ),
      createdAt: order.createdAt,
      status:
        order.status === "Open"
          ? "New"
          : order.status === "Preparing"
            ? "Preparing"
            : "Ready",
    }))
    .filter(
      (ticket) => selectedStatus === "All" || ticket.status === selectedStatus
    );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTicketColor = (status: string, priority: string) => {
    if (status === "New") return "border-l-4 border-l-red-500 bg-red-50";
    if (status === "Preparing")
      return "border-l-4 border-l-yellow-500 bg-yellow-50";
    if (status === "Ready") return "border-l-4 border-l-green-500 bg-green-50";
    return "border-l-4 border-l-gray-500 bg-gray-50";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
  };

  const getElapsedTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60)
    );
    return diffInMinutes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
          <p className="text-gray-600">Manage food preparation and orders</p>
        </div>
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-[#41A5A5]" />
          <Badge variant="outline" className="text-[#41A5A5] border-[#41A5A5]">
            {kitchenTickets.length} Active Orders
          </Badge>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {statusOptions.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status)}
            className={cn(
              "whitespace-nowrap",
              selectedStatus === status && "bg-[#41A5A5] hover:bg-[#2E8B8B]"
            )}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Kitchen Tickets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kitchenTickets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders to prepare
            </h3>
            <p className="text-gray-600">
              All caught up! New orders will appear here.
            </p>
          </div>
        ) : (
          kitchenTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={cn(
                "relative",
                getTicketColor(ticket.status, ticket.priority)
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Table {ticket.tableNumber}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getPriorityColor(ticket.priority)}
                      variant="secondary"
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {ticket.items.length} items
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getElapsedTime(ticket.createdAt)}m ago
                  </div>
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1" />~{ticket.estimatedTime}m
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {ticket.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.menuItem.name}
                        </p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {item.modifiers.map((mod) => mod.name).join(", ")}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-xs text-orange-600 font-medium">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">
                          ×{item.quantity}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2 text-xs",
                            item.status === "Pending" &&
                              "border-red-200 text-red-700",
                            item.status === "Preparing" &&
                              "border-yellow-200 text-yellow-700",
                            item.status === "Ready" &&
                              "border-green-200 text-green-700"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {ticket.status === "New" && (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(ticket.orderId, "Preparing")
                      }
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}

                  {ticket.status === "Preparing" && (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(ticket.orderId, "Ready")
                      }
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}

                  {ticket.status === "Ready" && (
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-800">
                        Ready for Service
                      </p>
                    </div>
                  )}
                </div>

                {/* Urgent Indicator */}
                {getElapsedTime(ticket.createdAt) > ticket.estimatedTime && (
                  <div className="flex items-center justify-center p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Overdue
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
