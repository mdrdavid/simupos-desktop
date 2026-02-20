/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Phone,
  Edit,
  Plus,
  Check,
  X,
  DollarSign,
  ChefHat,
  CheckCircle,
  Truck,
  AlertCircle,
  MoreVertical,
  Calendar,
  Tag,
  FileText,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/context/RestaurantContext";
import { cn } from "@/lib/utils";
import { OrderItem } from "@/src/types/restaurant";
type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Served"
  | "Completed"
  | "Cancelled"
  | "Open";

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Preparing: "bg-orange-50 text-orange-700 border-orange-200",
  Ready: "bg-green-50 text-green-700 border-green-200",
  Served: "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-gray-50 text-gray-700 border-gray-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Open: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusIcons: Record<OrderStatus, any> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Preparing: ChefHat,
  Ready: Truck,
  Served: CheckCircle,
  Completed: CheckCircle,
  Cancelled: X,
  Open: Clock,
};

const priorityColors: Record<"Low" | "Medium" | "High", string> = {
  Low: "bg-gray-100 text-gray-700 border-gray-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

const statusSteps: { key: OrderStatus; label: string }[] = [
  { key: "Pending", label: "Order Placed" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Preparing", label: "Preparing" },
  { key: "Ready", label: "Ready" },
  { key: "Served", label: "Served" },
  { key: "Completed", label: "Completed" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, tables, updateOrderStatus, updateOrder, menuItems } =
    useRestaurant();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  const orderId = params.id as string;
  const order = orders.find((o) => o.id === orderId);
  const table = order ? tables.find((t) => t.id === order.tableId) : null;

  useEffect(() => {
    if (order?.notes) {
      setNotes(order.notes);
    }
  }, [order?.notes]);

  if (!order || !table) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-UG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-UG", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
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
    return formatDate(dateString);
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
    setIsStatusDialogOpen(false);
  };

  const handleNotesUpdate = () => {
    updateOrder(orderId, { notes });
    setIsNotesDialogOpen(false);
  };

  const handleAddItem = () => {
    const menuItem = menuItems.find((item) => item.id === selectedMenuItem);
    if (!menuItem) return;

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      menuItemId: menuItem.id,
      menuItem: menuItem,
      quantity: quantity,
      modifiers: [],
      status: "Pending",
      price: menuItem.price * quantity,
      notes: "",
    };

    const updatedItems = [...order.items, newItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.18;
    const serviceCharge = subtotal * 0.1;
    const total = subtotal + tax + serviceCharge;

    updateOrder(orderId, {
      items: updatedItems,
      subtotal,
      tax,
      serviceCharge,
      total,
    });

    setIsAddItemDialogOpen(false);
    setSelectedMenuItem("");
    setQuantity(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );
  const totalPreparationTime = order.items.reduce(
    (total, item) => total + item.menuItem.preparationTime,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id.slice(-6).toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Table className="h-3 w-3" />
                  Table {table.number} • {table.zone} Zone
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-sm font-medium border-2 px-3 py-1.5 flex items-center gap-2",
                statusColors[order.status]
              )}
            >
              {(() => {
                const IconComponent = statusIcons[order.status];
                return IconComponent ? (
                  <IconComponent className="h-3 w-3" />
                ) : null;
              })()}
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Status Progress */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const IconComponent = statusIcons[step.key] || CheckCircle;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                          : isCurrent
                            ? "bg-white border-blue-500 text-blue-500 shadow-lg shadow-blue-200"
                            : "bg-white border-gray-300 text-gray-400"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium mt-2 text-center transition-colors",
                        isCompleted || isCurrent
                          ? "text-gray-900"
                          : "text-gray-500"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Order Items
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {order.items.length} items
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={isAddItemDialogOpen}
                    onOpenChange={setIsAddItemDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Add Item to Order
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Menu Item
                          </label>
                          <Select
                            value={selectedMenuItem}
                            onValueChange={setSelectedMenuItem}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select menu item" />
                            </SelectTrigger>
                            <SelectContent>
                              {menuItems
                                .filter((item) => item.available)
                                .map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    <div className="flex justify-between items-center w-full">
                                      <span>{item.name}</span>
                                      <span className="text-green-600 font-medium">
                                        {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Quantity
                          </label>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                              className="w-10 h-10 rounded-lg border-gray-300"
                            >
                              -
                            </Button>
                            <span className="w-12 text-center text-lg font-semibold">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuantity(quantity + 1)}
                              className="w-10 h-10 rounded-lg border-gray-300"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddItemDialogOpen(false)}
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddItem}
                            disabled={!selectedMenuItem}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm"
                          >
                            Add to Order
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50 hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        {item.quantity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {item.menuItem.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {item.menuItem.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.menuItem.description}
                        </p>
                        {item.notes && (
                          <div className="flex items-start gap-2 mt-2">
                            <FileText className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.menuItem.price)} each
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.menuItem.preparationTime} min
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {order.status !== "Completed" && order.status !== "Cancelled" && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.status === "Pending" && (
                      <Button
                        onClick={() => handleStatusUpdate("Confirmed")}
                        className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Order
                      </Button>
                    )}
                    {order.status === "Ready" && (
                      <Button
                        onClick={() => handleStatusUpdate("Served")}
                        className="h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Mark Served
                      </Button>
                    )}
                    {order.status === "Served" && (
                      <Button
                        onClick={() => handleStatusUpdate("Completed")}
                        className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Complete Order
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsStatusDialogOpen(true)}
                      className="h-12 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Change Status
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate("Cancelled")}
                      className="h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Information */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Table {table.number}
                      </p>
                      <p className="text-sm text-gray-600">{table.zone} Zone</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.waiterName}
                      </p>
                      <p className="text-sm text-gray-600">Waiter</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatTime(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.customerName && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-600">Customer</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge
                      className={cn(
                        "mt-1",
                        priorityColors[order.priority || "Low"]
                      )}
                    >
                      {order.priority || "Low"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Prep Time</p>
                    <p className="font-semibold text-gray-900">
                      {totalPreparationTime} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Order Notes
                </CardTitle>
                <Dialog
                  open={isNotesDialogOpen}
                  onOpenChange={setIsNotesDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Update Order Notes
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add special instructions, dietary restrictions, or other notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        className="resize-none border-gray-300 focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsNotesDialogOpen(false)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleNotesUpdate}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {order.notes ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">
                      {order.notes}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No special notes for this order</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">VAT (18%)</span>
                    <span className="font-medium">
                      {formatCurrency(order.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Service Charge (10%)</span>
                    <span className="font-medium">
                      {formatCurrency(order.serviceCharge)}
                    </span>
                  </div>
                </div>
                <Separator className="bg-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-700">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {order.status !== "Completed" &&
                  order.status !== "Cancelled" && (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300 mt-4"
                      onClick={() =>
                        router.push(`/restaurant/checkout/${order.id}`)
                      }
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
