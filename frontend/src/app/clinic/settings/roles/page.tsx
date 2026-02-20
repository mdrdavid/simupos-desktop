"use client";

import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  UserCheck,
  Edit,
  Plus,
  Lock,
  Unlock,
  Search,
  Filter,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Download,
  Activity,
  Crown,
  Star,
  Key,
  UserCog,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RolesPage() {
  const { staff, roles, addStaffMember, updateStaffMember } = useClinic();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
  });

  const rolePermissions = {
    Receptionist: [
      {
        id: "add_patients",
        name: "Add Patients",
        description: "Add new patients to the system",
        module: "patients",
        icon: "👥",
      },
      {
        id: "view_patients",
        name: "View Patients",
        description: "Search and view patient records",
        module: "patients",
        icon: "👀",
      },
      {
        id: "start_visits",
        name: "Start Visits",
        description: "Initiate new patient visits",
        module: "visits",
        icon: "📝",
      },
      {
        id: "view_visits",
        name: "View Visits",
        description: "View visit status and details",
        module: "visits",
        icon: "📋",
      },
      {
        id: "print_receipts",
        name: "Print Receipts",
        description: "Print and send receipts",
        module: "visits",
        icon: "🧾",
      },
    ],
    Nurse: [
      {
        id: "add_patients",
        name: "Add Patients",
        description: "Add new patients to the system",
        module: "patients",
        icon: "👥",
      },
      {
        id: "view_patients",
        name: "View Patients",
        description: "Search and view patient records",
        module: "patients",
        icon: "👀",
      },
      {
        id: "view_patient_history",
        name: "View Patient History",
        description: "Access patient visit history",
        module: "patients",
        icon: "📊",
      },
      {
        id: "start_visits",
        name: "Start Visits",
        description: "Initiate new patient visits",
        module: "visits",
        icon: "📝",
      },
      {
        id: "add_services",
        name: "Add Services",
        description: "Add services to patient visits",
        module: "services",
        icon: "🩺",
      },
      {
        id: "dispense_medicine",
        name: "Dispense Medicine",
        description: "Dispense medicines during visits",
        module: "pharmacy",
        icon: "💊",
      },
      {
        id: "view_medicine_stock",
        name: "View Medicine Stock",
        description: "View medicine inventory (read-only)",
        module: "pharmacy",
        icon: "📦",
      },
      {
        id: "print_receipts",
        name: "Print Receipts",
        description: "Print and send receipts",
        module: "visits",
        icon: "🧾",
      },
    ],
    Pharmacist: [
      {
        id: "view_medicine_stock",
        name: "View Medicine Stock",
        description: "View medicine inventory status",
        module: "pharmacy",
        icon: "📦",
      },
      {
        id: "add_medicines",
        name: "Add Medicines",
        description: "Add new medicines to inventory",
        module: "pharmacy",
        icon: "➕",
      },
      {
        id: "stock_entries",
        name: "Stock Entries",
        description: "Record stock entries and adjustments",
        module: "pharmacy",
        icon: "📥",
      },
      {
        id: "dispense_medicine",
        name: "Dispense Medicine",
        description: "Dispense medicines during visits",
        module: "pharmacy",
        icon: "💊",
      },
      {
        id: "low_stock_reports",
        name: "Low Stock Reports",
        description: "Access low stock medicine reports",
        module: "reports",
        icon: "⚠️",
      },
      {
        id: "expiry_alerts",
        name: "Expiry Alerts",
        description: "View and manage expiry alerts",
        module: "pharmacy",
        icon: "📅",
      },
    ],
    Manager: [
      {
        id: "full_access",
        name: "Full Access",
        description: "Complete access to all clinic features",
        module: "settings",
        icon: "🔑",
      },
      {
        id: "manage_settings",
        name: "Manage Settings",
        description: "Manage clinic settings and configurations",
        module: "settings",
        icon: "⚙️",
      },
      {
        id: "manage_roles",
        name: "Manage Roles",
        description: "Create and modify user roles",
        module: "settings",
        icon: "👑",
      },
      {
        id: "view_all_reports",
        name: "View All Reports",
        description: "Access all reports and analytics",
        module: "reports",
        icon: "📈",
      },
      {
        id: "manage_services",
        name: "Manage Services",
        description: "Add, edit, and delete services",
        module: "services",
        icon: "🩺",
      },
      {
        id: "billing_overrides",
        name: "Billing Overrides",
        description: "Override billing and inventory adjustments",
        module: "visits",
        icon: "💰",
      },
    ],
    Admin: [
      {
        id: "system_admin",
        name: "System Administrator",
        description: "Complete system administration access",
        module: "settings",
        icon: "👑",
      },
    ],
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "Manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Pharmacist":
        return "bg-green-100 text-green-800 border-green-200";
      case "Nurse":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Receptionist":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return <Crown className="h-4 w-4" />;
      case "Manager":
        return <Settings className="h-4 w-4" />;
      case "Pharmacist":
        return <Activity className="h-4 w-4" />;
      case "Nurse":
        return <UserCheck className="h-4 w-4" />;
      case "Receptionist":
        return <Users className="h-4 w-4" />;
      default:
        return <UserCog className="h-4 w-4" />;
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.phone && newStaff.roleId) {
      const selectedRoleObj = roles.find((r) => r.id === newStaff.roleId);
      if (selectedRoleObj) {
        addStaffMember({
          ...newStaff,
          role: selectedRoleObj,
          isActive: true,
        });
        setNewStaff({ name: "", email: "", phone: "", roleId: "" });
        setIsAddStaffOpen(false);
      }
    }
  };

  const toggleStaffStatus = (staffId: string, currentStatus: boolean) => {
    updateStaffMember(staffId, { isActive: !currentStatus });
  };

  // Statistics
  const totalStaff = staff.length;
  const activeStaff = staff.filter((member) => member.isActive).length;
  const roleDistribution = roles.map((role) => ({
    role: role.name,
    count: staff.filter((member) => member.role.id === role.id).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Roles & Permissions
              </h1>
              <p className="text-gray-600 mt-1">
                Manage staff roles, access permissions, and security settings
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      Add New Staff Member
                    </DialogTitle>
                    <DialogDescription>
                      Create a new staff account with role assignment and
                      permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={newStaff.name}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, name: e.target.value })
                        }
                        placeholder="Enter full name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, email: e.target.value })
                        }
                        placeholder="Enter email address"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone *
                      </Label>
                      <Input
                        id="phone"
                        value={newStaff.phone}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">
                        Role *
                      </Label>
                      <Select
                        value={newStaff.roleId}
                        onValueChange={(value) =>
                          setNewStaff({ ...newStaff, roleId: value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role.name)}
                                <span>{role.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddStaffOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddStaff}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Staff Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 bg-blue-50 border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Staff
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {totalStaff}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-green-50 border-l-4 border-l-green-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Active Staff
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      {activeStaff}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-purple-50 border-l-4 border-l-purple-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Roles</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {roles.length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-orange-50 border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      Most Common
                    </p>
                    <p className="text-lg font-bold text-orange-800">
                      {
                        roleDistribution.reduce((a, b) =>
                          a.count > b.count ? a : b
                        ).role
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters for Staff */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="h-11 border-gray-300"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Roles Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <Shield className="h-6 w-6 mr-3" />
                  Role Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {roles.map((role) => {
                    const staffCount = staff.filter(
                      (s) => s.role.id === role.id
                    ).length;
                    const activeStaffCount = staff.filter(
                      (s) => s.role.id === role.id && s.isActive
                    ).length;

                    return (
                      <div
                        key={role.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRole === role.id
                            ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                        onClick={() =>
                          setSelectedRole(
                            selectedRole === role.id ? null : role.id
                          )
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border">
                              {getRoleIcon(role.name)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {role.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={getRoleColor(role.name)}
                                >
                                  {staffCount} staff
                                </Badge>
                                <span className="text-sm text-green-600">
                                  {activeStaffCount} active
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedRole === role.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 text-lg">
                  <Key className="h-5 w-5 mr-2 inline" />
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Assign roles based on job responsibilities
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Regularly review and update staff permissions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Follow principle of least privilege for security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Permissions */}
            {selectedRole && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
                  <CardTitle className="flex items-center text-purple-900">
                    <Settings className="h-6 w-6 mr-3" />
                    {roles.find((r) => r.id === selectedRole)?.name} Permissions
                  </CardTitle>
                  <CardDescription>
                    Detailed access permissions and capabilities for this role
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolePermissions[
                      roles.find((r) => r.id === selectedRole)
                        ?.name as keyof typeof rolePermissions
                    ]?.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="text-2xl mt-1">{permission.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {permission.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100"
                            >
                              {permission.module}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {permission.description}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Unlock className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Staff Management */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-100">
                <CardTitle className="flex items-center text-orange-900">
                  <Users className="h-6 w-6 mr-3" />
                  Staff Management
                </CardTitle>
                <CardDescription>
                  Manage staff accounts, roles, and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {filteredStaff.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "No staff members match your search"
                        : "No staff members added yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStaff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {member.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={getRoleColor(member.role.name)}
                              >
                                {getRoleIcon(member.role.name)}
                                <span className="ml-1">{member.role.name}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span>📧</span>
                                <span className="truncate">{member.email}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📞</span>
                                <span>{member.phone}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`active-${member.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {member.isActive ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Label>
                            <Switch
                              id={`active-${member.id}`}
                              checked={member.isActive}
                              onCheckedChange={() =>
                                toggleStaffStatus(member.id, member.isActive)
                              }
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Access Control Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                <CardTitle>Access Control Matrix</CardTitle>
                <CardDescription>
                  Overview of role-based permissions across clinic modules
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Patient Management
                      </h4>
                      <div className="space-y-3">
                        {[
                          "Add Patients",
                          "View Patient History",
                          "Edit Patient Records",
                        ].map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{permission}</span>
                            <div className="flex gap-1">
                              {roles.map((role) => (
                                <div
                                  key={role.id}
                                  className={`w-3 h-3 rounded-full ${
                                    role.name === "Admin" ||
                                    role.name === "Manager" ||
                                    (role.name === "Receptionist" &&
                                      permission === "Add Patients") ||
                                    (role.name === "Nurse" &&
                                      permission !== "Edit Patient Records")
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                  title={role.name}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Pharmacy & Inventory
                      </h4>
                      <div className="space-y-3">
                        {[
                          "Dispense Medicine",
                          "Manage Inventory",
                          "View Stock Reports",
                        ].map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{permission}</span>
                            <div className="flex gap-1">
                              {roles.map((role) => (
                                <div
                                  key={role.id}
                                  className={`w-3 h-3 rounded-full ${
                                    role.name === "Admin" ||
                                    role.name === "Manager" ||
                                    (role.name === "Pharmacist" &&
                                      permission !== "Manage Inventory") ||
                                    (role.name === "Nurse" &&
                                      permission === "Dispense Medicine")
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                  title={role.name}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Features
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • Role-based access control ensures staff only see
                        relevant features
                      </li>
                      <li>• Secure authentication with session management</li>
                      <li>• Audit trails for sensitive operations</li>
                      <li>
                        • Granular permissions for fine-tuned access control
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
