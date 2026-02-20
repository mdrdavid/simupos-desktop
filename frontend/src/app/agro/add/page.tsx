/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgroProduct } from "@/context/AgroProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
  Plus,
  Sparkles,
  Info,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AddAgroProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createProduct } = useAgroProduct();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    baseCurrency: "UGX",
    unitOfMeasure: "kg",
    minStockLevel: "",
    productCode: "",
    hasVariants: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, hasVariants: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const product = await createProduct({
        ...formData,
        minStockLevel: formData.minStockLevel
          ? Number(formData.minStockLevel)
          : undefined,
      });

      toast({
        title: "🎉 Product Created Successfully!",
        description: `${product.name} has been added to your inventory`,
        className: "bg-green-50 border-green-200",
      });

      if (formData.hasVariants) {
        router.push(`/agro/${product.id}/variants/add`);
      } else {
        router.push(`/agro/${product.id}/stock/add`);
      }
    } catch (error) {
      toast({
        title: "Failed to Create Product",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.name && formData.category && formData.unitOfMeasure;

  const commonUnits = [
    "kg",
    "g",
    "L",
    "mL",
    "piece",
    "bunch",
    "bag",
    "box",
    "crate",
  ];
  const commonCategories = [
    "Grains",
    "Vegetables",
    "Fruits",
    "Livestock",
    "Dairy",
    "Poultry",
    "Seeds",
    "Fertilizers",
    "Tools",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Add New Product
              </h1>
              <p className="text-gray-600 text-lg">
                Create a new agricultural product for your inventory
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span>Product Information</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details below to add a new agricultural product to
                  your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Name & Category */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-semibold text-gray-700 flex items-center space-x-1"
                      >
                        <span>Product Name</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                        className={cn(
                          "h-12 border-2 transition-all duration-300 rounded-xl",
                          touchedFields.has("name") && !formData.name
                            ? "border-red-300 focus:border-red-300 bg-red-50/50"
                            : "border-gray-200 focus:border-teal-300 bg-white/50"
                        )}
                        placeholder="Enter product name"
                      />
                      {touchedFields.has("name") && !formData.name && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Product name is required</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="font-semibold text-gray-700 flex items-center space-x-1"
                      >
                        <span>Category</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-12 border-2 transition-all duration-300 rounded-xl",
                            touchedFields.has("category") && !formData.category
                              ? "border-red-300 focus:border-red-300 bg-red-50/50"
                              : "border-gray-200 focus:border-teal-300 bg-white/50"
                          )}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.category === "other" && (
                        <Input
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                          className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white/50 mt-2"
                          placeholder="Enter custom category"
                        />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="font-semibold text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="min-h-24 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white/50 resize-none transition-all duration-300"
                      placeholder="Describe the product, its features, or usage..."
                    />
                  </div>

                  {/* Currency & Unit of Measure */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="baseCurrency"
                        className="font-semibold text-gray-700"
                      >
                        Currency
                      </Label>
                      <Select
                        value={formData.baseCurrency}
                        onValueChange={(value) =>
                          handleInputChange("baseCurrency", value)
                        }
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white/50 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UGX">
                            UGX - Ugandan Shilling
                          </SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            GBP - British Pound
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="unitOfMeasure"
                        className="font-semibold text-gray-700 flex items-center space-x-1"
                      >
                        <span>Unit of Measure</span>
                        {!formData.hasVariants && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Select
                        value={formData.unitOfMeasure}
                        onValueChange={(value) =>
                          handleInputChange("unitOfMeasure", value)
                        }
                        disabled={formData.hasVariants}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-12 border-2 transition-all duration-300 rounded-xl",
                            formData.hasVariants
                              ? "bg-gray-100 border-gray-200 text-gray-500"
                              : "border-gray-200 focus:border-teal-300 bg-white/50"
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {commonUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.hasVariants && (
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Info className="h-3 w-3" />
                          <span>Units will be set per variant</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Level & Product Code */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="minStockLevel"
                        className="font-semibold text-gray-700"
                      >
                        Minimum Stock Level
                      </Label>
                      <Input
                        id="minStockLevel"
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) =>
                          handleInputChange("minStockLevel", e.target.value)
                        }
                        className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white/50 transition-all duration-300"
                        placeholder="0"
                      />
                      <p className="text-sm text-gray-500">
                        Alert when stock falls below this level
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="productCode"
                        className="font-semibold text-gray-700"
                      >
                        Product Code
                      </Label>
                      <Input
                        id="productCode"
                        value={formData.productCode}
                        onChange={(e) =>
                          handleInputChange("productCode", e.target.value)
                        }
                        className="h-12 border-2 border-gray-200 focus:border-teal-300 rounded-xl bg-white/50 transition-all duration-300"
                        placeholder="e.g., PROD-001"
                      />
                      <p className="text-sm text-gray-500">
                        Optional unique identifier
                      </p>
                    </div>
                  </div>

                  {/* Variants Switch */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="space-y-1">
                      <Label
                        htmlFor="hasVariants"
                        className="font-semibold text-gray-700 cursor-pointer"
                      >
                        This product has variants
                      </Label>
                      <p className="text-sm text-gray-600">
                        Enable if product comes in different sizes, colors, or
                        types
                      </p>
                    </div>
                    <Switch
                      id="hasVariants"
                      checked={formData.hasVariants}
                      onCheckedChange={handleSwitchChange}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={cn(
                      "w-full h-14 text-lg font-semibold transition-all duration-300 rounded-xl",
                      isFormValid
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Create Product
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Help & Information */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50/50 border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg font-bold text-gray-800">
                  <Info className="h-5 w-5 text-teal-600" />
                  <span>Quick Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Product Name:</span> Use
                    descriptive names that are easy to recognize
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Variants:</span> Enable if
                    your product has different sizes, colors, or types
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Stock Level:</span> Set
                    minimum levels to receive alerts when stock is low
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800">
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.hasVariants ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Step 1: Create Product
                    </Badge>
                    <p className="text-sm text-gray-600">
                      After creating the product, you&apos;ll be able to add
                      variants with their own stock levels and pricing.
                    </p>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      Step 1: Create Product
                    </Badge>
                    <p className="text-sm text-gray-600">
                      After creation, you&apos;ll add initial stock and pricing
                      information for this product.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Required Fields Info */}
            <Card className="bg-amber-50/80 border-2 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-700">
                    Required Fields
                  </p>
                </div>
                <p className="text-xs text-amber-600">
                  Fields marked with <span className="text-red-500">*</span> are
                  required to create the product.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
