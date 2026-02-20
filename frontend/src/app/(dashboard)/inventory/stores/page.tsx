/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/inventory/stores/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Store,
  Warehouse,
  User,
  MapPin,
  Phone,
  Package,
  Repeat,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/DataContext";
import { useBranch } from "@/context/BranchContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

interface StockSummary {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export default function StoreManagementPage() {
  const {
    stores,
    currentStore,
    setCurrentStore,
    getStoresByBranch,
    createStore,
    updateStore,
    deleteStore,
    getStoreStockSummary,
  } = useData();
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    isWarehouse: false,
    managerId: "",
  });
  const [stockSummaries, setStockSummaries] = useState<
    Record<string, StockSummary>
  >({});
  const [loadingSummaries, setLoadingSummaries] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    loadStores();
  }, [currentBranch]);

  const loadStores = async () => {
    if (!currentBranch) return;

    setLoading(true);
    try {
      await getStoresByBranch(currentBranch.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStockSummary = async (storeId: string) => {
    setLoadingSummaries((prev) => ({ ...prev, [storeId]: true }));
    try {
      const summary = await getStoreStockSummary(storeId);
      setStockSummaries((prev) => ({ ...prev, [storeId]: summary }));
    } catch (error) {
      console.error(`Failed to load summary for store ${storeId}:`, error);
      // Set a default summary on error
      setStockSummaries((prev) => ({
        ...prev,
        [storeId]: {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
        },
      }));
    } finally {
      setLoadingSummaries((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  const loadAllStockSummaries = async () => {
    const summaryPromises = stores.map((store) => loadStockSummary(store.id));
    await Promise.all(summaryPromises);
  };

  useEffect(() => {
    if (stores.length > 0) {
      loadAllStockSummaries();
    }
  }, [stores]);

  const handleCreateStore = async () => {
    if (!currentBranch) return;

    try {
      await createStore({
        ...formData,
        branchId: currentBranch.id,
      });

      setStoreDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Store created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create store",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStore = async () => {
    if (!editingStore) return;

    try {
      await updateStore(editingStore.id, formData);

      setStoreDialogOpen(false);
      setEditingStore(null);
      resetForm();
      toast({
        title: "Success",
        description: "Store updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update store",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await deleteStore(storeId);
      toast({
        title: "Success",
        description: "Store deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete store",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      isWarehouse: false,
      managerId: "",
    });
    setEditingStore(null);
  };

  const openEditDialog = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      description: store.description || "",
      address: store.address || "",
      phone: store.phone || "",
      isWarehouse: store.isWarehouse,
      managerId: store.managerId || "",
    });
    setStoreDialogOpen(true);
  };

  const refreshStoreSummary = async (storeId: string) => {
    await loadStockSummary(storeId);
    toast({
      title: "Refreshed",
      description: "Store summary updated",
    });
  };

  // Safe summary access with default values
  const getStoreSummary = (storeId: string): StockSummary => {
    return (
      stockSummaries[storeId] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      }
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">
            Manage stores and warehouses for {currentBranch?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllStockSummaries}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={() => setStoreDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => {
          const summary = getStoreSummary(store.id);
          const isLoading = loadingSummaries[store.id];

          return (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {store.isWarehouse ? (
                        <Warehouse className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Store className="w-5 h-5 text-green-600" />
                      )}
                      {store.name}
                    </CardTitle>
                    {store.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {store.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={store.isActive ? "default" : "secondary"}>
                      {store.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshStoreSummary(store.id)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Store Details */}
                <div className="space-y-2">
                  {store.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {store.phone}
                    </div>
                  )}
                  {store.manager && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {store.manager.firstName} {store.manager.lastName}
                    </div>
                  )}
                </div>

                {/* Stock Summary */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-semibold">
                          {summary.totalItems}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Quantity:</span>
                        <span className="font-semibold">
                          {summary.totalQuantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low Stock:</span>
                        <Badge
                          variant={
                            summary.lowStockItems > 0
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {summary.lowStockItems}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Out of Stock:</span>
                        <Badge
                          variant={
                            summary.outOfStockItems > 0
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {summary.outOfStockItems}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/inventory/stores/${store.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Package className="w-4 h-4 mr-1" />
                      Items
                    </Button>
                  </Link>
                  <Link
                    href={`/inventory/stores/${store.id}/transfers`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Repeat className="w-4 h-4 mr-1" />
                      Transfer
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(store)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={summary.totalQuantity > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{store.name}
                          &quot;?
                          {summary.totalQuantity > 0 && (
                            <span className="text-red-600 block mt-1">
                              This store contains items. Please transfer or
                              remove all items first.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStore(store.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={summary.totalQuantity > 0}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && stores.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No stores found
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by creating your first store or warehouse
            </p>
            <Button onClick={() => setStoreDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Store
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Store Dialog */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "Edit Store" : "Create New Store"}
            </DialogTitle>
            <DialogDescription>
              {editingStore
                ? "Update the store details below."
                : "Add a new store or warehouse to your branch."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter store name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter store description"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Enter store address"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter store phone number"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isWarehouse}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isWarehouse: checked }))
                }
              />
              <Label htmlFor="warehouse">This is a warehouse</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStoreDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingStore ? handleUpdateStore : handleCreateStore}
              disabled={!formData.name.trim()}
            >
              {editingStore ? "Update Store" : "Create Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
