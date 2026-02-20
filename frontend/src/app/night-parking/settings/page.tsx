"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Bell,
  Shield,
  Users,
  Car,
  Save,
  RefreshCw,
  AlertTriangle,
  Database,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    businessName: "Night Parking UG",
    businessAddress: "Kampala, Uganda",
    contactPhone: "+256 700 123 456",
    contactEmail: "info@nightparking.ug",
    timezone: "Africa/Kampala",
    currency: "UGX",
    language: "en",
    enableNotifications: true,
    autoGenerateReports: false,
  });

  // Parking Settings
  const [parkingSettings, setParkingSettings] = useState({
    maxParkingDuration: 72, // hours
    autoCheckOutAfter: 24, // hours
    gracePeriod: 30, // minutes
    enableDamageTracking: true,
    requireDriverInfo: true,
    requireVehiclePhotos: false,
    enableAutoAssignment: true,
    defaultParkingRate: 10000,
    penaltyPerHour: 5000,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    notifyOnCheckIn: true,
    notifyOnCheckOut: true,
    notifyOnOverdue: true,
    notifyOnDamage: true,
    dailySummaryEmail: true,
    weeklyReportEmail: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireLogin: true,
    sessionTimeout: 30, // minutes
    enableTwoFactor: false,
    passwordExpiry: 90, // days
    maxLoginAttempts: 5,
    ipWhitelist: "",
    enableAuditLog: true,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    backupFrequency: "daily",
    backupRetention: 30, // days
    enableAutoBackup: true,
    dataExportFormat: "json",
    enableApiAccess: false,
    maintenanceMode: false,
    logLevel: "info",
  });

  const handleSaveSettings = (category: string) => {
    // In a real app, this would make an API call to save settings
    toast.success(`${category} settings saved successfully!`);
  };

  const handleResetSettings = (category: string) => {
    if (
      confirm(`Are you sure you want to reset ${category} settings to default?`)
    ) {
      toast.info(`${category} settings reset to default`);
    }
  };

  const timezones = [
    "Africa/Kampala",
    "Africa/Nairobi",
    "Africa/Dar_es_Salaam",
    "Africa/Johannesburg",
    "UTC",
  ];

  const currencies = ["UGX", "USD", "EUR", "GBP", "KES", "TZS"];
  const languages = [
    { code: "en", name: "English" },
    { code: "sw", name: "Swahili" },
    { code: "fr", name: "French" },
  ];

  const backupFrequencies = ["hourly", "daily", "weekly", "monthly"];
  const logLevels = ["debug", "info", "warn", "error"];
  const dataFormats = ["json", "csv", "excel"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-500">
                Configure system preferences and parking operations
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-gray-100">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="parking"
              className="data-[state=active]:bg-white"
            >
              <Car className="h-4 w-4 mr-2" />
              Parking
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-white"
            >
              <Database className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand-primary" />
                    General Settings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600"
                      onClick={() => handleResetSettings("general")}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                      onClick={() => handleSaveSettings("general")}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Business Name</Label>
                      <Input
                        value={generalSettings.businessName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            businessName: e.target.value,
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Business Address</Label>
                      <Input
                        value={generalSettings.businessAddress}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            businessAddress: e.target.value,
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Contact Phone</Label>
                      <Input
                        value={generalSettings.contactPhone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            contactPhone: e.target.value,
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Contact Email</Label>
                      <Input
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            contactEmail: e.target.value,
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Timezone</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) =>
                          setGeneralSettings({
                            ...generalSettings,
                            timezone: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Currency</Label>
                      <Select
                        value={generalSettings.currency}
                        onValueChange={(value) =>
                          setGeneralSettings({
                            ...generalSettings,
                            currency: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Language</Label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(value) =>
                          setGeneralSettings({
                            ...generalSettings,
                            language: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Enable Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive system notifications
                          </p>
                        </div>
                        <Switch
                          checked={generalSettings.enableNotifications}
                          onCheckedChange={(checked) =>
                            setGeneralSettings({
                              ...generalSettings,
                              enableNotifications: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Auto Generate Reports
                          </Label>
                          <p className="text-sm text-gray-500">
                            Automatically generate daily reports
                          </p>
                        </div>
                        <Switch
                          checked={generalSettings.autoGenerateReports}
                          onCheckedChange={(checked) =>
                            setGeneralSettings({
                              ...generalSettings,
                              autoGenerateReports: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parking Settings */}
          <TabsContent value="parking" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Car className="h-5 w-5 text-brand-primary" />
                    Parking Settings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600"
                      onClick={() => handleResetSettings("parking")}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                      onClick={() => handleSaveSettings("parking")}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Max Parking Duration (hours)
                      </Label>
                      <Input
                        type="number"
                        value={parkingSettings.maxParkingDuration}
                        onChange={(e) =>
                          setParkingSettings({
                            ...parkingSettings,
                            maxParkingDuration: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Maximum allowed continuous parking duration
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Auto Check-out After (hours)
                      </Label>
                      <Input
                        type="number"
                        value={parkingSettings.autoCheckOutAfter}
                        onChange={(e) =>
                          setParkingSettings({
                            ...parkingSettings,
                            autoCheckOutAfter: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Automatically check-out vehicles after this duration
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Grace Period (minutes)
                      </Label>
                      <Input
                        type="number"
                        value={parkingSettings.gracePeriod}
                        onChange={(e) =>
                          setParkingSettings({
                            ...parkingSettings,
                            gracePeriod: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Grace period before applying overtime charges
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Default Parking Rate (UGX)
                      </Label>
                      <Input
                        type="number"
                        value={parkingSettings.defaultParkingRate}
                        onChange={(e) =>
                          setParkingSettings({
                            ...parkingSettings,
                            defaultParkingRate: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Default rate for overnight parking
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Penalty per Hour (UGX)
                      </Label>
                      <Input
                        type="number"
                        value={parkingSettings.penaltyPerHour}
                        onChange={(e) =>
                          setParkingSettings({
                            ...parkingSettings,
                            penaltyPerHour: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Hourly penalty for overdue vehicles
                      </p>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Damage Tracking
                          </Label>
                          <p className="text-sm text-gray-500">
                            Enable vehicle damage tracking
                          </p>
                        </div>
                        <Switch
                          checked={parkingSettings.enableDamageTracking}
                          onCheckedChange={(checked) =>
                            setParkingSettings({
                              ...parkingSettings,
                              enableDamageTracking: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Require Driver Info
                          </Label>
                          <p className="text-sm text-gray-500">
                            Require driver information during check-in
                          </p>
                        </div>
                        <Switch
                          checked={parkingSettings.requireDriverInfo}
                          onCheckedChange={(checked) =>
                            setParkingSettings({
                              ...parkingSettings,
                              requireDriverInfo: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Auto Slot Assignment
                          </Label>
                          <p className="text-sm text-gray-500">
                            Automatically assign available parking slots
                          </p>
                        </div>
                        <Switch
                          checked={parkingSettings.enableAutoAssignment}
                          onCheckedChange={(checked) =>
                            setParkingSettings({
                              ...parkingSettings,
                              enableAutoAssignment: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-brand-primary" />
                    Notification Settings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600"
                      onClick={() => handleResetSettings("notifications")}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                      onClick={() => handleSaveSettings("notifications")}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notification Channels
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive push notifications in app
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNotifications: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notification Events
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">On Check-in</Label>
                          <p className="text-sm text-gray-500">
                            Notify when vehicle checks in
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.notifyOnCheckIn}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              notifyOnCheckIn: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">On Check-out</Label>
                          <p className="text-sm text-gray-500">
                            Notify when vehicle checks out
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.notifyOnCheckOut}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              notifyOnCheckOut: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">On Overdue</Label>
                          <p className="text-sm text-gray-500">
                            Notify when vehicle is overdue
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.notifyOnOverdue}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              notifyOnOverdue: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            On Damage Report
                          </Label>
                          <p className="text-sm text-gray-500">
                            Notify when damage is reported
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.notifyOnDamage}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              notifyOnDamage: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-6 bg-gray-100" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Scheduled Reports
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700">
                        Daily Summary Email
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive daily summary report via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailySummaryEmail}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          dailySummaryEmail: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700">
                        Weekly Report Email
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive weekly detailed report
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReportEmail}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weeklyReportEmail: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-primary" />
                    Security Settings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600"
                      onClick={() => handleResetSettings("security")}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                      onClick={() => handleSaveSettings("security")}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Password Expiry (days)
                      </Label>
                      <Input
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordExpiry: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Max Login Attempts
                      </Label>
                      <Input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            maxLoginAttempts: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">IP Whitelist</Label>
                      <Input
                        value={securitySettings.ipWhitelist}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipWhitelist: e.target.value,
                          })
                        }
                        placeholder="192.168.1.1, 10.0.0.1"
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Comma-separated list of allowed IP addresses
                      </p>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">Require Login</Label>
                          <p className="text-sm text-gray-500">
                            Require login to access system
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.requireLogin}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({
                              ...securitySettings,
                              requireLogin: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-gray-500">
                            Enable 2FA for all users
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.enableTwoFactor}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({
                              ...securitySettings,
                              enableTwoFactor: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">Audit Logging</Label>
                          <p className="text-sm text-gray-500">
                            Log all system activities
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.enableAuditLog}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({
                              ...securitySettings,
                              enableAuditLog: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Settings */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-primary" />
                    User Management
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">
                    Manage system users, roles, and permissions. This section
                    allows you to add, edit, or remove users and assign them
                    appropriate access levels.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        User Management Interface
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        This feature is under development. The complete user
                        management interface will be available in the next
                        update.
                      </p>
                      <div className="flex gap-3 justify-center mt-6">
                        <Button variant="outline" className="border-gray-200 text-gray-600">
                          View Current Users
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                          onClick={() =>
                            toast.info("User management coming soon!")
                          }
                        >
                          Manage Roles
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="mt-6">
            <Card className="border-0 bg-white shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Database className="h-5 w-5 text-brand-primary" />
                    System Settings
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600"
                      onClick={() => handleResetSettings("system")}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                      onClick={() => handleSaveSettings("system")}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Backup Frequency</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupFrequency: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {backupFrequencies.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Backup Retention (days)
                      </Label>
                      <Input
                        type="number"
                        value={systemSettings.backupRetention}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupRetention: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Data Export Format
                      </Label>
                      <Select
                        value={systemSettings.dataExportFormat}
                        onValueChange={(value) =>
                          setSystemSettings({
                            ...systemSettings,
                            dataExportFormat: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {dataFormats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Log Level</Label>
                      <Select
                        value={systemSettings.logLevel}
                        onValueChange={(value) =>
                          setSystemSettings({
                            ...systemSettings,
                            logLevel: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {logLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">Auto Backup</Label>
                          <p className="text-sm text-gray-500">
                            Enable automatic backups
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableAutoBackup}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              enableAutoBackup: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">API Access</Label>
                          <p className="text-sm text-gray-500">
                            Enable external API access
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableApiAccess}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              enableApiAccess: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-700">
                            Maintenance Mode
                          </Label>
                          <p className="text-sm text-gray-500">
                            Put system in maintenance mode
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              maintenanceMode: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-6 bg-gray-100" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    System Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Version</div>
                      <div className="text-gray-900 font-semibold">v2.1.0</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Database</div>
                      <div className="text-gray-900 font-semibold">
                        PostgreSQL 15
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Uptime</div>
                      <div className="text-gray-900 font-semibold">99.8%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Last Backup</div>
                      <div className="text-gray-900 font-semibold">
                        Today 02:00
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border border-red-100 bg-red-50/30 shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 font-medium">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() =>
                    toast.error("Clear all data feature is disabled")
                  }
                >
                  Clear All Data
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() =>
                    toast.error("Reset system feature is disabled")
                  }
                >
                  Reset System to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
