/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Building2,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Sparkles,
  Store,
  Target,
  Users,
  Activity,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/Footer/AppFooter";

interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
}

export default function BranchManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    branches,
    currentBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    switchBranch,
    loading,
  } = useBranch();
  const { user, businessData, logout } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deleteBranchDialog, setDeleteBranchDialog] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
  });

  // Mock data - replace with your actual data
  const isOnline = true;
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Filter branches based on search and status
  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.manager?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.isActive) ||
      (statusFilter === "inactive" && !branch.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeBranchesCount = branches.filter((b) => b.isActive).length;
  const inactiveBranchesCount = branches.filter((b) => !b.isActive).length;

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
    });
  };

  const handleAddBranch = () => {
    resetForm();
    setEditingBranch(null);
    setShowAddModal(true);
  };

  const handleEditBranch = (branch: any) => {
    setFormData({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      manager: branch.manager || "",
    });
    setEditingBranch(branch);
    setShowAddModal(true);
  };

  const handleSaveBranch = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({
        title: "Error",
        description: "Please fill in branch name and address",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          manager: formData.manager.trim() || undefined,
        });
        toast({
          title: "Success",
          description: "Branch updated successfully",
        });
      } else {
        await createBranch({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          manager: formData.manager.trim() || undefined,
          isActive: true,
        });
        toast({
          title: "Success",
          description: "Branch added successfully",
        });
      }

      setShowAddModal(false);
      resetForm();
      setEditingBranch(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save branch",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = (branch: any) => {
    if (branch.isMain) {
      toast({
        title: "Error",
        description: "Cannot delete the main branch",
        variant: "destructive",
      });
      return;
    }
    setDeleteBranchDialog(branch);
  };

  const confirmDeleteBranch = async () => {
    if (!deleteBranchDialog) return;

    try {
      await deleteBranch(deleteBranchDialog.id);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
      setDeleteBranchDialog(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    try {
      await switchBranch(branchId);
      toast({
        title: "Success",
        description: "Branch switched successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to switch branch",
        variant: "destructive",
      });
    }
  };

  const toggleBranchStatus = async (branch: any) => {
    try {
      await updateBranch(branch.id, { isActive: !branch.isActive });
      toast({
        title: "Success",
        description: `Branch ${!branch.isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Mobile & Desktop */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section - Back Button & Business Info */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {businessData?.name || "Business Name"} - Branch
                      Management
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Section - Support Info (Desktop only) */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Phone className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Support: 0702629361</span>
                </div>
              </div>

              {/* Right Section - User Info & Controls */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>

                {/* Desktop User & Time Info */}
                <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">
                      {user?.firstName || "User"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{currentTime}</span>
                  </div>
                </div>

                {/* Online Status Badge */}
                <Badge
                  variant={isOnline ? "default" : "destructive"}
                  className="text-xs hidden sm:flex"
                >
                  {isOnline ? (
                    <Wifi className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {isOnline ? "Online" : "Offline"}
                </Badge>

                {/* Logout Button - Desktop */}
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hidden sm:flex text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-red-600" />
                        Confirm Logout
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Are you sure you want to logout from{" "}
                          {businessData?.name}?
                        </p>
                        <p className="text-xs text-gray-500">
                          You&apos;ll need to login again to access the system.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsLogoutDialogOpen(false)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLogout}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Quick View Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Branch Overview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {branches.length} Total Branches
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activeBranchesCount} active, {inactiveBranchesCount}{" "}
                          inactive
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Mobile Support Info */}
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Phone className="h-3 w-3 text-green-600" />
                <span className="font-medium">Support: 0702629361</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Menu Slide-in */}
          <div
            className={cn(
              "md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-6">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentBranch?.name || "No branch selected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{currentTime}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-8">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Store className="h-4 w-4 mr-3" />
                  Business Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Eye className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
              </div>

              {/* Logout Button - Mobile */}
              <div className="mb-8">
                <Dialog
                  open={isLogoutDialogOpen}
                  onOpenChange={setIsLogoutDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-red-600" />
                        Confirm Logout
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Are you sure you want to logout from{" "}
                          {businessData?.name}?
                        </p>
                        <p className="text-xs text-gray-500">
                          You&apos;ll need to login again to access the system.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsLogoutDialogOpen(false)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLogout}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Support Section */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Need Help?
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Our support team is available 24/7 to assist you.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.open("tel:0702629361")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen pb-20">
        <div className="container mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Branch Management
                  </h1>
                </div>
                <p className="text-gray-600 max-w-2xl">
                  Manage your business branches, locations, and team access
                  across all your operations
                </p>
              </div>
            </div>

            {user?.role === "owner" && (
              <Button
                onClick={handleAddBranch}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Branch
              </Button>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Branches
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {branches.length}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activeBranchesCount}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Inactive
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {inactiveBranchesCount}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current</p>
                    <p className="text-lg font-bold text-primary truncate">
                      {currentBranch?.name || "None"}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Branch Highlight */}
          {currentBranch && (
            <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-primary/10 text-primary border-primary/20"
                      >
                        Currently Active
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentBranch.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentBranch.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last active</p>
                    <p className="text-sm font-medium text-gray-900">Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search branches by name, address, or manager..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-primary/50"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "active" ? "default" : "outline"}
                    onClick={() => setStatusFilter("active")}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </Button>
                  <Button
                    variant={
                      statusFilter === "inactive" ? "default" : "outline"
                    }
                    onClick={() => setStatusFilter("inactive")}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </Button>
                </div>
              </div>

              {searchQuery || statusFilter !== "all" ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  Showing {filteredBranches.length} of {branches.length}{" "}
                  branches
                  {(searchQuery || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Branches Grid */}
          {filteredBranches.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="w-20 h-20 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {branches.length === 0
                    ? "No branches found"
                    : "No matching branches"}
                </h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  {branches.length === 0
                    ? "Get started by adding your first branch to manage multiple locations."
                    : "Try adjusting your search or filters to find what you're looking for."}
                </p>
                {user?.role === "owner" && branches.length === 0 && (
                  <Button onClick={handleAddBranch} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Branch
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    branch.id === currentBranch?.id
                      ? "ring-2 ring-primary shadow-primary/25 bg-gradient-to-br from-primary/5 to-transparent"
                      : "bg-white/80 backdrop-blur-sm hover:scale-105"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Branch Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {branch.name}
                          </h3>
                          {branch.isMain && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 border-blue-200"
                            >
                              Main
                            </Badge>
                          )}
                          {branch.id === currentBranch?.id && (
                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant={branch.isActive ? "default" : "secondary"}
                            size="sm"
                            onClick={() => toggleBranchStatus(branch)}
                            className={`text-xs h-7 ${
                              branch.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            }`}
                          >
                            {branch.isActive ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {branch.isActive ? "Active" : "Inactive"}
                          </Button>

                          {user?.role === "owner" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditBranch(branch)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Branch
                                </DropdownMenuItem>
                                {!branch.isMain && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteBranch(branch)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Branch
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Branch Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          {branch.address}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {branch.phone && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <p className="text-sm text-gray-700 truncate">
                              {branch.phone}
                            </p>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <p className="text-sm text-gray-700 truncate">
                              {branch.email}
                            </p>
                          </div>
                        )}
                      </div>

                      {branch.manager && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Manager</p>
                            <p className="text-sm font-medium text-gray-900">
                              {branch.manager}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {user?.role === "owner" &&
                        branch.id !== currentBranch?.id && (
                          <Button
                            onClick={() => handleSwitchBranch(branch.id)}
                            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            size="sm"
                          >
                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                            Switch to This Branch
                          </Button>
                        )}

                      {user?.role === "owner" &&
                        branch.id === currentBranch?.id && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            size="sm"
                            disabled
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Current Branch
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add/Edit Branch Modal */}
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </DialogTitle>
                <DialogDescription>
                  {editingBranch
                    ? "Update the branch information below."
                    : "Add a new branch location to expand your business operations."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Branch Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter branch name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address *
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete branch address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+256 ..."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="focus:ring-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="branch@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager" className="text-sm font-medium">
                    Manager
                  </Label>
                  <Input
                    id="manager"
                    placeholder="Enter manager's name"
                    value={formData.manager}
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                    className="focus:ring-primary/50"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBranch}
                  disabled={
                    loading || !formData.name.trim() || !formData.address.trim()
                  }
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {editingBranch ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingBranch ? "Update Branch" : "Create Branch"}</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteBranchDialog}
            onOpenChange={() => setDeleteBranchDialog(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Delete Branch
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{deleteBranchDialog?.name}&rdquo;</strong>?
                  This action cannot be undone and will remove all associated
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteBranch}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Branch"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      {/* Mobile Support FAB */}
      <div className="fixed bottom-24 right-4 z-30 md:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => window.open("tel:0702629361")}
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
      <AppFooter />
    </div>
  );
}
