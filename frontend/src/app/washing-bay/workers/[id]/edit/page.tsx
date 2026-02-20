/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, User, DollarSign } from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";

interface WorkerFormData {
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  isActive: boolean;
}

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;

  const { workers, fetchWorkers, updateWorker, loading } = useWashingBay();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState<WorkerFormData>({
    name: "",
    employeeId: "",
    phone: "",
    email: "",
    commissionType: "percentage",
    commissionValue: 15,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (workers.length > 0 && workerId) {
      const worker = workers.find((w) => w.id === workerId);
      if (worker) {
        setFormData({
          name: worker.name,
          employeeId: worker.employeeId || "",
          phone: worker.phone || "",
          email: worker.email || "",
          commissionType: worker.commissionType,
          commissionValue: worker.commissionValue,
          isActive: worker.isActive,
        });
      }
    }
  }, [workers, workerId]);

  const handleInputChange = (
    field: keyof WorkerFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBranchId) {
      alert("Please select a branch first");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        commissionType: formData.commissionType,
        commissionValue: Number(formData.commissionValue),
        isActive: Boolean(formData.isActive),
      };

      console.log("Updating worker with data:", updateData);

      await updateWorker(workerId, updateData);
      router.push(`/washing-bay/workers/${workerId}`);
    } catch (error: any) {
      console.error("Failed to update worker:", error);
      alert(`Failed to update worker: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading worker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/washing-bay/workers/${workerId}`)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Worker</h1>
          <p className="text-gray-600 mt-1">
            Update worker details and commission settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Worker Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter worker's full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      placeholder="Optional employee ID"
                      value={formData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Commission Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commissionType">Commission Type *</Label>
                    <Select
                      value={formData.commissionType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        handleInputChange("commissionType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionValue">
                      {formData.commissionType === "percentage"
                        ? "Commission Percentage *"
                        : "Fixed Commission *"}
                    </Label>
                    <Input
                      id="commissionValue"
                      type="number"
                      placeholder={
                        formData.commissionType === "percentage" ? "15" : "5000"
                      }
                      value={formData.commissionValue}
                      onChange={(e) =>
                        handleInputChange(
                          "commissionValue",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                      min="0"
                      step={
                        formData.commissionType === "percentage" ? "1" : "100"
                      }
                    />
                  </div>
                </div>

                {formData.commissionType === "percentage" && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Worker will earn {formData.commissionValue}% of each
                      completed wash order
                    </p>
                  </div>
                )}

                {formData.commissionType === "fixed" && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Worker will earn UGX{" "}
                      {formData.commissionValue.toLocaleString()} for each
                      completed wash order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive">Active Worker</Label>
                </div>

                {formData.isActive ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      This worker is active and can be assigned to new orders.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      This worker is inactive and cannot be assigned to new
                      orders.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || !formData.name || !currentBranchId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Updating..." : "Update Worker"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/washing-bay/workers/${workerId}`)
                  }
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Worker Name:</span>
                  <span className="font-medium">{formData.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{formData.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-medium">
                    {formData.commissionType === "percentage"
                      ? `${formData.commissionValue}%`
                      : `UGX ${formData.commissionValue.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {!currentBranchId && (
                  <div className="text-red-600 text-xs mt-2">
                    ⚠️ No branch selected. Please select a branch first.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
