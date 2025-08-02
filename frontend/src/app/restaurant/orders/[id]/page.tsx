/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Preparing: "bg-orange-100 text-orange-800",
  Ready: "bg-green-100 text-green-800",
  Served: "bg-purple-100 text-purple-800",
  Completed: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
  Open: "bg-blue-100 text-blue-800",
};

const priorityColors = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

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

  if (!order || !table) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              The order you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.back()} variant="outline">
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
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
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
      modifiers: [], // Add empty array for modifiers
      status: "Pending", // Add default status
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                Order #{order.id.slice(-6)}
              </h1>
              <p className="text-sm text-gray-600">Table {table.number}</p>
            </div>
          </div>
          <Badge className={cn("text-xs", statusColors[order.status])}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order Information</CardTitle>
              <Dialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select onValueChange={handleStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Preparing">Preparing</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="Served">Served</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Table {table.number}</p>
                  <p className="text-xs text-gray-600">{table.zone} Zone</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{order.waiterName}</p>
                  <p className="text-xs text-gray-600">Waiter</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">
                    {formatTime(order.createdAt)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Priority</p>
                {/* <Badge className={cn("text-xs mt-1", priorityColors[order.priority])}>{order.priority}</Badge>
                 */}
                <Badge
                  className={cn(
                    "text-xs mt-1",
                    priorityColors[order.priority || "Low"]
                  )}
                >
                  {order.priority || "Low"}
                </Badge>
              </div>
            </div>

            {order.customerName && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{order.customerName}</p>
                  <p className="text-xs text-gray-600">Customer</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Order Items ({order.items.length})
              </CardTitle>
              <Dialog
                open={isAddItemDialogOpen}
                onOpenChange={setIsAddItemDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Item to Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select
                      value={selectedMenuItem}
                      onValueChange={setSelectedMenuItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select menu item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems
                          .filter((item) => item.available)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {formatCurrency(item.price)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddItemDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddItem}
                        disabled={!selectedMenuItem}
                        className="flex-1"
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {item.menuItem.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        x{item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.menuItem.description}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-blue-600 mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.menuItem.price)} each
                    </p>
                  </div>
                </div>
                {index < order.items.length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Notes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order Notes</CardTitle>
              <Dialog
                open={isNotesDialogOpen}
                onOpenChange={setIsNotesDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Order Notes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add special instructions or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsNotesDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleNotesUpdate} className="flex-1">
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {order.notes ? (
              <p className="text-sm text-gray-700">{order.notes}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No special notes for this order
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (18%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge (10%)</span>
              <span>{formatCurrency(order.serviceCharge)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {order.status !== "Completed" && order.status !== "Cancelled" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {order.status === "Pending" && (
                  <Button
                    onClick={() => handleStatusUpdate("Confirmed")}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirm Order</span>
                  </Button>
                )}
                {order.status === "Ready" && (
                  <Button
                    onClick={() => handleStatusUpdate("Served")}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark Served</span>
                  </Button>
                )}
                {order.status === "Served" && (
                  <Button
                    onClick={() => handleStatusUpdate("Completed")}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Complete Order</span>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate("Cancelled")}
                  className="flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel Order</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
