"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building2, Camera, Edit, Save, X, Bell, Shield, LogOut, Trash2, Lock, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  createdAt: string;
}

interface BusinessData {
  name: string;
  email?: string;
  phone?: string;
}

interface NotificationSettings {
  salesNotifications: boolean;
  lowStockAlerts: boolean;
  dailyReports: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  biometricLogin: boolean;
  autoLogout: boolean;
  sessionTimeout: string;
}

export default function ProfilePage() {
  const { user: authUser, logout: authLogout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    createdAt: new Date().toISOString(),
  });
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    salesNotifications: true,
    lowStockAlerts: true,
    dailyReports: false,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricLogin: false,
    autoLogout: true,
    sessionTimeout: "30",
  });

  const sessionTimeouts = ["15", "30", "60", "120"];

  useEffect(() => {
    if (authUser) {
      setUserProfile({
        firstName: authUser.firstName || "User",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        role: authUser.role || "staff",
        createdAt: authUser.createdAt || new Date().toISOString(),
      });

      setFormData({
        firstName: authUser.firstName || "User",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
      });

      if (authUser.branch?.business) {
        setBusinessData({
          name: authUser.branch.business.name || "",
          // email: authUser.branch.business.email,
          // phone: authUser.branch.business.phone,
        });
      }
    }
  }, [authUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUserProfile((prev) => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }));

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (authUser) {
      setFormData({
        firstName: authUser.firstName || "User",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
      });
    }
  };

  const handleImageUpload = () => {
    toast({
      title: "Coming Soon",
      description: "Profile image upload will be available soon.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Your account has been scheduled for deletion.",
      variant: "destructive",
    });
  };

  const handleLogout = () => {
    authLogout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Profile...</h1>
          <p>Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={userProfile.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-white">{getInitials()}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={handleImageUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-white/90 text-lg">{capitalizeWords(userProfile.role)}</p>
            <p className="text-white/80 text-sm">Member since {formatDate(userProfile.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={userProfile.phone} disabled />
                <p className="text-sm text-gray-600 mt-1">Contact support to change your phone number</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">{businessData.name}</span>
                  </div>
                </div>
                <div>
                  <Label>Your Role</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Badge variant="secondary">{capitalizeWords(userProfile.role)}</Badge>
                  </div>
                </div>
              </div>
              {businessData.email && (
                <div>
                  <Label>Business Email</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span>{businessData.email}</span>
                  </div>
                </div>
              )}
              {businessData.phone && (
                <div>
                  <Label>Business Phone</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span>{businessData.phone}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sales Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified about new sales</p>
                </div>
                <Switch
                  checked={notificationSettings.salesNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({ ...prev, salesNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-gray-600">Alert when items are running low</p>
                </div>
                <Switch
                  checked={notificationSettings.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({ ...prev, lowStockAlerts: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Reports</Label>
                  <p className="text-sm text-gray-600">Receive daily sales summaries</p>
                </div>
                <Switch
                  checked={notificationSettings.dailyReports}
                  onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, dailyReports: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-gray-600">Updates and promotional content</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({ ...prev, marketingEmails: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Biometric Login</Label>
                  <p className="text-sm text-gray-600">Use fingerprint or face ID</p>
                </div>
                <Switch
                  checked={securitySettings.biometricLogin}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, biometricLogin: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Logout</Label>
                  <p className="text-sm text-gray-600">Automatically logout after inactivity</p>
                </div>
                <Switch
                  checked={securitySettings.autoLogout}
                  onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, autoLogout: checked }))}
                />
              </div>
              {securitySettings.autoLogout && (
                <div className="flex items-center justify-between">
                  <Label>Session Timeout</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) => setSecuritySettings((prev) => ({ ...prev, sessionTimeout: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTimeouts.map((timeout) => (
                        <SelectItem key={timeout} value={timeout}>
                          {timeout} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change PIN
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone and all your data will
                      be permanently lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Type</span>
                <Badge>{capitalizeWords(userProfile.role)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium">{formatDate(userProfile.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}