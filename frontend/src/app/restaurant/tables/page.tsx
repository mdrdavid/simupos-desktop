"use client";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Clock, DollarSign, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TablesPage() {
  const {
    tables,
    zones,
    currentZone,
    setCurrentZone,
    updateTableStatus,
    orders,
  } = useRestaurant();

  const filteredTables = tables.filter((table) => table.zone === currentZone);

  const getTableOrder = (tableId: string) => {
    return orders.find(
      (order) => order.tableId === tableId && order.status !== "Completed"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200";
      case "Occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "Reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cleaning":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTableAction = (tableId: string, action: string) => {
    switch (action) {
      case "reserve":
        updateTableStatus(tableId, "Reserved");
        break;
      case "clean":
        updateTableStatus(tableId, "Cleaning");
        break;
      case "available":
        updateTableStatus(tableId, "Available");
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
          <p className="text-gray-600">Manage your restaurant tables</p>
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setCurrentZone(zone)}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              currentZone === zone
                ? "bg-white text-[#41A5A5] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTables.map((table) => {
          const order = getTableOrder(table.id);

          return (
            <Card key={table.id} className="relative">
              <CardContent className="p-4">
                {/* Table Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#41A5A5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {table.number}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Table {table.number}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {table.capacity} seats
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {table.status === "Available" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleTableAction(table.id, "reserve")
                            }
                          >
                            Reserve Table
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTableAction(table.id, "clean")}
                          >
                            Mark for Cleaning
                          </DropdownMenuItem>
                        </>
                      )}
                      {table.status !== "Available" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleTableAction(table.id, "available")
                          }
                        >
                          Mark Available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Badge */}
                <Badge className={cn("mb-3", getStatusColor(table.status))}>
                  {table.status}
                </Badge>

                {/* Order Info */}
                {order && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        Current Order
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {order.items.length} items
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-medium flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        UGX {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {table.status === "Available" && (
                    <Link href={`/restaurant/orders/new?tableId=${table.id}`}>
                      <Button
                        className="w-full bg-[#41A5A5] hover:bg-[#2E8B8B]"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Order
                      </Button>
                    </Link>
                  )}

                  {order && (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/restaurant/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          View Order
                        </Button>
                      </Link>
                      <Link href={`/restaurant/checkout/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tables in {currentZone}
          </h3>
          <p className="text-gray-600">
            Add tables to this zone to get started
          </p>
        </div>
      )}
    </div>
  );
}
