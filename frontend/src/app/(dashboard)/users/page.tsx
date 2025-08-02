/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: UserRole;
  status?: string;
  lastLoginAt?: string;
  createdAt?: string;
  branchId: string;
}

enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
  ARTISAN = "ARTISAN",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
  SALES_REP = "SALES_REP",
  ACCOUNTANT = "ACCOUNTANT",
}

const roleColors = {
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: UserRole.CASHIER,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        phone: "+256712345678",
        email: "john@example.com",
        role: UserRole.OWNER,
        status: "active",
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        branchId: "branch1",
      },
      {
        id: "2",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+256787654321",
        email: "jane@example.com",
        role: UserRole.MANAGER,
        status: "active",
        lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        branchId: "branch1",
      },
      {
        id: "3",
        firstName: "Mike",
        lastName: "Johnson",
        phone: "+256701234567",
        role: UserRole.CASHIER,
        status: "active",
        createdAt: new Date().toISOString(),
        branchId: "branch1",
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

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

    try {
      // Mock API call
      const user: User = {
        id: Date.now().toString(),
        ...newUser,
        branchId: "branch1",
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, user]);
      setNewUser({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: UserRole.CASHIER,
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
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? editingUser : user))
      );
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
      setUsers((prev) => prev.filter((user) => user.id !== userId));
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

  const handleResetPin = async (userId: string) => {
    try {
      toast({
        title: "Success",
        description: "PIN reset successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Users</h1>
            <p className="text-gray-600">
              Manage your team members and their roles
            </p>
          </div>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {user.firstName.charAt(0)}
                      {user.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </p>
                  </div>
                </div>

                <Badge className={roleColors[user.role]} variant="outline">
                  {user.role}
                </Badge>
              </div>

              {user.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailsModal(true);
                    }}
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
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {![UserRole.OWNER, UserRole.ADMIN].includes(user.role) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <span className="text-xs text-gray-500">
                  {user.lastLoginAt ? "Active" : "Never logged in"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name *</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
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
                  />
                </div>
              </div>

              <div>
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
                  placeholder="+256712345678"
                  maxLength={15}
                />
              </div>

              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {selectedUser.firstName.charAt(0)}
                    {selectedUser.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <Badge
                    className={roleColors[selectedUser.role]}
                    variant="outline"
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">
                    Phone:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedUser.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">
                    Email:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedUser.email || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedUser.status || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">
                    Last Login:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedUser.lastLoginAt
                      ? new Date(selectedUser.lastLoginAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Created:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditingUser(selectedUser);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset PIN
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset PIN</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reset this user&apos;s PIN?
                        They will need to set a new PIN on their next login.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleResetPin(selectedUser.id);
                          setShowDetailsModal(false);
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Reset PIN
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
