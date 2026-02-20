/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Store,
  Upload,
  Camera,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Receipt,
  Loader2,
  CheckCircle2,
  MapPin,
  Globe,
  Shield,
  Settings,
  Save,
  Image,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/context/BusinessContext";
import { useAuth } from "@/context/AuthContext";
import { httpClient } from "@/src/data/api/httpClient";

export default function ShopDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    currentBusiness,
    updateBusiness,
    loading: businessLoading,
  } = useBusiness();
  const { getAuthHeaders } = useAuth();

  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    taxNumber: "",
    applyVAT: false,
    vatRate: "18",
    currency: "UGX",
    businessType: "Retail",
    receiptFooter: "",
    logo: null as string | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const loadBusinessData = async () => {
      if (currentBusiness) {
        const newData = {
          name: currentBusiness.name || "",
          address: currentBusiness.address || "",
          phone: currentBusiness.phone || "",
          email: currentBusiness.email || "",
          taxNumber: currentBusiness.taxNumber || "",
          applyVAT: currentBusiness.applyVAT || false,
          vatRate: currentBusiness.vatRate?.toString() || "18",
          currency: currentBusiness.currency || "UGX",
          businessType: currentBusiness.businessType || "Retail",
          receiptFooter: currentBusiness.receiptFooter || "",
          logo: currentBusiness.logo || null,
        };

        setShopData(newData);
        setOriginalData(newData);

        if (!currentBusiness.logo && (currentBusiness as any).hasLogo) {
          try {
            const authHeaders = await getAuthHeaders();
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_API}/businesses/${currentBusiness.id}/logo`,
              {
                method: "GET",
                headers: authHeaders,
              }
            );

            if (response.ok) {
              const contentType = response.headers.get("Content-Type");

              if (contentType?.startsWith("image/")) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64Data = e.target?.result as string;
                  setShopData((prev) => ({ ...prev, logo: base64Data }));
                };
                reader.readAsDataURL(blob);
              } else {
                const logoResponse = await response.json();
                const logoUrl =
                  logoResponse.url ||
                  logoResponse.data?.url ||
                  logoResponse.logoUrl;
                if (logoUrl) {
                  setShopData((prev) => ({ ...prev, logo: logoUrl }));
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch logo from API:", error);
          }
        }
      }
    };

    loadBusinessData();
  }, [currentBusiness, getAuthHeaders]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const hasChanges =
        JSON.stringify(shopData) !== JSON.stringify(originalData);
      setHasChanges(hasChanges);
    }
  }, [shopData, originalData]);

  const businessTypes = [
    "Retail",
    "Restaurant",
    "Service",
    "Wholesale",
    "Other",
  ];
  const currencies = ["UGX", "USD", "KES", "TZS"];

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!currentBusiness) {
        toast({
          title: "Error",
          description: "No business selected",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("logo", file);

        const authHeaders = await getAuthHeaders();
        const { "Content-Type": _, ...headersWithoutContentType } = authHeaders;

        const response = await httpClient(
          `/businesses/${currentBusiness.id}/logo`,
          {
            method: "POST",
            body: formData,
            headers: headersWithoutContentType,
          }
        );

        if (response.message === "Logo uploaded successfully") {
          try {
            const authHeaders = await getAuthHeaders();
            const logoResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_API}/businesses/${currentBusiness.id}/logo`,
              {
                method: "GET",
                headers: authHeaders,
              }
            );

            if (logoResponse.ok) {
              const contentType = logoResponse.headers.get("Content-Type");

              if (contentType?.startsWith("image/")) {
                const blob = await logoResponse.blob();
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64Data = e.target?.result as string;
                  setShopData((prev) => ({ ...prev, logo: base64Data }));
                  updateBusiness(currentBusiness.id, { logo: base64Data });
                };
                reader.readAsDataURL(blob);
              } else {
                const logoData = await logoResponse.json();
                const logoUrl =
                  logoData.url || logoData.data?.url || logoData.logoUrl;
                if (logoUrl) {
                  setShopData((prev) => ({ ...prev, logo: logoUrl }));
                  await updateBusiness(currentBusiness.id, { logo: logoUrl });
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch uploaded logo:", error);
            toast({
              title: "Warning",
              description: "Logo uploaded but could not retrieve it.",
              variant: "destructive",
            });
          }

          toast({
            title: "Success",
            description: "Logo uploaded successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "Logo upload failed.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error uploading logo",
          description: "Please try again.",
          variant: "destructive",
        });
        console.error("Image upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setShopData((prev) => ({ ...prev, logo: null }));
    if (currentBusiness) {
      updateBusiness(currentBusiness.id, { logo: null });
    }
  };

  const handleSave = async () => {
    if (!shopData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a shop name",
        variant: "destructive",
      });
      return;
    }

    if (!currentBusiness) {
      toast({
        title: "Error",
        description: "No business selected",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        name: shopData.name.trim(),
        address: shopData.address.trim(),
        phone: shopData.phone.trim(),
        email: shopData.email.trim(),
        taxNumber: shopData.taxNumber.trim(),
        applyVAT: shopData.applyVAT,
        vatRate: shopData.applyVAT ? Number(shopData.vatRate) : undefined,
        currency: shopData.currency,
        businessType: shopData.businessType,
        receiptFooter: shopData.receiptFooter.trim(),
      };
      await updateBusiness(currentBusiness.id, updatedData);

      setOriginalData(shopData);
      setHasChanges(false);

      toast({
        title: "Success",
        description: "Shop details updated successfully",
      });

      router.push("/settings");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shop details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = businessLoading || isUploading;

  if (businessLoading && !currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="text-lg font-medium text-gray-600">
            Loading shop details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-xl border border-gray-200 hover:border-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shop Details</h1>
              <p className="text-gray-600">
                Manage your business information and settings
              </p>
            </div>
          </div>
        </div>

        {hasChanges && (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 border-orange-200"
          >
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Logo and Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Section */}
          <Card className="border-2 border-dashed border-gray-200 hover:border-teal-300 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5 text-teal-600" />
                Business Logo
              </CardTitle>
              <CardDescription>
                Upload your shop logo for receipts and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {isUploading ? (
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-teal-600 flex items-center justify-center bg-teal-50">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                  ) : shopData.logo ? (
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-teal-600 cursor-pointer group-hover:border-teal-700 transition-all duration-300 shadow-lg"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <img
                          src={shopData.logo}
                          alt="Business Logo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() =>
                            setShopData((prev) => ({ ...prev, logo: null }))
                          }
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-full shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 bg-white border border-gray-300 hover:bg-red-50 rounded-full shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 rounded-2xl border-2 border-dashed border-teal-600 flex flex-col items-center justify-center bg-teal-50 cursor-pointer hover:border-teal-700 hover:bg-teal-100 transition-all duration-300 group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Store className="h-8 w-8 text-teal-600 mb-2" />
                      <span className="text-xs text-teal-700 font-medium text-center px-2">
                        Upload Logo
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {shopData.logo ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-teal-600" />
                Settings Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Basic Info</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tax Settings</span>
                {shopData.applyVAT ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                  >
                    VAT Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-600 border-gray-200 text-xs"
                  >
                    No VAT
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Currency</span>
                <Badge variant="secondary" className="text-xs">
                  {shopData.currency}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Receipt Footer</span>
                {shopData.receiptFooter ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-xs text-gray-500">Not set</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your shop&apos;s primary contact and location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="shopName"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    Shop Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shopName"
                    value={shopData.name}
                    onChange={(e) =>
                      setShopData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter shop name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">
                    Business Type
                  </Label>
                  <Select
                    value={shopData.businessType}
                    onValueChange={(value) =>
                      setShopData((prev) => ({ ...prev, businessType: value }))
                    }
                    disabled
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={shopData.address}
                  onChange={(e) =>
                    setShopData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter complete shop address"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-gray-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={shopData.phone}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shopData.email}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business & Tax Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="currency"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-gray-500" />
                    Currency
                  </Label>
                  <Select
                    value={shopData.currency}
                    onValueChange={(value) =>
                      setShopData((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="taxNumber"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-gray-500" />
                    Tax ID Number
                  </Label>
                  <Input
                    id="taxNumber"
                    value={shopData.taxNumber}
                    onChange={(e) =>
                      setShopData((prev) => ({
                        ...prev,
                        taxNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter TIN or tax number"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal-600" />
                  Tax Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Apply VAT</Label>
                    <p className="text-xs text-gray-600">
                      Include VAT in receipts and reports
                    </p>
                  </div>
                  <Switch
                    checked={shopData.applyVAT}
                    onCheckedChange={(checked) =>
                      setShopData((prev) => ({ ...prev, applyVAT: checked }))
                    }
                  />
                </div>

                {shopData.applyVAT && (
                  <div className="space-y-2">
                    <Label htmlFor="vatRate" className="text-sm font-medium">
                      VAT Rate (%)
                    </Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={shopData.vatRate}
                      onChange={(e) =>
                        setShopData((prev) => ({
                          ...prev,
                          vatRate: e.target.value,
                        }))
                      }
                      placeholder="Enter VAT percentage"
                      min="0"
                      max="100"
                      className="h-11"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Receipt Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-600" />
                Receipt Customization
              </CardTitle>
              <CardDescription>
                Customize the footer text that appears on all receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="receiptFooter" className="text-sm font-medium">
                  Receipt Footer
                </Label>
                <Textarea
                  id="receiptFooter"
                  value={shopData.receiptFooter}
                  onChange={(e) =>
                    setShopData((prev) => ({
                      ...prev,
                      receiptFooter: e.target.value,
                    }))
                  }
                  placeholder="Thank you for your business! 🎉"
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    This text will appear at the bottom of all receipts
                  </span>
                  <span>{shopData.receiptFooter.length}/200 characters</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center pt-6 border-t">
            <div className="flex-1">
              {hasChanges && (
                <p className="text-sm text-orange-600 flex items-center gap-2">
                  <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                  You have unsaved changes
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="min-w-24"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-teal-600 hover:bg-teal-700 min-w-32 shadow-lg shadow-teal-500/25"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
