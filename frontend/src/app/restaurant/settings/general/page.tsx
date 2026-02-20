/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Upload,
  Clock,
  DollarSign,
  Globe,
  Save,
  Camera,
  Building,
  Receipt,
  Bell,
  Sparkles,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeneralSettings() {
  const { settings, updateSettings } = useRestaurant();
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currencies = [
    { value: "UGX", label: "Ugandan Shilling (UGX)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "KES", label: "Kenyan Shilling (KES)" },
    { value: "TZS", label: "Tanzanian Shilling (TZS)" },
  ];

  const timezones = [
    { value: "Africa/Kampala", label: "East Africa Time (EAT) - Kampala" },
    { value: "Africa/Nairobi", label: "East Africa Time (EAT) - Nairobi" },
    {
      value: "Africa/Dar_es_Salaam",
      label: "East Africa Time (EAT) - Dar es Salaam",
    },
    {
      value: "Africa/Johannesburg",
      label: "South Africa Standard Time (SAST)",
    },
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateSettings(formData);
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  const handleLogoUpload = () => {
    // Logo upload functionality would be implemented here
    console.log("Logo upload clicked");
  };

  const settingSections = [
    {
      id: "restaurant",
      title: "Restaurant Information",
      icon: Building,
      description: "Basic information about your restaurant",
      color: "blue",
    },
    {
      id: "hours",
      title: "Operating Hours",
      icon: Clock,
      description: "Set your business operating schedule",
      color: "green",
    },
    {
      id: "pricing",
      title: "Pricing & Taxes",
      icon: DollarSign,
      description: "Configure currency, taxes, and charges",
      color: "purple",
    },
    {
      id: "regional",
      title: "Regional Settings",
      icon: Globe,
      description: "Timezone and localization settings",
      color: "orange",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Manage alerts and notifications",
      color: "red",
    },
    {
      id: "receipt",
      title: "Receipt & Printing",
      icon: Receipt,
      description: "Receipt formatting and printing options",
      color: "indigo",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Restaurant Settings
            </h1>
            <p className="text-gray-600 text-lg">
              Configure and customize your restaurant management system
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Settings
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {settingSections.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-green-900">12</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Modified
                  </p>
                  <p className="text-lg font-bold text-purple-900">
                    {hasChanges ? "Yes" : "No"}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Last Saved
                  </p>
                  <p className="text-lg font-bold text-orange-900">2h ago</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Save className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Information */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  Restaurant Information
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Basic information about your restaurant
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="restaurant-name"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Restaurant Name *
                </Label>
                <Input
                  id="restaurant-name"
                  value={formData.restaurantName}
                  onChange={(e) =>
                    handleInputChange("restaurantName", e.target.value)
                  }
                  placeholder="Enter your restaurant name"
                  className="border-gray-300 focus:border-blue-500 h-11"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Restaurant Logo
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
                    {formData.logo ? (
                      <img
                        src={formData.logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Upload Logo</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button
                      variant="outline"
                      onClick={handleLogoUpload}
                      className="border-gray-300 hover:border-gray-400"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <p className="text-xs text-gray-500">
                      Recommended: 200x200px, PNG or JPG. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  Operating Hours
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Set your business operating schedule
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="open-time"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Opening Time *
                  </Label>
                  <Input
                    id="open-time"
                    type="time"
                    value={formData.openTime}
                    onChange={(e) =>
                      handleInputChange("openTime", e.target.value)
                    }
                    className="border-gray-300 focus:border-green-500 h-11"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="close-time"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Closing Time *
                  </Label>
                  <Input
                    id="close-time"
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) =>
                      handleInputChange("closeTime", e.target.value)
                    }
                    className="border-gray-300 focus:border-green-500 h-11"
                  />
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Clock className="h-4 w-4" />
                  <span>
                    Your restaurant will be open from{" "}
                    <strong>{formData.openTime}</strong> to{" "}
                    <strong>{formData.closeTime}</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Taxes */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  Pricing & Taxes
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Configure currency, taxes, and charges
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="currency"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Currency *
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="vat-rate"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    VAT Rate (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="vat-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.vatRate}
                      onChange={(e) =>
                        handleInputChange(
                          "vatRate",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="border-gray-300 focus:border-purple-500 h-11 pl-8"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="service-charge"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Service Charge (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="service-charge"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.serviceChargeRate}
                      onChange={(e) =>
                        handleInputChange(
                          "serviceChargeRate",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="border-gray-300 focus:border-purple-500 h-11 pl-8"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label
                      htmlFor="auto-vat"
                      className="text-sm font-medium text-gray-700"
                    >
                      Automatic VAT Calculation
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically add VAT to all orders
                    </p>
                  </div>
                  <Switch
                    id="auto-vat"
                    defaultChecked
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label
                      htmlFor="auto-service"
                      className="text-sm font-medium text-gray-700"
                    >
                      Automatic Service Charge
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically add service charge to all orders
                    </p>
                  </div>
                  <Switch
                    id="auto-service"
                    defaultChecked
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  Regional Settings
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Timezone and localization settings
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Timezone *
                </Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    handleInputChange("timezone", value)
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <Globe className="h-4 w-4" />
                  <span>
                    All times will be displayed in your selected timezone
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  Notification Settings
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Manage alerts and notifications
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  id: "order-notifications",
                  label: "Order Notifications",
                  description: "Get notified when new orders are placed",
                  defaultChecked: true,
                },
                {
                  id: "low-stock-alerts",
                  label: "Low Stock Alerts",
                  description: "Get notified when ingredients are running low",
                  defaultChecked: true,
                },
                {
                  id: "daily-reports",
                  label: "Daily Reports",
                  description: "Receive daily sales reports via email",
                  defaultChecked: false,
                },
                {
                  id: "kitchen-alerts",
                  label: "Kitchen Alerts",
                  description: "Sound alerts for new kitchen orders",
                  defaultChecked: true,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <Label
                      htmlFor={item.id}
                      className="text-sm font-medium text-gray-700"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={item.id}
                    defaultChecked={item.defaultChecked}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Receipt Settings */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  Receipt & Printing
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Receipt formatting and printing options
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="receipt-footer"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Receipt Footer Message
                </Label>
                <Textarea
                  id="receipt-footer"
                  placeholder="Thank you for dining with us! We hope to see you again soon."
                  rows={3}
                  className="resize-none border-gray-300 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "print-receipt",
                    label: "Auto Print Receipt",
                    description: "Automatically print receipt after payment",
                    defaultChecked: true,
                  },
                  {
                    id: "email-receipt",
                    label: "Email Receipt Option",
                    description: "Allow customers to receive receipt via email",
                    defaultChecked: false,
                  },
                  {
                    id: "sms-receipt",
                    label: "SMS Receipt Option",
                    description: "Allow customers to receive receipt via SMS",
                    defaultChecked: false,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <Label
                        htmlFor={item.id}
                        className="text-sm font-medium text-gray-700"
                      >
                        {item.label}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.id}
                      defaultChecked={item.defaultChecked}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button Sticky Footer */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span>You have unsaved changes</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px]"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save All Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
