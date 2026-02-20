"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  Settings,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  ChefHat,
  Package,
  DollarSign,
  Users,
  Clock,
  Filter,
  Volume2,
  VolumeX,
  MessageSquare,
  Mail,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Table 4 has placed a new order with 3 items",
    timestamp: "2 minutes ago",
    read: false,
    priority: "high",
    icon: ShoppingCart,
    color: "blue",
  },
  {
    id: "2",
    type: "kitchen",
    title: "Order Ready for Pickup",
    message: "Order #ORD-1234 from Table 2 is ready for service",
    timestamp: "5 minutes ago",
    read: false,
    priority: "medium",
    icon: ChefHat,
    color: "green",
  },
  {
    id: "3",
    type: "inventory",
    title: "Low Stock Alert",
    message: "Chicken Breast is running low (2kg remaining)",
    timestamp: "1 hour ago",
    read: true,
    priority: "high",
    icon: Package,
    color: "orange",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Processed",
    message: "Payment of UGX 45,000 received for Table 3",
    timestamp: "2 hours ago",
    read: true,
    priority: "low",
    icon: DollarSign,
    color: "purple",
  },
  {
    id: "5",
    type: "staff",
    title: "Staff Shift Reminder",
    message: "Alice Johnson's shift starts in 30 minutes",
    timestamp: "3 hours ago",
    read: true,
    priority: "medium",
    icon: Users,
    color: "indigo",
  },
  {
    id: "6",
    type: "system",
    title: "System Update Available",
    message: "New version v2.1.0 is ready to install",
    timestamp: "5 hours ago",
    read: true,
    priority: "low",
    icon: Settings,
    color: "gray",
  },
];

const notificationTypes = [
  { value: "all", label: "All Notifications", count: 6 },
  { value: "unread", label: "Unread", count: 2 },
  { value: "order", label: "Orders", count: 2 },
  { value: "kitchen", label: "Kitchen", count: 1 },
  { value: "inventory", label: "Inventory", count: 1 },
  { value: "payment", label: "Payments", count: 1 },
];

