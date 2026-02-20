/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  UsersIcon,
  Phone,
  Mail,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Clock,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { UserProfile as User } from "@/context/UserContext";
import { UserRole } from "@/context/UserContext";
import { useRef } from "react";
import { ResetPinDialog } from "@/components/users/ResetPinDialog";

const roleColors: Record<UserRole, string> = {
  [UserRole.OWNER]: "bg-purple-100 text-purple-800 border-purple-200",
  [UserRole.ADMIN]: "bg-red-100 text-red-800 border-red-200",
  [UserRole.MANAGER]: "bg-teal-100 text-teal-800 border-teal-200",
  [UserRole.CASHIER]: "bg-blue-100 text-blue-800 border-blue-200",
  [UserRole.ARTISAN]: "bg-orange-100 text-orange-800 border-orange-200",
  [UserRole.INVENTORY_MANAGER]:
    "bg-indigo-100 text-indigo-800 border-indigo-200",
  [UserRole.SALES_REP]: "bg-green-100 text-green-800 border-green-200",
  [UserRole.ACCOUNTANT]: "bg-slate-100 text-slate-800 border-slate-200",
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  [UserRole.OWNER]: <Shield className="h-3 w-3" />,
  [UserRole.ADMIN]: <Shield className="h-3 w-3" />,
  [UserRole.MANAGER]: <UserCheck className="h-3 w-3" />,
  [UserRole.CASHIER]: <UsersIcon className="h-3 w-3" />,
  [UserRole.ARTISAN]: <UsersIcon className="h-3 w-3" />,
  [UserRole.INVENTORY_MANAGER]: <UserCheck className="h-3 w-3" />,
  [UserRole.SALES_REP]: <UsersIcon className="h-3 w-3" />,
  [UserRole.ACCOUNTANT]: <UserCheck className="h-3 w-3" />,
};

