"use client";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Clock,
  DollarSign,
  MoreVertical,
  MapPin,
  Table as TableIcon,
  Eye,
  Calendar,
  Wifi,
  Coffee,
  Utensils,
  Crown,
} from "lucide-react";
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
        return "bg-green-50 text-green-700 border-green-200";
      case "Occupied":
        return "bg-red-50 text-red-700 border-red-200";
      case "Reserved":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Cleaning":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <Eye className="h-3 w-3" />;
      case "Occupied":
        return <Utensils className="h-3 w-3" />;
      case "Reserved":
        return <Calendar className="h-3 w-3" />;
      case "Cleaning":
        return <Coffee className="h-3 w-3" />;
      default:
        return <TableIcon className="h-3 w-3" />;
    }
  };

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case "VIP":
        return <Crown className="h-4 w-4" />;
      case "Outdoor":
        return <Wifi className="h-4 w-4" />;
      default:
        return <TableIcon className="h-4 w-4" />;
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

  // Calculate statistics
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "Available").length,
    occupied: tables.filter((t) => t.status === "Occupied").length,
    reserved: tables.filter((t) => t.status === "Reserved").length,
    cleaning: tables.filter((t) => t.status === "Cleaning").length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return "Earlier today";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Table Management
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor and manage your restaurant tables in real-time
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Tables
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TableIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.available}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Occupied
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.occupied}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Utensils className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">
                    Reserved
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.reserved}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Cleaning
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.cleaning}
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Coffee className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone Tabs */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Dining Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <button
                  key={zone.id} // Use zone.id instead of zone object
                  onClick={() => setCurrentZone(zone.name)} // Use zone.name
                  className={cn(
                    "flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 border-2",
                    currentZone === zone.name // Compare with zone.name
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 border-blue-600"
                      : "bg-white text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-md"
                  )}
                >
                  {getZoneIcon(zone.name)} {/* Use zone.name */}
                  {zone.name} {/* Use zone.name */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-2",
                      currentZone === zone.name // Compare with zone.name
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {zone.tables.length} {/* Use zone.tables directly */}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const order = getTableOrder(table.id);

            return (
              <Card
                key={table.id}
                className={cn(
                  "border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
                  table.status === "Available" &&
                    "bg-white/80 backdrop-blur-sm",
                  table.status === "Occupied" &&
                    "bg-red-50/80 backdrop-blur-sm",
                  table.status === "Reserved" &&
                    "bg-yellow-50/80 backdrop-blur-sm",
                  table.status === "Cleaning" &&
                    "bg-gray-50/80 backdrop-blur-sm"
                )}
              >
                <CardContent className="p-5">
                  {/* Table Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300",
                          table.status === "Available" &&
                            "bg-gradient-to-br from-green-500 to-green-600",
                          table.status === "Occupied" &&
                            "bg-gradient-to-br from-red-500 to-red-600",
                          table.status === "Reserved" &&
                            "bg-gradient-to-br from-yellow-500 to-yellow-600",
                          table.status === "Cleaning" &&
                            "bg-gradient-to-br from-gray-500 to-gray-600"
                        )}
                      >
                        {table.number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          Table {table.number}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-3 w-3" />
                          {table.capacity} seats
                          <span className="text-gray-400">•</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {table.zone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {table.status === "Available" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleTableAction(table.id, "reserve")
                              }
                              className="flex items-center gap-2"
                            >
                              <Calendar className="h-4 w-4" />
                              Reserve Table
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleTableAction(table.id, "clean")
                              }
                              className="flex items-center gap-2"
                            >
                              <Coffee className="h-4 w-4" />
                              Mark for Cleaning
                            </DropdownMenuItem>
                          </>
                        )}
                        {table.status !== "Available" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleTableAction(table.id, "available")
                            }
                            className="flex items-center gap-2 text-green-600"
                          >
                            <Eye className="h-4 w-4" />
                            Mark Available
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/restaurant/orders/new?tableId=${table.id}`}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            New Order
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "mb-4 border-2 px-3 py-1.5 text-sm font-medium flex items-center gap-2",
                      getStatusColor(table.status)
                    )}
                  >
                    {getStatusIcon(table.status)}
                    {table.status}
                  </Badge>

                  {/* Order Info */}
                  {order && (
                    <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          Active Order
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                        >
                          {order.items.length} items
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(order.createdAt)}
                          </span>
                          <span className="font-semibold text-gray-900 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>by {order.waiterName}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              order.status === "Preparing" &&
                                "bg-orange-50 text-orange-700 border-orange-200",
                              order.status === "Ready" &&
                                "bg-green-50 text-green-700 border-green-200",
                              order.status === "Served" &&
                                "bg-purple-50 text-purple-700 border-purple-200"
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {table.status === "Available" && (
                      <Link href={`/restaurant/orders/new?tableId=${table.id}`}>
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-10"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Order
                        </Button>
                      </Link>
                    )}

                    {order && (
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/restaurant/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 h-9"
                          >
                            View Order
                          </Button>
                        </Link>
                        <Link href={`/restaurant/checkout/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50 h-9"
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
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TableIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tables in {currentZone}
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                There are no tables currently assigned to the {currentZone}{" "}
                zone. Add tables to this zone to start managing them.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Tables to {currentZone}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
