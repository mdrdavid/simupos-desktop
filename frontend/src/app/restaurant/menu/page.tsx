/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  ChefHat,
  Filter,
  Tag,
  Sparkles,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";

export default function MenuPage() {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem } =
    useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(menuItems.map((item) => item.category))
    );
    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && item.available) ||
        (availabilityFilter === "Unavailable" && !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [menuItems, searchTerm, selectedCategory, availabilityFilter]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Food",
    preparationTime: "",
    available: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Food",
      preparationTime: "",
      available: true,
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category as any,
      preparationTime: Number(formData.preparationTime),
      available: formData.available,
      ingredients: [],
      modifiers: [],
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      createMenuItem(itemData);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      available: item.available,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      deleteMenuItem(itemId);
    }
  };

  const toggleAvailability = (itemId: string, currentStatus: boolean) => {
    updateMenuItem(itemId, { available: !currentStatus });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalItems = menuItems.length;
    const availableItems = menuItems.filter((item) => item.available).length;
    const averagePrice =
      menuItems.reduce((sum, item) => sum + item.price, 0) / totalItems || 0;
    const categoriesCount = new Set(menuItems.map((item) => item.category))
      .size;

    return { totalItems, availableItems, averagePrice, categoriesCount };
  }, [menuItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Menu Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and organize your restaurant menu items
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-11 px-6"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Item Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Chicken Burger"
                      className="border-gray-300 focus:border-blue-500 h-11"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the item, ingredients, and special features..."
                      rows={3}
                      className="resize-none border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Price (UGX) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          placeholder="0"
                          className="pl-10 border-gray-300 focus:border-blue-500 h-11"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Prep Time (min) *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          value={formData.preparationTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preparationTime: e.target.value,
                            })
                          }
                          placeholder="0"
                          className="pl-10 border-gray-300 focus:border-blue-500 h-11"
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food">🍽️ Food</SelectItem>
                        <SelectItem value="Drinks">🥤 Drinks</SelectItem>
                        <SelectItem value="Sides">🍟 Sides</SelectItem>
                        <SelectItem value="Desserts">🍰 Desserts</SelectItem>
                        <SelectItem value="Appetizers">
                          🥗 Appetizers
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {formData.available ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Available for Order
                        </label>
                        <p className="text-xs text-gray-500">
                          {formData.available
                            ? "Item is visible to customers"
                            : "Item is hidden from menu"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, available: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm h-11"
                  >
                    {editingItem ? "Update Menu Item" : "Add to Menu"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1 border-gray-300 hover:bg-gray-50 h-11"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                    {stats.totalItems}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChefHat className="h-4 w-4 text-blue-600" />
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
                    {stats.availableItems}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Avg Price
                  </p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatCurrency(stats.averagePrice)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.categoriesCount}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Tag className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search menu items by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter by Category
                    </span>
                  </div>
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
                </div>

                {/* Availability Filter */}
                <div className="lg:w-48">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Availability
                    </span>
                  </div>
                  <Select
                    value={availabilityFilter}
                    onValueChange={setAvailabilityFilter}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Items</SelectItem>
                      <SelectItem value="Available">Available Only</SelectItem>
                      <SelectItem value="Unavailable">
                        Unavailable Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Grid */}
        <div className="space-y-4">
          {filteredMenuItems.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ||
                  selectedCategory !== "All" ||
                  availabilityFilter !== "All"
                    ? "No matching items found"
                    : "No menu items yet"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  {searchTerm ||
                  selectedCategory !== "All" ||
                  availabilityFilter !== "All"
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "Start building your menu by adding your first delicious item."}
                </p>
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
                    item.available
                      ? "bg-white/80 backdrop-blur-sm"
                      : "bg-gray-50/80 backdrop-blur-sm"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-semibold text-lg mb-1 truncate",
                              item.available ? "text-gray-900" : "text-gray-500"
                            )}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={item.available ? "default" : "secondary"}
                              className={cn(
                                "text-xs",
                                item.available
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              )}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={cn(
                          "text-sm line-clamp-2",
                          item.available ? "text-gray-600" : "text-gray-500"
                        )}
                      >
                        {item.description}
                      </p>

                      {/* Details */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              item.available ? "text-gray-600" : "text-gray-500"
                            )}
                          >
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              item.available ? "text-gray-600" : "text-gray-500"
                            )}
                          >
                            <Clock className="h-4 w-4" />
                            <span>{item.preparationTime}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleAvailability(item.id, item.available)
                          }
                          className={cn(
                            "text-xs h-8",
                            item.available
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          )}
                        >
                          {item.available ? (
                            <EyeOff className="h-3 w-3 mr-1" />
                          ) : (
                            <Eye className="h-3 w-3 mr-1" />
                          )}
                          {item.available ? "Hide" : "Show"}
                        </Button>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 border-gray-300 hover:border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
