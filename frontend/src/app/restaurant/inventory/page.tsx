/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  TrendingDown,
  Edit,
  Camera,
  Zap,
  BarChart3,
  ShoppingCart,
  ArrowUpDown,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ingredient } from "@/src/types/restaurant";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function RestaurantInventory() {
  const { ingredients, updateIngredientStock, menuItems } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const [addFormData, setAddFormData] = useState({
    name: "",
    unit: "",
    cost: "",
    current: "",
    min: "",
    max: "",
  });
  const [formattedAddValues, setFormattedAddValues] = useState({
    cost: "",
    current: "",
    min: "",
    max: "",
  });

  const statusOptions = [
    { value: "All", label: "All Items", color: "gray" },
    { value: "In Stock", label: "In Stock", color: "green" },
    { value: "Low Stock", label: "Low Stock", color: "orange" },
    { value: "Out of Stock", label: "Out of Stock", color: "red" },
  ];

  const filteredIngredients = useMemo(() => {
    let filtered = ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((ingredient) => {
        const status = getStockStatus(ingredient).status;
        return status === statusFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stock-low":
          return a.currentStock - b.currentStock;
        case "stock-high":
          return b.currentStock - a.currentStock;
        case "cost-low":
          return a.cost - b.cost;
        case "cost-high":
          return b.cost - a.cost;
        default:
          return 0;
      }
    });

    return filtered;
  }, [ingredients, searchTerm, statusFilter, sortBy]);

  const lowStockItems = ingredients.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > 0
  );
  const outOfStockItems = ingredients.filter((item) => item.currentStock === 0);
  const inStockItems = ingredients.filter(
    (item) => item.currentStock > item.minStock
  );

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock === 0)
      return {
        status: "Out of Stock",
        color: "destructive",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    if (ingredient.currentStock <= ingredient.minStock)
      return {
        status: "Low Stock",
        color: "secondary",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      };
    if (ingredient.currentStock >= ingredient.maxStock)
      return {
        status: "Overstocked",
        color: "default",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      };
    return {
      status: "In Stock",
      color: "outline",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    };
  };

  const getLinkedMenuItems = (ingredientName: string) => {
    return menuItems.filter((item) =>
      item.ingredients.some((ing) =>
        ing.toLowerCase().includes(ingredientName.toLowerCase())
      )
    );
  };

  const handleStockUpdate = (ingredientId: string, newStock: number) => {
    updateIngredientStock(ingredientId, newStock);
  };

  const handleAddFormChange = (field: string, value: string) => {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFormNumericChange = (field: string, value: string) => {
    const formatted = formatNumberWithCommas(value);
    setFormattedAddValues((prev) => ({ ...prev, [field]: formatted }));
    setAddFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate inventory value
  const totalInventoryValue = useMemo(() => {
    return ingredients.reduce(
      (total, item) => total + item.currentStock * item.cost,
      0
    );
  }, [ingredients]);

  const lowStockValue = useMemo(() => {
    return lowStockItems.reduce(
      (total, item) => total + item.currentStock * item.cost,
      0
    );
  }, [lowStockItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-600 text-lg">
              Track and manage your restaurant ingredients and stock levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Inventory Item
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ingredient Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Chicken Breast"
                      value={addFormData.name}
                      onChange={(e) =>
                        handleAddFormChange("name", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="unit"
                        className="text-sm font-medium text-gray-700"
                      >
                        Unit
                      </Label>
                      <Input
                        id="unit"
                        placeholder="e.g., kg, liters"
                        value={addFormData.unit}
                        onChange={(e) =>
                          handleAddFormChange("unit", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="cost"
                        className="text-sm font-medium text-gray-700"
                      >
                        Cost per Unit
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          UGX
                        </span>
                        <Input
                          id="cost"
                          type="text"
                          placeholder="0"
                          value={formattedAddValues.cost}
                          onChange={(e) =>
                            handleAddFormNumericChange("cost", e.target.value)
                          }
                          className="border-gray-300 focus:border-green-500 pl-12"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="current"
                        className="text-sm font-medium text-gray-700"
                      >
                        Current Stock
                      </Label>
                      <Input
                        id="current"
                        type="text"
                        placeholder="0"
                        value={formattedAddValues.current}
                        onChange={(e) =>
                          handleAddFormNumericChange("current", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="min"
                        className="text-sm font-medium text-gray-700"
                      >
                        Min Stock
                      </Label>
                      <Input
                        id="min"
                        type="text"
                        placeholder="0"
                        value={formattedAddValues.min}
                        onChange={(e) =>
                          handleAddFormNumericChange("min", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="max"
                        className="text-sm font-medium text-gray-700"
                      >
                        Max Stock
                      </Label>
                      <Input
                        id="max"
                        type="text"
                        placeholder="0"
                        value={formattedAddValues.max}
                        onChange={(e) =>
                          handleAddFormNumericChange("max", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                    Add to Inventory
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {ingredients.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    In Stock
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {inStockItems.length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {lowStockItems.length}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {outOfStockItems.length}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {outOfStockItems.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/30 border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-lg text-red-800">
                      Out of Stock
                    </CardTitle>
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-700 border-red-200"
                    >
                      {outOfStockItems.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {outOfStockItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                      >
                        <div>
                          <span className="font-medium text-red-900">
                            {item.name}
                          </span>
                          <p className="text-sm text-red-600">
                            0 {item.unit} remaining
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Order Now
                        </Button>
                      </div>
                    ))}
                    {outOfStockItems.length > 3 && (
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          View All {outOfStockItems.length} Items
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {lowStockItems.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30 border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg text-orange-800">
                      Low Stock Alert
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      {lowStockItems.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                      >
                        <div>
                          <span className="font-medium text-orange-900">
                            {item.name}
                          </span>
                          <p className="text-sm text-orange-600">
                            {item.currentStock.toFixed(2)} {item.unit} left •
                            Min: {item.minStock.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Restock
                        </Button>
                      </div>
                    ))}
                    {lowStockItems.length > 3 && (
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          View All {lowStockItems.length} Items
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search ingredients by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 transition-colors"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter by Status
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant={
                          statusFilter === status.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(status.value)}
                        className={cn(
                          "whitespace-nowrap transition-all duration-200",
                          statusFilter === status.value
                            ? `bg-gradient-to-r from-${status.color}-600 to-${status.color}-700 hover:from-${status.color}-700 hover:to-${status.color}-800 text-white shadow-sm`
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        )}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="lg:w-48">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Sort by
                    </span>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="stock-low">
                        Stock (Low to High)
                      </SelectItem>
                      <SelectItem value="stock-high">
                        Stock (High to Low)
                      </SelectItem>
                      <SelectItem value="cost-low">
                        Cost (Low to High)
                      </SelectItem>
                      <SelectItem value="cost-high">
                        Cost (High to Low)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Items */}
        <div className="space-y-4">
          {filteredIngredients.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "All"
                    ? "No matching items"
                    : "No inventory items"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first inventory item"}
                </p>
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredIngredients.map((ingredient) => {
                const stockStatus = getStockStatus(ingredient);
                const linkedItems = getLinkedMenuItems(ingredient.name);
                const stockPercentage =
                  (ingredient.currentStock / ingredient.maxStock) * 100;

                return (
                  <Card
                    key={ingredient.id}
                    className={cn(
                      "border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
                      stockStatus.bgColor
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg truncate">
                                {ingredient.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium border-2",
                                  stockStatus.textColor,
                                  stockStatus.borderColor
                                )}
                              >
                                {stockStatus.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Unit: {ingredient.unit}</span>
                              <span>•</span>
                              <span className="font-semibold">
                                {formatCurrency(ingredient.cost)}/
                                {ingredient.unit}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-gray-300"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-gray-300"
                            >
                              <Camera className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Stock Information */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-2xl font-bold text-gray-900">
                                {ingredient.currentStock.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600">
                                Current Stock
                              </p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(
                                  ingredient.currentStock * ingredient.cost
                                )}
                              </p>
                              <p className="text-xs text-gray-600">
                                Stock Value
                              </p>
                            </div>
                          </div>

                          {/* Stock Level Bar */}
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Stock Level</span>
                              <span className="font-semibold">
                                {Math.round(stockPercentage)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={cn(
                                  "h-2.5 rounded-full transition-all duration-500",
                                  stockPercentage <= 20
                                    ? "bg-red-500"
                                    : stockPercentage <= 50
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                )}
                                style={{
                                  width: `${Math.min(stockPercentage, 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Min: {ingredient.minStock}</span>
                              <span>Max: {ingredient.maxStock}</span>
                            </div>
                          </div>
                        </div>

                        {/* Linked Menu Items */}
                        {linkedItems.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Used in Menu Items:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {linkedItems.slice(0, 2).map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="outline"
                                  className="bg-white text-gray-700 border-gray-300 text-xs"
                                >
                                  {item.name}
                                </Badge>
                              ))}
                              {linkedItems.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="bg-white text-gray-500 border-gray-300 text-xs"
                                >
                                  +{linkedItems.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Stock Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStockUpdate(
                                ingredient.id,
                                Math.max(0, ingredient.currentStock - 0.5)
                              )
                            }
                            className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-xs"
                          >
                            -0.5
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStockUpdate(
                                ingredient.id,
                                ingredient.currentStock + 0.5
                              )
                            }
                            className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-xs"
                          >
                            +0.5
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStockUpdate(
                                ingredient.id,
                                Math.max(0, ingredient.currentStock - 1)
                              )
                            }
                            className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-xs"
                          >
                            -1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStockUpdate(
                                ingredient.id,
                                ingredient.currentStock + 1
                              )
                            }
                            className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-xs"
                          >
                            +1
                          </Button>
                        </div>

                        {/* Restock Button */}
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
                        >
                          <ShoppingCart className="h-3 w-3 mr-2" />
                          Restock Item
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory Summary */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-900">
                  {ingredients.length}
                </p>
                <p className="text-sm text-purple-700 font-medium">
                  Total Items
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-900">
                  {inStockItems.length}
                </p>
                <p className="text-sm text-green-700 font-medium">In Stock</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-900">
                  {lowStockItems.length}
                </p>
                <p className="text-sm text-orange-700 font-medium">Low Stock</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">
                  {outOfStockItems.length}
                </p>
                <p className="text-sm text-red-700 font-medium">Out of Stock</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    Total Inventory Value
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(totalInventoryValue)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current value of all stocked items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Low Stock Value</p>
                  <p className="text-lg font-semibold text-orange-700">
                    {formatCurrency(lowStockValue)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
