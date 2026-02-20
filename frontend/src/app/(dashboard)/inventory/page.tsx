/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  RefreshCw,
  BarChart3,
  Upload,
  Download,
  FileText,
  XCircle,
  Warehouse,
  Store,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData, type Item } from "@/context/DataContext";
import { useSupplier } from "@/context/SupplierContext";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseFormattedNumber,
} from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { downloadBulkUploadTemplate } from "@/src/data/api/item-http-client";
import { useAuth } from "@/context/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { formatFileSize } from "@/src/utils/formatFileSize";
import { useBranch } from "@/context/BranchContext";
import QrCodeScanner from "@/components/pos/qr-code-scanner";

interface InventoryReport {
  totalItems: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  categories: { category: string; count: number }[];
  totalStockValue: number;
}

export default function InventoryPage() {
  const {
    items,
    bulkUploadItems,
    loading,
    getInventorySummary,
    hasMoreItems,
    isFetchingMoreItems,
    loadMoreItems,
    getItems,
    restockItem,
    deleteItem,
    // Store management
    stores,
    currentStore,
    setCurrentStore,
    getStoresByBranch,
  } = useData();
  const { currentBranch } = useBranch();
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const { suppliers, fetchSuppliers, createOrderFromRestock } = useSupplier();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [formattedRestockQuantity, setFormattedRestockQuantity] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<any[]>([]);
  const [reportData, setReportData] = useState<InventoryReport | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Load stores when branch changes
  useEffect(() => {
    const loadStores = async () => {
      if (currentBranch) {
        setStoreLoading(true);
        try {
          await getStoresByBranch(currentBranch.id);
        } catch (error) {
          console.error("Failed to load stores:", error);
        } finally {
          setStoreLoading(false);
        }
      }
    };
    loadStores();
  }, [currentBranch, getStoresByBranch]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchSuppliers();
        const data = await getInventorySummary();
        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({
          title: "Error",
          description: "Could not load initial inventory data.",
          variant: "destructive",
        });
      }
    };
    fetchInitialData();
  }, [getInventorySummary, fetchSuppliers, toast]);

  useEffect(() => {
  const handler = setTimeout(() => {
    if (!currentBranch) return;
    getItems({ search: searchQuery });
    
  }, 300);
  return () => {
    clearTimeout(handler);
  };
}, [searchQuery, getItems, currentBranch]);

  // Filter items based on current store
  const getFilteredItems = () => {
    let filtered = items;
    if (currentStore) {
      filtered = filtered.filter((item) => {
        return true;
      });
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const filteredItemsCount = filteredItems.length;

  // Store selection handler
  const handleStoreChange = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId) || null;
    setCurrentStore(store);

    if (store) {
      toast({
        title: "Store Selected",
        description: `Viewing inventory for ${store.name}`,
      });
    } else {
      toast({
        title: "Branch View",
        description: "Viewing all branch inventory",
      });
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    try {
      await deleteItem(id);
      toast({
        title: "Item Deleted",
        description: `${name} has been deleted successfully`,
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleRestockQuantityChange = (value: string) => {
    const formatted = formatNumberWithCommas(value);
    setFormattedRestockQuantity(formatted);
    setRestockQuantity(value);
  };

  const handleRestock = async () => {
    if (
      !selectedItem ||
      !restockQuantity.trim() ||
      isNaN(parseFormattedNumber(restockQuantity))
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseFormattedNumber(restockQuantity);
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      await restockItem(selectedItem.id, quantity);

      if (selectedSupplier) {
        await createOrderFromRestock(selectedSupplier, selectedItem, quantity);
      }

      toast({
        title: "Stock Updated",
        description: `Added ${quantity} units to ${selectedItem.name}`,
      });
      setRestockModalOpen(false);
      setRestockQuantity("");
      setFormattedRestockQuantity("");
      setSelectedItem(null);
      setSelectedSupplier("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setShowBarcodeScanner(false);
    setSearchQuery(barcode);
    await getItems({ search: barcode });
    toast({
      title: "Barcode Scanned",
      description: `Searching for item with barcode: ${barcode}`,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getItems({});
    const data = await getInventorySummary();
    setReportData(data);
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Inventory has been updated",
    });
  };

  const getStockStatus = (item: Item) => {
    if (item.productType === "service") return null;
    if (!item.stockQuantity && item.stockQuantity !== 0) return null;

    if (item.stockQuantity === 0) {
      return {
        status: "Out of Stock",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      };
    }
    if (item.stockQuantity < 10) {
      return {
        status: "Low Stock",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      };
    }
    return {
      status: "In Stock",
      color: "bg-green-100 text-green-800",
      icon: Package,
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
            {currentStore && (
              <span className="text-lg text-gray-600 ml-2">
                - {currentStore.name}
                {currentStore.isWarehouse && (
                  <Badge variant="outline" className="ml-2">
                    <Warehouse className="w-3 h-3 mr-1" />
                    Warehouse
                  </Badge>
                )}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/stores">
            <Button variant="outline">
              <Store className="w-4 h-4 mr-2" />
              Manage Stores
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setBulkUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Link href="/inventory/analysis">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis
            </Button>
          </Link>
          <Link href="/inventory/transfers">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Stock Transfers
            </Button>
          </Link>
          <Link href="/inventory/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Store Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <Label htmlFor="store-select">Select Store</Label>
              <Combobox
                options={[
                  { label: "All Stores (Branch View)", value: "" },
                  ...stores.map((store) => ({
                    label: `${store.name} ${store.isWarehouse ? "(Warehouse)" : ""}`,
                    value: store.id,
                  })),
                ]}
                value={currentStore?.id || ""}
                onChange={handleStoreChange}
                placeholder="Select a store..."
                emptyMessage="No stores found"
              />
            </div>
            {currentStore && (
              <div className="flex gap-2">
                <Badge
                  variant={currentStore.isActive ? "default" : "secondary"}
                >
                  {currentStore.isActive ? "Active" : "Inactive"}
                </Badge>
                {currentStore.manager && (
                  <Badge variant="outline">
                    Manager: {currentStore.manager.firstName}{" "}
                    {currentStore.manager.lastName}
                  </Badge>
                )}
              </div>
            )}
          </div>
          {currentStore && currentStore.description && (
            <p className="text-sm text-gray-600 mt-2">
              {currentStore.description}
            </p>
          )}
        </CardContent>
      </Card>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.totalItems ?? (
                <span className="text-gray-400">...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reportData?.lowStock ?? (
                <span className="text-gray-400">...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below 10 units
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportData?.outOfStock ?? (
                <span className="text-gray-400">...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Items with 0 stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.categories.length ?? (
                <span className="text-gray-400">...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items by name, category or scan barcode"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && searchQuery) {
                    e.preventDefault();
                    await getItems({ search: searchQuery });
                  }
                }}
                className="pl-10 pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/10 rounded-lg h-8 w-8"
                onClick={() => setShowBarcodeScanner(true)}
              >
                <QrCode className="h-4 w-4 text-primary" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing:{" "}
              <span className="font-semibold text-primary">
                {filteredItemsCount}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-primary">
                {reportData?.totalItems}
              </span>{" "}
              items
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No items found
                </h3>
                <p className="text-gray-600 text-center">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Add your first item to get started"}
                </p>
                {!searchQuery && (
                  <Link href="/inventory/add">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const stockStatus = getStockStatus(item);
            return (
              <Card
                key={item.id || `item-${index}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary mb-2">
                        {formatCurrency(item.sellingPrice)}
                      </p>
                      {item.purchasePrice && (
                        <p className="text-sm text-gray-600 mb-2">
                          Cost: {formatCurrency(item.purchasePrice)}
                        </p>
                      )}
                    </div>
                    <Package className="w-6 h-6 text-primary" />
                  </div>

                  <div className="space-y-2 mb-4">
                    {stockStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <Badge className={stockStatus.color}>
                          <stockStatus.icon className="w-3 h-3 mr-1" />
                          {item.stockQuantity !== undefined
                            ? `${item.stockQuantity} ${item.unit || ""}`
                            : "Not tracked"}
                        </Badge>
                      </div>
                    )}
                    {/* Show store-specific stock if a store is selected */}
                    {currentStore && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          In {currentStore.name}:
                        </span>
                        <Badge variant="outline">
                          {/* This would show store-specific quantity */}
                          {item.stockQuantity || 0} {item.unit || ""}
                        </Badge>
                      </div>
                    )}
                    {item.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge variant="secondary">
                        {item.productType
                          ? item.productType.charAt(0).toUpperCase() +
                            item.productType.slice(1)
                          : "Retail"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/inventory/edit/${item.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    {item.productType !== "service" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setRestockModalOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{item.name}
                            &ldquo;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="bg-red-600 hover:bg-red-700"
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
          })
        )}
      </div>

      {hasMoreItems && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={loadMoreItems}
            disabled={isFetchingMoreItems}
            variant="outline"
          >
            {isFetchingMoreItems ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Restock Modal */}
      <Dialog open={restockModalOpen} onOpenChange={setRestockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock to {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold">{selectedItem.name}</h4>
                <p className="text-sm text-gray-600">
                  Current Stock:{" "}
                  {(
                    parseFormattedNumber(
                      String(selectedItem.stockQuantity ?? 0)
                    ) || 0
                  ).toFixed(2)}{" "}
                  units
                </p>
                <p className="text-sm text-gray-600">
                  Selling Price: {formatCurrency(selectedItem.sellingPrice)}
                </p>
                {selectedItem.purchasePrice && (
                  <p className="text-sm text-gray-600">
                    Cost Price: {formatCurrency(selectedItem.purchasePrice)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">Quantity to Add</Label>
                <Input
                  id="quantity"
                  type="text"
                  placeholder="Enter quantity to add"
                  value={formattedRestockQuantity}
                  onChange={(e) => handleRestockQuantityChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Combobox
                  options={suppliers.map((supplier) => ({
                    label: supplier.name,
                    value: supplier.id,
                  }))}
                  value={selectedSupplier}
                  onChange={(value) => setSelectedSupplier(value)}
                  placeholder="Select a supplier"
                  emptyMessage="No supplier found."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selecting a supplier will create a completed order for them.
                </p>
              </div>
              {restockQuantity &&
                !isNaN(parseFormattedNumber(restockQuantity)) && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800">
                      New Total:{" "}
                      {(
                        (parseFormattedNumber(
                          String(selectedItem.stockQuantity ?? 0)
                        ) || 0) + parseFormattedNumber(restockQuantity)
                      ).toFixed(2)}{" "}
                      units
                    </p>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRestock}>Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Upload Modal */}
      <Dialog open={bulkUploadModalOpen} onOpenChange={setBulkUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Items</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to add multiple items at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => downloadBulkUploadTemplate(getAuthHeaders)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <div className="space-y-2">
              <Label htmlFor="bulk-upload-file">Upload CSV or Excel File</Label>
              <Input
                id="bulk-upload-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500">
                Supported formats: CSV (.csv), Excel (.xlsx, .xls)
              </p>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            )}
            {uploadErrors.length > 0 && (
              <div className="p-3 bg-red-50 rounded-md">
                <h4 className="font-semibold text-red-800 mb-2">
                  Upload Errors ({uploadErrors.length})
                </h4>
                <ul className="space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                  {uploadErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Row {error.row}: {error.error}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkUploadModalOpen(false);
                setSelectedFile(null);
                setUploadErrors([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedFile) {
                  toast({
                    title: "No file selected",
                    description: "Please select a CSV or Excel file to upload.",
                    variant: "destructive",
                  });
                  return;
                }

                // Validate file type
                const fileExtension = selectedFile.name
                  .split(".")
                  .pop()
                  ?.toLowerCase();
                const allowedExtensions = ["csv", "xlsx", "xls"];

                if (
                  !fileExtension ||
                  !allowedExtensions.includes(fileExtension)
                ) {
                  toast({
                    title: "Invalid file type",
                    description:
                      "Please select a CSV or Excel file (.csv, .xlsx, .xls).",
                    variant: "destructive",
                  });
                  return;
                }

                // Validate file size (5MB limit)
                if (selectedFile.size > 5 * 1024 * 1024) {
                  toast({
                    title: "File too large",
                    description: "File size must be less than 5MB.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  const result = await bulkUploadItems(selectedFile);
                  if (result.errors.length > 0) {
                    setUploadErrors(result.errors);
                    toast({
                      title: "Upload Completed with Errors",
                      description: `${result.createdCount} items created. ${result.errorCount} rows had errors.`,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Upload Successful",
                      description: `${result.createdCount} items have been added.`,
                    });
                    setBulkUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadErrors([]);
                  }
                } catch (error: any) {
                  toast({
                    title: "Upload Failed",
                    description:
                      error.message || "An unexpected error occurred.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={loading || !selectedFile}
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span>Scan Product Barcode</span>
            </DialogTitle>
          </DialogHeader>
          {showBarcodeScanner && (
            <div className="p-4 bg-black rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
              <QrCodeScanner
                onScanSuccess={handleBarcodeScanned}
                onScanFailure={(error) => {
                  // console.warn(error);
                }}
              />
            </div>
          )}
          <div className="text-center text-sm text-gray-600">
            Point your camera at a product barcode to search
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