const notificationSettings = [
  {
    category: "Order Notifications",
    description: "Alerts for new orders and order updates",
    settings: [
      {
        id: "new-orders",
        label: "New Order Alerts",
        description: "Notify when new orders are placed",
        enabled: true,
      },
      {
        id: "order-updates",
        label: "Order Status Updates",
        description: "Notify when order status changes",
        enabled: true,
      },
      {
        id: "large-orders",
        label: "Large Order Alerts",
        description: "Notify for orders above UGX 50,000",
        enabled: false,
      },
    ],
  },
  {
    category: "Kitchen Notifications",
    description: "Alerts from the kitchen and food preparation",
    settings: [
      {
        id: "kitchen-alerts",
        label: "Kitchen Order Alerts",
        description: "Notify when orders are ready",
        enabled: true,
      },
      {
        id: "prep-time",
        label: "Preparation Time Alerts",
        description: "Notify when orders are taking too long",
        enabled: true,
      },
      {
        id: "ingredient-out",
        label: "Ingredient Out of Stock",
        description: "Notify when ingredients run out",
        enabled: true,
      },
    ],
  },
  {
    category: "Inventory Notifications",
    description: "Alerts for stock levels and inventory management",
    settings: [
      {
        id: "low-stock",
        label: "Low Stock Alerts",
        description: "Notify when items are running low",
        enabled: true,
      },
      {
        id: "out-of-stock",
        label: "Out of Stock Alerts",
        description: "Notify when items are completely out",
        enabled: true,
      },
      {
        id: "auto-reorder",
        label: "Auto-reorder Suggestions",
        description: "Suggest items to reorder",
        enabled: false,
      },
    ],
  },
  {
    category: "Payment & Billing",
    description: "Alerts for payments, refunds, and billing",
    settings: [
      {
        id: "payment-success",
        label: "Successful Payments",
        description: "Notify when payments are processed",
        enabled: true,
      },
      {
        id: "payment-failed",
        label: "Failed Payments",
        description: "Notify when payments fail",
        enabled: true,
      },
      {
        id: "high-value",
        label: "High Value Transactions",
        description: "Notify for transactions above UGX 100,000",
        enabled: false,
      },
    ],
  },
  {
    category: "System & Maintenance",
    description: "System updates and maintenance alerts",
    settings: [
      {
        id: "system-updates",
        label: "System Updates",
        description: "Notify about system updates",
        enabled: true,
      },
      {
        id: "maintenance",
        label: "Maintenance Alerts",
        description: "Notify about scheduled maintenance",
        enabled: false,
      },
      {
        id: "backup",
        label: "Backup Completion",
        description: "Notify when backups are completed",
        enabled: true,
      },
    ],
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");
  const [activeView, setActiveView] = useState("notifications");
  const [globalMute, setGlobalMute] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingCart;
      case "kitchen":
        return ChefHat;
      case "inventory":
        return Package;
      case "payment":
        return DollarSign;
      case "staff":
        return Users;
      case "system":
        return Settings;
      default:
        return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 pb-20">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your alerts and notification preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setGlobalMute(!globalMute)}
              className={cn(
                "border-gray-300 hover:bg-gray-50",
                globalMute && "bg-gray-100 border-gray-400"
              )}
            >
              {globalMute ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Notifications Muted
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Notifications Active
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setActiveView(
                  activeView === "notifications" ? "settings" : "notifications"
                )
              }
              className="border-gray-300 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {activeView === "notifications"
                ? "Settings"
                : "View Notifications"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {notifications.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Unread
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {unreadCount}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    High Priority
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {notifications.filter((n) => n.priority === "high").length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Today
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {
                      notifications.filter(
                        (n) =>
                          n.timestamp.includes("minute") ||
                          n.timestamp.includes("hour")
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeView === "notifications" ? (
          <>
            {/* Notification Tabs */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-gray-100 p-1 rounded-xl">
                      {notificationTypes.map((type) => (
                        <TabsTrigger
                          key={type.value}
                          value={type.value}
                          className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          {type.label}
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              activeTab === type.value
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            )}
                          >
                            {type.count}
                          </Badge>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark All Read
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BellOff className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No notifications found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === "unread"
                        ? "You're all caught up! No unread notifications."
                        : "No notifications match your current filter."}
                    </p>
                    {activeTab !== "all" && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("all")}
                      >
                        View All Notifications
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = getTypeIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        "border-0 shadow-sm transition-all duration-300 hover:shadow-md",
                        !notification.read
                          ? "bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500"
                          : "bg-gray-50/80 backdrop-blur-sm"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-xl flex-shrink-0",
                              notification.read ? "bg-gray-100" : "bg-blue-100"
                            )}
                          >
                            <IconComponent
                              className={cn(
                                "h-5 w-5",
                                notification.read
                                  ? "text-gray-600"
                                  : "text-blue-600"
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={cn(
                                    "font-semibold text-lg",
                                    notification.read
                                      ? "text-gray-700"
                                      : "text-gray-900"
                                  )}
                                >
                                  {notification.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-medium",
                                    getPriorityColor(notification.priority)
                                  )}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p
                              className={cn(
                                "mb-2",
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-700"
                              )}
                            >
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {notification.timestamp}
                                </span>
                                <span>•</span>
                                <span className="capitalize">
                                  {notification.type}
                                </span>
                              </div>

                              {!notification.read && (
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700 text-xs"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Settings View */
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Delivery Methods
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bell className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">In-App</p>
                          <p className="text-sm text-gray-600">
                            Push notifications
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">
                            Send to your email
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Smartphone className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">SMS</p>
                          <p className="text-sm text-gray-600">Text messages</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Notification Categories */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Notification Categories
                  </h3>

                  {notificationSettings.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {category.category}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {category.settings.map((setting) => (
                          <div
                            key={setting.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {setting.label}
                              </p>
                              <p className="text-sm text-gray-600">
                                {setting.description}
                              </p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Settings */}
                <div className="flex justify-end pt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
