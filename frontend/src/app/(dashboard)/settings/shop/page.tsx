"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Store, Upload, Camera, ArrowLeft, Building2, Phone, Mail, FileText, DollarSign, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ShopDetailsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [shopData, setShopData] = useState({
    name: "My Shop",
    address: "123 Main Street, Kampala",
    phone: "+256712345678",
    email: "shop@example.com",
    taxNumber: "TIN123456789",
    applyVAT: true,
    vatRate: "18",
    currency: "UGX",
    businessType: "Retail",
    receiptFooter: "Thank you for your business!",
    logo: null as string | null,
  })

  const businessTypes = ["Retail", "Restaurant", "Service", "Wholesale", "Other"]
  const currencies = ["UGX", "USD", "KES", "TZS"]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setShopData((prev) => ({
          ...prev,
          logo: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!shopData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a shop name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Shop details updated successfully",
      })

      router.push("/settings")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shop details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Details</h1>
            <p className="text-gray-600">Manage your business information and settings</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Business Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {shopData.logo ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-teal-600">
                    <Image
                      src={shopData.logo || "/placeholder.svg"}
                      alt="Business Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-teal-600 flex items-center justify-center bg-teal-50">
                    <Store className="h-8 w-8 text-teal-600" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-teal-600 text-white rounded-full p-2 hover:bg-teal-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 text-center">Click the upload button to add your business logo</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                value={shopData.name}
                onChange={(e) => setShopData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter shop name"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={shopData.address}
                onChange={(e) => setShopData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter shop address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={shopData.phone}
                    onChange={(e) => setShopData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={shopData.email}
                    onChange={(e) => setShopData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={shopData.businessType}
                  onValueChange={(value) => setShopData((prev) => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={shopData.currency}
                  onValueChange={(value) => setShopData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="taxNumber">Tax ID Number (Optional)</Label>
              <Input
                id="taxNumber"
                value={shopData.taxNumber}
                onChange={(e) => setShopData((prev) => ({ ...prev, taxNumber: e.target.value }))}
                placeholder="Enter TIN or tax number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tax Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apply VAT</Label>
                <p className="text-sm text-gray-600">Include VAT in receipts and reports</p>
              </div>
              <Switch
                checked={shopData.applyVAT}
                onCheckedChange={(checked) => setShopData((prev) => ({ ...prev, applyVAT: checked }))}
              />
            </div>

            {shopData.applyVAT && (
              <div>
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Input
                  id="vatRate"
                  type="number"
                  value={shopData.vatRate}
                  onChange={(e) => setShopData((prev) => ({ ...prev, vatRate: e.target.value }))}
                  placeholder="Enter VAT percentage"
                  min="0"
                  max="100"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Customization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="receiptFooter">Receipt Footer (Optional)</Label>
              <Textarea
                id="receiptFooter"
                value={shopData.receiptFooter}
                onChange={(e) => setShopData((prev) => ({ ...prev, receiptFooter: e.target.value }))}
                placeholder="Enter text to appear at the bottom of receipts"
                rows={3}
              />
              <p className="text-sm text-gray-600 mt-1">This text will appear at the bottom of all receipts</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
