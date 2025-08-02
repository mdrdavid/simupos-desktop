/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Minus, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tables, menuItems, users, createOrder, addItemToOrder } =
    useRestaurant();

  const [selectedTableId, setSelectedTableId] = useState(
    searchParams.get("tableId") || ""
  );
  const [selectedWaiterId, setSelectedWaiterId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Food");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [orderNotes, setOrderNotes] = useState("");

  const categories = ["Food", "Drinks", "Sides", "Desserts"];
  const availableTables = tables.filter(
    (table) => table.status === "Available"
  );
  const waiters = users.filter(
    (user) => user.role.name === "Waiter" || user.role.name === "Admin"
  );

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const addToCart = (menuItem: any) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItem.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                price: (item.quantity + 1) * menuItem.price,
              }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        menuItem,
        quantity: 1,
        modifiers: [],
        status: "Pending",
        price: menuItem.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const item = cart.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? {
                ...cartItem,
                quantity: cartItem.quantity - 1,
                price: (cartItem.quantity - 1) * cartItem.menuItem.price,
              }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem.id !== itemId));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleCreateOrder = () => {
    if (!selectedTableId || !selectedWaiterId || cart.length === 0) {
      alert("Please select a table, waiter, and add items to the order");
      return;
    }

    const orderId = createOrder(selectedTableId, selectedWaiterId);

    if (orderId) {
      cart.forEach((item) => {
        addItemToOrder(orderId, item);
      });

      router.push(`/restaurant/orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/restaurant/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-600">Create a new restaurant order</p>
        </div>
      </div>

      {/* Order Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Table
              </label>
              <Select
                value={selectedTableId}
                onValueChange={setSelectedTableId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.number} ({table.zone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Waiter
              </label>
              <Select
                value={selectedWaiterId}
                onValueChange={setSelectedWaiterId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select waiter" />
                </SelectTrigger>
                <SelectContent>
                  {waiters.map((waiter) => (
                    <SelectItem key={waiter.id} value={waiter.id}>
                      {waiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "whitespace-nowrap",
                  selectedCategory === category &&
                    "bg-[#41A5A5] hover:bg-[#2E8B8B]"
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.description}
                  </p>
                  <p className="font-medium text-[#41A5A5]">
                    UGX {item.price.toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToCart(item)}
                  className="bg-[#41A5A5] hover:bg-[#2E8B8B]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Order Summary ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.menuItem.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    UGX {item.menuItem.price.toLocaleString()} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(item.menuItem)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-[#41A5A5] min-w-[80px] text-right">
                    UGX {item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-xl font-bold text-[#41A5A5]">
                  UGX {getTotalAmount().toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Order Notes
                  </label>
                  <Textarea
                    placeholder="Special instructions or notes..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateOrder}
                  className="w-full bg-[#41A5A5] hover:bg-[#2E8B8B]"
                  size="lg"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
