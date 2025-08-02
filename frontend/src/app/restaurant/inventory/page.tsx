/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Ingredient } from "@/src/types/restaurant";

export default function RestaurantInventory() {
  const { ingredients, updateIngredientStock, menuItems } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = ingredients.filter(
    (item) => item.currentStock <= item.minStock
  );
  const outOfStockItems = ingredients.filter((item) => item.currentStock === 0);

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock === 0)
      return { status: "Out of Stock", color: "destructive" };
    if (ingredient.currentStock <= ingredient.minStock)
      return { status: "Low Stock", color: "secondary" };
    if (ingredient.currentStock >= ingredient.maxStock)
      return { status: "Overstocked", color: "default" };
    return { status: "In Stock", color: "outline" };
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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">
            Manage your restaurant ingredients and stock
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ingredient Name</Label>
                <Input id="name" placeholder="e.g., Chicken Breast" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="e.g., kg, liters" />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit</Label>
                  <Input id="cost" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current">Current Stock</Label>
                  <Input id="current" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="min">Min Stock</Label>
                  <Input id="min" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="max">Max Stock</Label>
                  <Input id="max" type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full">Add to Inventory</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg text-red-800">
                    Out of Stock
                  </CardTitle>
                  <Badge variant="destructive">{outOfStockItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-red-700 font-medium">
                        {item.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 bg-transparent"
                      >
                        Restock
                      </Button>
                    </div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <p className="text-sm text-red-600">
                      +{outOfStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg text-orange-800">
                    Low Stock
                  </CardTitle>
                  <Badge variant="secondary">{lowStockItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-orange-700 font-medium">
                        {item.name}
                      </span>
                      <span className="text-sm text-orange-600">
                        {item.currentStock} {item.unit} left
                      </span>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-orange-600">
                      +{lowStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Items */}
      <div className="space-y-4">
        {filteredIngredients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No ingredients found</p>
            </CardContent>
          </Card>
        ) : (
          filteredIngredients.map((ingredient) => {
            const stockStatus = getStockStatus(ingredient);
            const linkedItems = getLinkedMenuItems(ingredient.name);
            const stockPercentage =
              (ingredient.currentStock / ingredient.maxStock) * 100;

            return (
              <Card
                key={ingredient.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {ingredient.name}
                        </h3>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status}
                        </Badge>
                        {ingredient.currentStock <= ingredient.minStock && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-semibold text-lg">
                            {ingredient.currentStock} {ingredient.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Cost per {ingredient.unit}
                          </p>
                          <p className="font-semibold">
                            UGX {ingredient.cost.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Stock Level</span>
                          <span>{Math.round(stockPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stockPercentage <= 20
                                ? "bg-red-500"
                                : stockPercentage <= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
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

                      {/* Linked Menu Items */}
                      {linkedItems.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Used in:</p>
                          <div className="flex flex-wrap gap-1">
                            {linkedItems.slice(0, 3).map((item) => (
                              <Badge
                                key={item.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {item.name}
                              </Badge>
                            ))}
                            {linkedItems.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{linkedItems.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stock Actions */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStockUpdate(
                          ingredient.id,
                          Math.max(0, ingredient.currentStock - 1)
                        )
                      }
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
                    >
                      +1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStockUpdate(
                          ingredient.id,
                          ingredient.currentStock + 5
                        )
                      }
                    >
                      +5
                    </Button>
                    <div className="flex-1" />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Restock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Inventory Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Inventory Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {ingredients.length}
              </p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {ingredients.filter((i) => i.currentStock > i.minStock).length}
              </p>
              <p className="text-sm text-gray-600">In Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {lowStockItems.length}
              </p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {outOfStockItems.length}
              </p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
