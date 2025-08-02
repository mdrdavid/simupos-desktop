/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Users, Shield, Edit, Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allPermissions = [
  {
    id: "orders",
    label: "Orders Management",
    description: "Create, view, and manage orders",
  },
  {
    id: "tables",
    label: "Table Management",
    description: "Manage table status and reservations",
  },
  {
    id: "kitchen",
    label: "Kitchen Display",
    description: "Access kitchen display system",
  },
  {
    id: "checkout",
    label: "Checkout & Payment",
    description: "Process payments and complete orders",
  },
  {
    id: "menu",
    label: "Menu Management",
    description: "Add, edit, and manage menu items",
  },
  {
    id: "inventory",
    label: "Inventory Management",
    description: "Manage ingredients and stock",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    description: "View sales reports and analytics",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Access restaurant settings",
  },
  {
    id: "users",
    label: "User Management",
    description: "Manage staff and roles",
  },
  {
    id: "all",
    label: "Full Access",
    description: "Complete access to all features",
  },
];

export default function RolesPermissions() {
  const { users, roles } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "destructive";
      case "Waiter":
        return "default";
      case "Kitchen":
        return "secondary";
      case "Cashier":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPermissionDescription = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "Full access to all restaurant features";
      case "Waiter":
        return "Orders and table management only";
      case "Kitchen":
        return "Kitchen display system access only";
      case "Cashier":
        return "Orders and checkout access";
      default:
        return "Custom permissions";
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="text-gray-600">
            Manage staff roles and access permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog
            open={isAddRoleDialogOpen}
            onOpenChange={setIsAddRoleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-1" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input id="role-name" placeholder="e.g., Manager" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                    {allPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-2"
                      >
                        <Checkbox id={permission.id} />
                        <div className="flex-1">
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-medium"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-gray-500">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Create Role</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAddUserDialogOpen}
            onOpenChange={setIsAddUserDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input id="user-name" placeholder="Enter full name" />
                </div>
                <div>
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="user-active" defaultChecked />
                  <Label htmlFor="user-active">Active User</Label>
                </div>
                <Button className="w-full">Add User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const userCount = users.filter(
            (user) => user.role.id === role.id
          ).length;

          return (
            <Card key={role.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">{role.name}</span>
                  </div>
                  <Badge variant={getRoleColor(role.name) as any}>
                    {userCount} users
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {getPermissionDescription(role.name)}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {role.name !== "Admin" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the &quot;
                            {role.name}&quot; role? This will affect {userCount}{" "}
                            users.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Members</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={getRoleColor(user.role.name) as any}>
                      {user.role.name}
                    </Badge>

                    <div className="flex items-center space-x-1">
                      <Switch checked={user.isActive} />
                      <span className="text-sm text-gray-600">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>

                      {user.role.name !== "Admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {user.name} from
                                the system? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Permission</th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="text-center py-2 px-4 min-w-[100px]"
                    >
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions
                  .filter((p) => p.id !== "all")
                  .map((permission) => (
                    <tr key={permission.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{permission.label}</p>
                          <p className="text-sm text-gray-500">
                            {permission.description}
                          </p>
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            {role.permissions.includes("all") ||
                            role.permissions.includes(permission.id) ? (
                              <div className="w-4 h-4 bg-green-500 rounded-full" />
                            ) : (
                              <div className="w-4 h-4 bg-gray-300 rounded-full" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
