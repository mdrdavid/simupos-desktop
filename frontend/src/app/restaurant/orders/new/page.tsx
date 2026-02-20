/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  Users,
  Table,
  ChefHat,
  Clock,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MenuModifier } from "@/src/types/restaurant";

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tables, menuItems, users, createOrder, addItemToOrder } =
    useRestaurant();

  const [selectedTableId, setSelectedTableId] = useState(
    searchParams.get("tableId") || ""
  );
  const [selectedWaiterId, setSelectedWaiterId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(menuItems.map((item) => item.category))
    );
    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const availableTables = tables.filter(
    (table) => table.status === "Available"
  );
  const waiters = users.filter(
    (user) => user.role.name === "Waiter" || user.role.name === "Admin"
  );

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && item.available;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  const addToCart = (menuItem: any, modifiers: MenuModifier[] = []) => {
    const existingItem = cart.find(
      (item) =>
        item.menuItemId === menuItem.id &&
        JSON.stringify(item.modifiers) === JSON.stringify(modifiers) &&
        item.notes === ""
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                price:
                  (item.quantity + 1) *
                  (menuItem.price +
                    modifiers.reduce((sum, mod) => sum + mod.price, 0)),
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
        modifiers: modifiers || [],
        status: "Pending",
        price:
          menuItem.price + modifiers.reduce((sum, mod) => sum + mod.price, 0),
        notes: "",
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

  const removeItemCompletely = (itemId: string) => {
    setCart(cart.filter((cartItem) => cartItem.id !== itemId));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart(
      cart.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    if (
      !selectedTableId ||
      !selectedWaiterId ||
      cart.length === 0 ||
      !selectedWaiter
    ) {
      alert("Please select a table, waiter, and add items to the order");
      return;
    }

    setIsCreating(true);
    try {
      // Get the waiter name from the selected waiter
      const waiterName = selectedWaiter.name;

      // Call createOrder with all required parameters
      const order = await createOrder(
        selectedTableId,
        selectedWaiterId,
        waiterName
      );

      if (order && order.id) {
        // Add each cart item to the order
        for (const item of cart) {
          try {
            await addItemToOrder(
              order.id,
              item.menuItemId,
              item.quantity,
              item.modifiers,
              item.notes // Use item.notes as specialInstructions
            );
          } catch (error) {
            console.error(`Failed to add item ${item.menuItem.name}:`, error);
          }
        }

        // Add a small delay to show the loading state
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push(`/restaurant/orders/${order.id}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  const selectedTable = availableTables.find(
    (table) => table.id === selectedTableId
  );
  const selectedWaiter = waiters.find(
    (waiter) => waiter.id === selectedWaiterId
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/restaurant/orders">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Create New Order
            </h1>
            <p className="text-gray-600 text-lg">
              Select table, add items, and create your order
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Setup & Menu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Setup */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Order Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Table
                    </label>
                    <Select
                      value={selectedTableId}
                      onValueChange={setSelectedTableId}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 h-11">
                        <SelectValue placeholder="Choose a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTables.map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Table className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  Table {table.number}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {table.zone} Zone • {table.capacity} seats
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Assign Waiter
                    </label>
                    <Select
                      value={selectedWaiterId}
                      onValueChange={setSelectedWaiterId}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 h-11">
                        <SelectValue placeholder="Select waiter" />
                      </SelectTrigger>
                      <SelectContent>
                        {waiters.map((waiter) => (
                          <SelectItem key={waiter.id} value={waiter.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="font-medium">{waiter.name}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Info */}
                {(selectedTable || selectedWaiter) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {selectedTable && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Table className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Table {selectedTable.number}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedTable.zone} Zone
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedWaiter && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedWaiter.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Assigned Waiter
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Selection */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  Menu Items
                  <Badge
                    variant="secondary"
                    className="bg-orange-50 text-orange-700"
                  >
                    {filteredMenuItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search menu items or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "whitespace-nowrap transition-all duration-200",
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      )}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                            {item.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200 text-xs"
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime} min
                          </div>
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => addToCart(item, [])} // Pass empty modifiers if not available
                        className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Order
                      </Button>
                    </div>
                  ))}
                </div>

                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No items available in this category"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cart */}
          <div className="space-y-6">
            {/* Cart */}
            <Card
              className={cn(
                "border-0 shadow-sm sticky top-4 transition-all duration-300",
                cart.length > 0
                  ? "bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm"
                  : "bg-white/80 backdrop-blur-sm"
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Order Summary
                  {cart.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700"
                    >
                      {getTotalItems()} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add items from the menu to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {item.menuItem.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.menuItem.price)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemCompletely(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 p-0 border-gray-300 hover:border-gray-400"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold text-gray-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item.menuItem)}
                                className="w-8 h-8 p-0 border-gray-300 hover:border-gray-400"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-bold text-green-600">
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          {/* Item Notes */}
                          <div className="mt-2">
                            <Textarea
                              placeholder="Add special instructions..."
                              value={item.notes}
                              onChange={(e) =>
                                updateItemNotes(item.id, e.target.value)
                              }
                              rows={1}
                              className="text-xs resize-none border-gray-200 focus:border-blue-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      {/* Total */}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-green-700 text-xl">
                          {formatCurrency(getTotalAmount())}
                        </span>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Order Notes
                        </label>
                        <Textarea
                          placeholder="Special instructions, dietary restrictions, or other notes for the kitchen..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={3}
                          className="resize-none border-gray-300 focus:border-blue-500"
                        />
                      </div>

                      {/* Create Order Button */}
                      <Button
                        onClick={handleCreateOrder}
                        disabled={
                          isCreating || !selectedTableId || !selectedWaiterId
                        }
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg font-semibold"
                        size="lg"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating Order...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Create Order
                          </>
                        )}
                      </Button>

                      {/* Validation Message */}
                      {(!selectedTableId || !selectedWaiterId) && (
                        <p className="text-sm text-red-600 text-center">
                          Please select both table and waiter to continue
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {cart.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-semibold">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Items:</span>
                      <span className="font-semibold">{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Estimated Prep Time:
                      </span>
                      <span className="font-semibold">
                        {Math.max(
                          ...cart.map((item) => item.menuItem.preparationTime)
                        )}{" "}
                        min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