export default function UsersPage() {
  const {
    users,
    loading,
    getUsers,
    currentBranch,
    resetUserPIN,
    deleteUser,
    createUser,
    updateUser,
  } = useUser();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: UserRole.CASHIER,
    password: "",
    pin: "",
  });

  // Ensure we fetch at most once per branch id (guards StrictMode double-invoke)
  const fetchedBranchIdRef = useRef<string | null>(null);

  // Fetch real users for current branch
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (
          currentBranch?.id &&
          fetchedBranchIdRef.current !== currentBranch.id
        ) {
          fetchedBranchIdRef.current = currentBranch.id;
          await getUsers(currentBranch.id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    };
    fetchUsers();
  }, [currentBranch?.id, getUsers]);

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatPhoneNumber = (input: string): string => {
    let formatted = input.replace(/[^\d+]/g, "");
    if (formatted.startsWith("+")) {
      formatted = "+" + formatted.slice(1).replace(/\D/g, "");
    } else {
      formatted = formatted.replace(/\D/g, "");
    }
    if (!formatted.startsWith("+") && formatted.length > 0) {
      if (formatted.startsWith("0")) {
        formatted = "+256" + formatted.slice(1);
      } else {
        formatted = "+" + formatted;
      }
    }
    return formatted;
  };

  const handleAddUser = async () => {
    if (!newUser.firstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter first name",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(newUser.phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid international phone number (e.g. +256712345678)",
        variant: "destructive",
      });
      return;
    }

    if (!newUser.password || newUser.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    const pinRegex = /^\d{4,6}$/;
    if (!pinRegex.test(newUser.pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!currentBranch?.id) {
        toast({
          title: "Missing Branch",
          description: "Select a branch before creating a user",
          variant: "destructive",
        });
        return;
      }

      await createUser({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        branchId: currentBranch.id,
        password: newUser.password,
        pin: newUser.pin,
      } as unknown as Parameters<typeof createUser>[0]);

      setNewUser({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: UserRole.CASHIER,
        password: "",
        pin: "",
      });
      setShowAddModal(false);

      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!editingUser.firstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter first name",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(editingUser.phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid international phone number (e.g. +256712345678)",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser(editingUser.id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        phone: editingUser.phone,
        email: editingUser.email,
        role: editingUser.role,
      });
      if (currentBranch?.id) {
        // refresh list after update
        await getUsers(currentBranch.id);
      }
      setShowEditModal(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      // Allow next navigation to refetch by clearing the guard
      fetchedBranchIdRef.current = null;
      if (currentBranch?.id) {
        await getUsers(currentBranch.id);
        fetchedBranchIdRef.current = currentBranch.id;
      }
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };


  const getStatusBadge = (user: User) => {
    const isActive = user.lastLoginAt;
    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${
          isActive
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        {isActive ? (
          <>
            <UserCheck className="h-3 w-3" />
            Active
          </>
        ) : (
          <>
            <UserX className="h-3 w-3" />
            Inactive
          </>
        )}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl">
            <UsersIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their access permissions
            </p>
          </div>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Team Member</DialogTitle>
              <DialogDescription>
                Create a new user account with specific role and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      phone: formatPhoneNumber(e.target.value),
                    })
                  }
                  placeholder="+256712345678"
                  maxLength={15}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium">
                    PIN (4-6 digits) *
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    value={newUser.pin}
                    onChange={(e) =>
                      setNewUser({ ...newUser, pin: e.target.value })
                    }
                    placeholder="1234"
                    maxLength={6}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value as UserRole })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.CASHIER}>Cashier</SelectItem>
                    <SelectItem value={UserRole.SALES_REP}>
                      Shopkeeper
                    </SelectItem>
                    <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                    <SelectItem value={UserRole.ARTISAN}>Artisan</SelectItem>
                    <SelectItem value={UserRole.ACCOUNTANT}>
                      Accountant
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-teal-600 hover:bg-teal-700 h-11 px-6"
                disabled={loading}
              >
                Add Team Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {users.length}
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {users.filter((u) => u.lastLoginAt).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Inactive
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {users.filter((u) => !u.lastLoginAt).length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Roles</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Set(users.map((u) => u.role)).size}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-white rounded-2xl border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 w-full"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value: UserRole | "all") => setRoleFilter(value)}
            >
              <SelectTrigger className="h-11 w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-16 border-2 border-dashed">
          <CardContent>
            <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first team member"}
            </p>
            {!searchTerm && roleFilter === "all" && (
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First User
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="group hover:shadow-xl transition-all duration-300 border hover:border-teal-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold">
                        {user.firstName.charAt(0)}
                        {user.lastName?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        {user.phone}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="dropdown dropdown-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {user.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3 truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {user.email}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <Badge
                    className={`${roleColors[user.role]} flex items-center gap-1`}
                    variant="outline"
                  >
                    {roleIcons[user.role]}
                    {user.role.replace("_", " ")}
                  </Badge>
                  {getStatusBadge(user)}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsModal(true);
                      }}
                      className="h-8 w-8 p-0 hover:bg-teal-50 hover:text-teal-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {![UserRole.OWNER, UserRole.ADMIN].includes(user.role) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.firstName}{" "}
                              {user.lastName}? This action cannot be undone and
                              will remove their access immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {user.lastLoginAt ? "Active" : "Never logged in"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="editFirstName"
                    className="text-sm font-medium"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="editFirstName"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="Enter first name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="editLastName"
                    value={editingUser.lastName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Enter last name"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone" className="text-sm font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="editPhone"
                  value={editingUser.phone}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      phone: formatPhoneNumber(e.target.value),
                    })
                  }
                  placeholder="+256712345678"
                  maxLength={15}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRole" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value as UserRole })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                    <SelectItem value={UserRole.CASHIER}>Cashier</SelectItem>
                    <SelectItem value={UserRole.ARTISAN}>Artisan</SelectItem>
                    <SelectItem value={UserRole.ACCOUNTANT}>
                      Accountant
                    </SelectItem>
                    <SelectItem value={UserRole.SALES_REP}>
                      Sales Rep
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-teal-600 hover:bg-teal-700 h-11 px-6"
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">User Details</DialogTitle>
            <DialogDescription>
              Complete information and activity for this team member
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border">
                <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-lg font-semibold">
                    {selectedUser.firstName.charAt(0)}
                    {selectedUser.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      className={`${roleColors[selectedUser.role]} flex items-center gap-1`}
                      variant="outline"
                    >
                      {roleIcons[selectedUser.role]}
                      {selectedUser.role.replace("_", " ")}
                    </Badge>
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Phone className="h-4 w-4" />
                    Phone:
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedUser.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Mail className="h-4 w-4" />
                    Email:
                  </div>
                  <span className="text-sm text-gray-900">
                    {selectedUser.email || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <UserCheck className="h-4 w-4" />
                    Status:
                  </div>
                  <span className="text-sm text-gray-900">
                    {selectedUser.status || "Active"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Clock className="h-4 w-4" />
                    Last Login:
                  </div>
                  <span className="text-sm text-gray-900">
                    {selectedUser.lastLoginAt
                      ? new Date(selectedUser.lastLoginAt).toLocaleString()
                      : "Never logged in"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Member Since:
                  </div>
                  <span className="text-sm text-gray-900">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50 border-gray-300"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditingUser(selectedUser);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-orange-50 border-orange-300 text-orange-700 hover:text-orange-800"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowResetPinModal(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset PIN
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ResetPinDialog
        user={selectedUser}
        open={showResetPinModal}
        onOpenChange={setShowResetPinModal}
      />
    </div>
  );
}
