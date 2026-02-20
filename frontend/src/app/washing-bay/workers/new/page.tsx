"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, User, DollarSign, Save, UserPlus } from "lucide-react";
import { useWashingBay } from "@/context/WashingBayContext";
import { useAuth } from "@/context/AuthContext";

export default function NewWorkerPage() {
  const router = useRouter();
  const { createWorker, loading } = useWashingBay();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    phone: "",
    email: "",
    commissionType: "percentage" as "percentage" | "fixed",
    commissionValue: 15,
    createUserAccount: true,
  });

  const handleInputChange = (
    field: string,
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
      console.error("No branch selected");
      return;
    }

    try {
      // Include branchId in the request data
      const workerData = {
        ...formData,
        branchId: currentBranchId,
      };

      await createWorker(workerData);
      router.push("/washing-bay/workers");
    } catch (error) {
      console.error("Failed to create worker:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Worker</h1>
          <p className="text-gray-600 mt-1">
            Register a new washing bay staff member
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
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
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
            {/* System Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  System Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="createUserAccount"
                    checked={formData.createUserAccount}
                    onCheckedChange={(checked) =>
                      handleInputChange("createUserAccount", checked)
                    }
                  />
                  <Label htmlFor="createUserAccount">
                    Create system user account
                  </Label>
                </div>

                {formData.createUserAccount && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      A user account will be created with default credentials.
                      The worker will be able to log in and access the system.
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Requires phone number to be set
                    </p>
                  </div>
                )}

                {!formData.createUserAccount && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      No user account will be created. Worker will only appear
                      in records.
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
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.phone ||
                    !currentBranchId
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Add Worker"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
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
                  <span className="text-gray-600">User Account:</span>
                  <span className="font-medium">
                    {formData.createUserAccount ? "Yes" : "No"}
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
