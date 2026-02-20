/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAgroProduct } from "@/context/AgroProductContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Plus,
  Trash2,
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { capitalizeWords } from "@/src/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgroProduct, AgroProductVariant } from "@/src/types/agroProduct";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ProductOrVariant =
  | { type: "product"; data: AgroProduct }
  | { type: "variant"; data: AgroProductVariant; productId: string };

export default function AgroInventoryPage() {
  const {
    agroProducts,
    loading,
    fetchProductsByBranch,
    deleteAgroProduct,
    deleteAgroProductVariant,
    updateAgroProduct,
    updateAgroProductVariant,
  } = useAgroProduct();
  const { currentBranchId } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductOrVariant | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (currentBranchId) {
      if (showRefresh) {
        setRefreshing(true);
      }
      await fetchProductsByBranch(currentBranchId);
      if (showRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranchId]);

  const handleEditClick = (item: ProductOrVariant) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (item: ProductOrVariant) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === "product") {
        await deleteAgroProduct(selectedItem.data.id);
      } else if (selectedItem.type === "variant") {
        await deleteAgroProductVariant(
          selectedItem.productId,
          selectedItem.data.id
        );
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Optionally, show a toast notification with the error
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    unitOfMeasure: z.string().min(1, {
      message: "Unit of measure is required.",
    }),
    currentAverageCostPrice: z.coerce
      .number()
      .min(0, {
        message: "Cost price must be a positive number.",
      })
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      unitOfMeasure: "",
      currentAverageCostPrice: 0,
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        name: selectedItem.data.name,
        description: selectedItem.data.description || "",
        unitOfMeasure: selectedItem.data.unitOfMeasure,
        currentAverageCostPrice: selectedItem.data.currentAverageCostPrice || 0,
      });
    }
  }, [selectedItem, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === "product") {
        await updateAgroProduct(selectedItem.data.id, values);
      } else if (selectedItem.type === "variant") {
        await updateAgroProductVariant(
          selectedItem.productId,
          selectedItem.data.id,
          values
        );
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      // Optionally, show a toast notification with the error
    } finally {
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    }
  }

  // Filter products based on search term
  const filteredProducts = agroProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variants?.some((variant) =>
        variant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "destructive" };
    if (quantity <= 10) return { label: "Low Stock", color: "secondary" };
    return { label: "In Stock", color: "default" };
  };

  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString("en-US") || "0";
  };

  const SkeletonCard = () => (
    <Card className="border-2 border-gray-200/60 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Agro Inventory
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Manage your agricultural products and variants
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl transition-all duration-300"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
            <Link href="/agro/add">
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products or variants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200/60 focus:border-teal-300 rounded-xl bg-white/50 transition-colors"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 border-2 border-gray-200/60 hover:border-teal-300 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {agroProducts.length}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Total Variants
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {agroProducts.reduce(
                          (acc, product) =>
                            acc + (product.variants?.length || 0),
                          0
                        )}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">
                        Active Items
                      </p>
                      <p className="text-2xl font-bold text-amber-900">
                        {agroProducts.filter((p) => p.isActive).length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 hover:border-teal-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">
                            {capitalizeWords(product.name)}
                          </CardTitle>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleEditClick({
                                type: "product",
                                data: product,
                              })
                            }
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteClick({
                                type: "product",
                                data: product,
                              })
                            }
                            className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.hasVariants && (
                          <Badge
                            variant="secondary"
                            className="bg-teal-100 text-teal-700 border-teal-200"
                          >
                            {product.variants?.length || 0} variants
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-700"
                        >
                          {product.unitOfMeasure}
                        </Badge>
                        {!product.hasVariants && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-200"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            UGX{" "}
                            {formatCurrency(
                              product.currentAverageCostPrice || 0
                            )}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {product.hasVariants ? (
                        <div className="space-y-3">
                          {product.variants?.map((variant) => {
                            const stockStatus = getStockStatus(
                              Math.floor(variant.totalStockQuantity)
                            );
                            return (
                              <div
                                key={variant.id}
                                className="border-2 border-gray-200/60 rounded-xl p-3 bg-white/50 hover:bg-white transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="space-y-1 flex-1">
                                    <h3 className="font-semibold text-gray-800">
                                      {capitalizeWords(variant.name)}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={stockStatus.color as any}
                                        className="text-xs"
                                      >
                                        {stockStatus.label}
                                      </Badge>
                                      <span className="text-sm text-gray-600">
                                        {Math.floor(variant.totalStockQuantity)}{" "}
                                        {variant.unitOfMeasure}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                                      >
                                        <DollarSign className="h-2.5 w-2.5 mr-1" />
                                        UGX{" "}
                                        {formatCurrency(
                                          variant.currentAverageCostPrice || 0
                                        )}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleEditClick({
                                          type: "variant",
                                          data: variant,
                                          productId: product.id,
                                        })
                                      }
                                      className="h-6 w-6 text-blue-600 hover:bg-blue-50"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteClick({
                                          type: "variant",
                                          data: variant,
                                          productId: product.id,
                                        })
                                      }
                                      className="h-6 w-6 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <Link
                                  href={`/agro/${product.id}/variants/${variant.id}/stock`}
                                >
                                  <Button
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300"
                                  >
                                    Manage Stock
                                  </Button>
                                </Link>
                              </div>
                            );
                          })}
                          <Link href={`/agro/${product.id}/variants/add`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-2 border-teal-200 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Plus className="mr-2 h-3.5 w-3.5" />
                              Add Variant
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200/60">
                            <div>
                              <p className="font-semibold text-gray-700">
                                Current Stock
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    getStockStatus(
                                      Math.floor(product.totalStockQuantity)
                                    ).color as any
                                  }
                                >
                                  {
                                    getStockStatus(
                                      Math.floor(product.totalStockQuantity)
                                    ).label
                                  }
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {Math.floor(product.totalStockQuantity)}{" "}
                                  {product.unitOfMeasure}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                  <DollarSign className="h-2.5 w-2.5 mr-1" />
                                  UGX{" "}
                                  {formatCurrency(
                                    product.currentAverageCostPrice || 0
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Link href={`/agro/${product.id}/stock`}>
                            <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300">
                              Manage Stock
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Products Found
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Get started by adding your first agricultural product"}
                      </p>
                      <Link href="/agro/add">
                        <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Product
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-lg font-bold">
                <Pencil className="h-5 w-5 text-teal-600" />
                <span>
                  Edit{" "}
                  {selectedItem?.type === "product" ? "Product" : "Variant"}
                </span>
              </DialogTitle>
              <DialogDescription>
                Make changes to your{" "}
                {selectedItem?.type === "product" ? "product" : "variant"} here.
                Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Product or variant name"
                          {...field}
                          className="border-2 border-gray-200 focus:border-teal-300 rounded-xl h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitOfMeasure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Unit of Measure
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., kg, L, piece"
                          {...field}
                          className="border-2 border-gray-200 focus:border-teal-300 rounded-xl h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentAverageCostPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Cost Price (UGX)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter cost price"
                          {...field}
                          className="border-2 border-gray-200 focus:border-teal-300 rounded-xl h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description"
                          className="resize-none border-2 border-gray-200 focus:border-teal-300 rounded-xl min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-2 border-gray-200 hover:border-gray-300 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-lg font-bold text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Confirm Deletion</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {selectedItem?.data.name}
                </span>
                ? This action cannot be undone and will permanently remove the{" "}
                {selectedItem?.type === "product"
                  ? "product and all its variants"
                  : "variant"}
                .
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Warning: This action is irreversible
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-2 border-gray-200 hover:border-gray-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

