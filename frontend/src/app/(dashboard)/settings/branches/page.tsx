/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import {
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Building,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  GitBranch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Branch } from "@/context/BranchContext";

const BranchManagementPage = () => {
  const {
    branches,
    currentBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    switchBranch,
    loading,
  } = useBranch();
  const { user } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
  });

  const resetForm = () => {
    setFormData({ name: "", address: "", phone: "", email: "", manager: "" });
  };

  const handleAddBranch = () => {
    resetForm();
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setFormData({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      manager: branch.manager || "",
    });
    setEditingBranch(branch);
    setIsModalOpen(true);
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
        toast({ title: "Success", description: "Branch updated successfully" });
      } else {
        await createBranch({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          manager: formData.manager.trim() || undefined,
          isActive: true,
        });
        toast({ title: "Success", description: "Branch added successfully" });
      }
      setIsModalOpen(false);
      resetForm();
      setEditingBranch(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          editingBranch ? "update" : "add"
        } branch.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await deleteBranch(branchId);
      toast({ title: "Success", description: "Branch deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete branch.",
        variant: "destructive",
      });
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    try {
      await switchBranch(branchId);
      toast({ title: "Success", description: "Branch switched successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch branch.",
        variant: "destructive",
      });
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    try {
      await updateBranch(branch.id, { isActive: !branch.isActive });
      toast({
        title: "Success",
        description: `Branch ${
          branch.isActive ? "deactivated" : "activated"
        }`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch status.",
        variant: "destructive",
      });
    }
  };

  if (loading && branches.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold">Branch Management</h1>
            <p className="text-muted-foreground">
              Manage all your business branches
            </p>
          </div>
        </div>
      </div>

      {user?.role === "owner" && (
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddBranch}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Branch
          </Button>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className={`flex flex-col ${
              branch.id === currentBranch?.id
                ? "border-teal-500 border-2"
                : ""
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {branch.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={branch.isActive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {branch.isMain && (
                      <Badge variant="secondary" className="text-xs">
                        Main
                      </Badge>
                    )}
                    {branch.id === currentBranch?.id && (
                      <Badge className="bg-teal-500 text-white text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>

                {user?.role === "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditBranch(branch)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleBranchStatus(branch)}
                      >
                        {branch.isActive ? (
                          <XCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        <span>
                          {branch.isActive ? "Deactivate" : "Activate"}
                        </span>
                      </DropdownMenuItem>
                      {!branch.isMain && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-2 h-auto font-normal text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the branch{" "}
                                {branch.name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                <span className="flex-1">{branch.address}</span>
              </div>
              {branch.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{branch.phone}</span>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{branch.email}</span>
                </div>
              )}
              {branch.manager && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Manager: {branch.manager}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {branch.id !== currentBranch?.id && (
                <Button
                  onClick={() => handleSwitchBranch(branch.id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GitBranch className="mr-2 h-4 w-4" />
                  )}
                  Switch to this Branch
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {branches.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No branches found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first branch.
          </p>
          {user?.role === "owner" && (
            <div className="mt-6">
              <Button onClick={handleAddBranch}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Branch
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update the details of your branch."
                : "Add a new branch to your business."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Main Branch"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="col-span-3"
                placeholder="123 Business St, City"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="col-span-3"
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
                placeholder="branch@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager" className="text-right">
                Manager
              </Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) =>
                  setFormData({ ...formData, manager: e.target.value })
                }
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSaveBranch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchManagementPage;
