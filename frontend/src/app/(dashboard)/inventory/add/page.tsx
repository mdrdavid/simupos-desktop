/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Hash,
  Tag,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useSupplier } from "@/context/SupplierContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import QrCodeScanner from "@/components/pos/qr-code-scanner";

export default function AddItemPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { createItem } = useData();
  const { currentBranchId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const { suppliers, fetchSuppliers } = useSupplier();
  const [formData, setFormData] = useState({
    name: "",
    sellingPrice: "",
    costPrice: "",
    stockQuantity: "",
    category: "",
    productType: "retail" as
      | "retail"
      | "service"
      | "combo"
      | "processed"
      | "raw_material",
    unit: "",
    barcode: "",
    description: "",
    supplierId: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const [formattedValues, setFormattedValues] = useState({
    sellingPrice: "",
    costPrice: "",
    stockQuantity: "",
  });

  const categories = ["Food", "Hygiene", "Electronics", "Clothing", "Other"];

  const calculateProfitMetrics = () => {
    const selling = parseFormattedNumber(formData.sellingPrice) || 0;
    const cost = parseFormattedNumber(formData.costPrice) || 0;
    if (selling > 0 && cost > 0) {
      const profitPerUnit = selling - cost;
      const profitMargin = (profitPerUnit / selling) * 100;
      return { profitPerUnit, profitMargin };
    }
    return { profitPerUnit: 0, profitMargin: 0 };
  };

  const { profitPerUnit, profitMargin } = calculateProfitMetrics();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericInputChange = (field: string, value: string) => {
    const formatted = formatNumberWithCommas(value);
    setFormattedValues((prev) => ({ ...prev, [field]: formatted }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter item name",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.sellingPrice.trim() ||
      isNaN(parseFormattedNumber(formData.sellingPrice))
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid selling price",
        variant: "destructive",
      });
      return;
    }

    if (formData.costPrice && isNaN(parseFormattedNumber(formData.costPrice))) {
      toast({
        title: "Error",
        description: "Please enter a valid cost price",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.stockQuantity &&
      isNaN(parseFormattedNumber(formData.stockQuantity))
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid stock quantity",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const itemData = {
        name: formData.name,
        sellingPrice: parseFormattedNumber(formData.sellingPrice),
        purchasePrice: parseFormattedNumber(formData.costPrice),
        stockQuantity: parseFormattedNumber(formData.stockQuantity),
        category: formData.category,
        productType: formData.productType,
        unit: formData.unit,
        // barcode: formData.barcode,
        barcode: formData.barcode || undefined,
        description: formData.description,
        supplierId: formData.supplierId || undefined,
      };
      await createItem(itemData);

      toast({
        title: "Success",
        description: "Item added successfully",
      });
      router.push("/inventory");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/inventory">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
          <p className="text-gray-600">
            Create a new product for your inventory
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="productType">Product Type *</Label>
                <Select
                  value={formData.productType}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value: any) =>
                    handleInputChange("productType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Stock Item</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter item description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Combobox
                  options={suppliers.map((supplier) => ({
                    label: supplier.name,
                    value: supplier.id,
                  }))}
                  value={formData.supplierId}
                  onChange={(value) => handleInputChange("supplierId", value)}
                  placeholder="Select a supplier"
                  emptyMessage="No supplier found."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sellingPrice">Selling Price (UGX) *</Label>
                <Input
                  id="sellingPrice"
                  type="text"
                  placeholder="Enter selling price"
                  value={formattedValues.sellingPrice}
                  onChange={(e) =>
                    handleNumericInputChange("sellingPrice", e.target.value)
                  }
                />
              </div>

              {formData.productType !== "service" && (
                <div>
                  <Label htmlFor="costPrice">Cost Price (UGX)</Label>
                  <Input
                    id="costPrice"
                    type="text"
                    placeholder="Enter cost price"
                    value={formattedValues.costPrice}
                    onChange={(e) =>
                      handleNumericInputChange("costPrice", e.target.value)
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Used to calculate profit margins and analytics
                  </p>
                </div>
              )}

              {/* Profit Analysis */}
              {formData.productType !== "service" &&
                formData.sellingPrice &&
                formData.costPrice &&
                parseFormattedNumber(formData.sellingPrice) > 0 &&
                parseFormattedNumber(formData.costPrice) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Profit Analysis
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Profit per unit:</span>
                        <span
                          className={`font-semibold ${profitPerUnit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          UGX {profitPerUnit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit margin:</span>
                        <span
                          className={`font-semibold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Inventory */}
          {formData.productType !== "service" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="text"
                    placeholder="Enter stock quantity"
                    value={formattedValues.stockQuantity}
                    onChange={(e) =>
                      handleNumericInputChange("stockQuantity", e.target.value)
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Leave empty if you don&apos;t want to track inventory for
                    this item. Supports decimal values (e.g., 1.5, 2.25)
                  </p>
                </div>

                <div>
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., Kg, Pack, Bag, Piece"
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      placeholder="Enter barcode (optional)"
                      value={formData.barcode}
                      onChange={(e) =>
                        handleInputChange("barcode", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBarcodeScanner(true)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={formData.category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleInputChange(
                        "category",
                        formData.category === cat ? "" : cat
                      )
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div>
                <Label htmlFor="customCategory">Or enter custom category</Label>
                <Input
                  id="customCategory"
                  placeholder="Enter custom category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  maxLength={20}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {formData.name || "Item Name"}
                  </h3>
                  <Badge variant="secondary">
                    {formData.productType
                      ? formData.productType.charAt(0).toUpperCase() +
                        formData.productType.slice(1)
                      : "Retail"}
                  </Badge>
                </div>

                <div className="text-2xl font-bold text-primary">
                  UGX{" "}
                  {formData.sellingPrice
                    ? parseFormattedNumber(
                        formData.sellingPrice
                      ).toLocaleString()
                    : "0"}
                  {formData.unit ? ` per ${formData.unit}` : ""}
                </div>

                {formData.productType !== "service" && formData.costPrice && (
                  <div className="text-sm text-gray-600">
                    Cost: UGX{" "}
                    {parseFormattedNumber(formData.costPrice).toLocaleString()}
                  </div>
                )}

                {formData.productType !== "service" &&
                  formData.stockQuantity && (
                    <div className="text-sm text-gray-600">
                      Stock:{" "}
                      {parseFormattedNumber(formData.stockQuantity).toFixed(2)}{" "}
                      {formData.unit || ""}
                    </div>
                  )}

                {formData.category && (
                  <Badge variant="outline">{formData.category}</Badge>
                )}

                {formData.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.description}
                  </p>
                )}

                {formData.productType !== "service" && profitPerUnit > 0 && (
                  <div className="text-sm text-green-600 font-semibold">
                    Profit: UGX {profitPerUnit.toLocaleString()} per{" "}
                    {formData.unit || "item"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {formData.costPrice &&
            formData.sellingPrice &&
            parseFormattedNumber(formData.sellingPrice) <=
              parseFormattedNumber(formData.costPrice) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Warning: Selling price should be higher than cost price for
                  profit
                </AlertDescription>
              </Alert>
            )}
        </div>
      </div>

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
                onScanSuccess={(barcode) => {
                  handleInputChange("barcode", barcode);
                  setShowBarcodeScanner(false);
                  toast({
                    title: "Barcode Scanned",
                    description: `Barcode ${barcode} has been entered.`,
                  });
                }}
                onScanFailure={(error) => {
                  // console.warn(error);
                }}
              />
            </div>
          )}
          <div className="text-center text-sm text-gray-600">
            Point your camera at a product barcode
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
        <Link href="/inventory">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Adding..." : "Add Item"}
        </Button>
      </div>
    </div>
  );
}
