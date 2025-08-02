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

  const currencies = [
    { value: "UGX", label: "Ugandan Shilling (UGX)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];

  const timezones = [
    { value: "Africa/Kampala", label: "Africa/Kampala (UTC+3)" },
    { value: "Africa/Nairobi", label: "Africa/Nairobi (UTC+3)" },
    { value: "Africa/Lagos", label: "Africa/Lagos (UTC+1)" },
    { value: "UTC", label: "UTC (UTC+0)" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(formData);
    setHasChanges(false);
  };

  const handleLogoUpload = () => {
    // Logo upload functionality would be implemented here
    console.log("Logo upload clicked");
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600">Configure your restaurant settings</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="rounded-full">
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Restaurant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Restaurant Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input
              id="restaurant-name"
              value={formData.restaurantName}
              onChange={(e) =>
                handleInputChange("restaurantName", e.target.value)
              }
              placeholder="Enter restaurant name"
            />
          </div>

          <div>
            <Label>Restaurant Logo</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {formData.logo ? (
                  <img
                    src={formData.logo || "/placeholder.svg"}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Button variant="outline" onClick={handleLogoUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 200x200px, PNG or JPG
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Operating Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="open-time">Opening Time</Label>
              <Input
                id="open-time"
                type="time"
                value={formData.openTime}
                onChange={(e) => handleInputChange("openTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="close-time">Closing Time</Label>
              <Input
                id="close-time"
                type="time"
                value={formData.closeTime}
                onChange={(e) => handleInputChange("closeTime", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Taxes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Pricing & Taxes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange("currency", value)}
            >
              <SelectTrigger>
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
              <Label htmlFor="vat-rate">VAT Rate (%)</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="service-charge">Service Charge (%)</Label>
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
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-vat">Automatic VAT Calculation</Label>
                <p className="text-sm text-gray-500">
                  Automatically add VAT to all orders
                </p>
              </div>
              <Switch id="auto-vat" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-service">Automatic Service Charge</Label>
                <p className="text-sm text-gray-500">
                  Automatically add service charge to all orders
                </p>
              </div>
              <Switch id="auto-service" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Regional Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-notifications">Order Notifications</Label>
                <p className="text-sm text-gray-500">
                  Get notified when new orders are placed
                </p>
              </div>
              <Switch id="order-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                <p className="text-sm text-gray-500">
                  Get notified when ingredients are running low
                </p>
              </div>
              <Switch id="low-stock-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reports">Daily Reports</Label>
                <p className="text-sm text-gray-500">
                  Receive daily sales reports via email
                </p>
              </div>
              <Switch id="daily-reports" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="kitchen-alerts">Kitchen Alerts</Label>
                <p className="text-sm text-gray-500">
                  Sound alerts for new kitchen orders
                </p>
              </div>
              <Switch id="kitchen-alerts" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="receipt-footer">Receipt Footer Message</Label>
            <Textarea
              id="receipt-footer"
              placeholder="Thank you for dining with us!"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="print-receipt">Auto Print Receipt</Label>
                <p className="text-sm text-gray-500">
                  Automatically print receipt after payment
                </p>
              </div>
              <Switch id="print-receipt" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-receipt">Email Receipt Option</Label>
                <p className="text-sm text-gray-500">
                  Allow customers to receive receipt via email
                </p>
              </div>
              <Switch id="email-receipt" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-receipt">SMS Receipt Option</Label>
                <p className="text-sm text-gray-500">
                  Allow customers to receive receipt via SMS
                </p>
              </div>
              <Switch id="sms-receipt" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="rounded-full">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
