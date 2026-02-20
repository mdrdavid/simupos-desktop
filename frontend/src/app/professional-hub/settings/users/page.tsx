/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "@/components/ui/use-toast";
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
  ArrowLeft,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { UserProfile as User } from "@/context/UserContext";
import { UserRole } from "@/context/UserContext";
import { ResetPinDialog } from "@/components/users/ResetPinDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

export default function ProfessionalHubUsersPage() {
  const router = useRouter();
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
    role: UserRole.SALES_REP,
    password: "",
    pin: "",
  });

  const fetchedBranchIdRef = useRef<string | null>(null);

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
      } as any);

      setNewUser({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: UserRole.SALES_REP,
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

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <UsersIcon className="h-8 w-8 text-brand-primary" />
                Team Management
              </h1>
              <p className="text-gray-500 mt-1">Manage your team members and their access permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-brand-primary hover:bg-brand-secondary text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
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
                        <SelectItem value={UserRole.SALES_REP}>Shopkeeper</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                        <SelectItem value={UserRole.ARTISAN}>Artisan</SelectItem>
                        <SelectItem value={UserRole.ACCOUNTANT}>Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="bg-brand-primary hover:bg-brand-secondary h-11 px-6"
                    disabled={loading}
                  >
                    Add Team Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <UsersIcon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.lastLoginAt).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive Members</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => !u.lastLoginAt).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <UserX className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique Roles</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(users.map(u => u.role)).size}</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
                <Shield className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50/50 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={roleFilter}
              onValueChange={(value: UserRole | "all") => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50 border-gray-200">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace("_", " ").charAt(0).toUpperCase() + role.replace("_", " ").slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <UsersIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No members found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}
              className="text-brand-primary"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-brand-primary text-white font-bold">
                          {user.firstName[0]}{user.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsModal(true);
                        }}
                        className="h-8 w-8 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <Badge className={cn("capitalize font-medium", roleColors[user.role])}>
                        {user.role.replace("_", " ")}
                      </Badge>
                      {getStatusBadge(user)}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {user.lastLoginAt ? "Active now" : "Never active"}
                    </div>
                    {user.role !== UserRole.OWNER && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {user.firstName}? This will immediately revoke their access to the Professional Hub.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Team Member</DialogTitle>
            <DialogDescription>
              Update information and access level
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, firstName: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editingUser.lastName || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, lastName: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number *</Label>
                <Input
                  id="editPhone"
                  value={editingUser.phone}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      phone: formatPhoneNumber(e.target.value),
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
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
                    <SelectItem value={UserRole.ACCOUNTANT}>Accountant</SelectItem>
                    <SelectItem value={UserRole.SALES_REP}>Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} className="bg-brand-primary hover:bg-brand-secondary text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Member Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-brand-primary text-white text-xl font-bold">
                    {selectedUser.firstName[0]}{selectedUser.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className={cn("capitalize", roleColors[selectedUser.role])}>
                      {selectedUser.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{selectedUser.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{selectedUser.email || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Joined Date</span>
                  <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Last Login</span>
                  <span className="font-medium">
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "Never"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowResetPinModal(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset PIN
                </Button>
                <Button
                  className="flex-1 bg-brand-primary text-white"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditingUser(selectedUser);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
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
