/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Plus, Trash2, CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useCredit } from "@/context/CreditContext";
import { OrderItem } from "@/src/types/credit";

export default function AddCreditPage() {
  const router = useRouter();
  const { addCreditEntry, loading } = useCredit();
  const [dueDate, setDueDate] = useState<Date>();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemInputChange = (
    field: keyof typeof currentItem,
    value: string
  ) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
  };

  const validateItem = () => {
    if (!currentItem.name.trim()) {
      toast({
        title: "Missing Item Name",
        description: "Please enter an item name.",
        variant: "destructive",
      });
      return false;
    }

    const quantity = Number.parseInt(currentItem.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return false;
    }

    const price = Number.parseFloat(currentItem.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddItem = () => {
    if (!validateItem()) return;

    const newItem: OrderItem = {
      itemId: `temp-${Date.now()}`,
      itemName: currentItem.name,
      quantity: Number.parseInt(currentItem.quantity, 10),
      price: Number.parseFloat(currentItem.price),
      total:
        Number.parseInt(currentItem.quantity, 10) *
        Number.parseFloat(currentItem.price),
    };

    setItems((prev) => [...prev, newItem]);
    setCurrentItem({ name: "", quantity: "", price: "" });
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast({
        title: "Missing Customer Name",
        description: "Please enter the customer name.",
        variant: "destructive",
      });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSaveCredit = async () => {
    if (!validateForm()) return;

    try {
      await addCreditEntry({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: items,
        dateTaken: new Date().toISOString(),
        dueDate: dueDate?.toISOString(),
        totalAmount: calculateTotalAmount(),
      });

      toast({
        title: "Success",
        description: "Credit entry saved successfully.",
      });

      router.push("/credit");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credit entry.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Credit</h1>
          <p className="text-muted-foreground">
            Create a new credit account for a customer
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  placeholder="e.g. +256712345678"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleInputChange("customerPhone", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={currentItem.name}
                  onChange={(e) =>
                    handleItemInputChange("name", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="Qty"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    handleItemInputChange("quantity", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="price">Price (UGX)</Label>
                <Input
                  id="price"
                  placeholder="Price"
                  type="number"
                  value={currentItem.price}
                  onChange={(e) =>
                    handleItemInputChange("price", e.target.value)
                  }
                />
              </div>
              <div className="flex items-end md:col-span-2">
                <Button
                  onClick={handleAddItem}
                  disabled={
                    !currentItem.name ||
                    !currentItem.quantity ||
                    !currentItem.price
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items Added ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)} ={" "}
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.itemId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(calculateTotalAmount())}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCredit}
            disabled={loading || items.length === 0}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Credit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
