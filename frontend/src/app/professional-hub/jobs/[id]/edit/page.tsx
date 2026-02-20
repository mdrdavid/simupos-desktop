/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CalendarIcon, Plus, X, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useWelding } from "@/context/WeldingContext";
import { WeldingJobStatus, type WeldingMaterial } from "@/src/types/weldingJob";

export default function EditWeldingJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { getWeldingJobById, updateWeldingJob, deleteWeldingJob } =
    useWelding();
  const job = getWeldingJobById(jobId);

  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    customerLocation: "",
    jobType: "",
    description: "",
    estimatedCost: "",
    status: WeldingJobStatus.PENDING,
    assignedArtisans: [] as string[],
  });

  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState<Date>();
  const [materialsNeeded, setMaterialsNeeded] = useState<WeldingMaterial[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        customerName: job.customerName,
        customerContact: job.customerContact,
        customerLocation: job.customerLocation || "",
        jobType: job.jobType,
        description: job.description,
        estimatedCost: job.estimatedCost.toString(),
        status: job.status,
        assignedArtisans: (job.assignedArtisans || []).map((a: any) =>
          typeof a === "string" ? a : a.artisanId
        ),
      });
      setRequiredDeliveryDate(new Date(job.requiredDeliveryDate));
      setMaterialsNeeded(job.materialsNeeded || []);
    }
  }, [job]);

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/professional-hub/jobs">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Not Found</h1>
            <p className="text-muted-foreground">
              The requested welding job could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addMaterial = () => {
    const newMaterial: WeldingMaterial = {
      id: Date.now().toString(),
      name: "",
      quantity: 0,
      unit: "",
      costPerUnit: 0,
      isCustom: true,
    };
    setMaterialsNeeded((prev) => [...prev, newMaterial]);
  };

  const updateMaterial = (
    id: string,
    field: keyof WeldingMaterial,
    value: any
  ) => {
    setMaterialsNeeded((prev) =>
      prev.map((material) =>
        material.id === id ? { ...material, [field]: value } : material
      )
    );
  };

  const removeMaterial = (id: string) => {
    setMaterialsNeeded((prev) => prev.filter((material) => material.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requiredDeliveryDate) {
      alert("Please select a delivery date");
      return;
    }

    setIsSubmitting(true);

    try {
      const updates = {
        ...formData,
        estimatedCost: Number.parseFloat(formData.estimatedCost) || 0,
        requiredDeliveryDate: requiredDeliveryDate.toISOString(),
        materialsNeeded: materialsNeeded.map((material) => ({
          ...material,
          weldingJobId: jobId,
          branchId: job.branchId ?? "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        status: formData.status as WeldingJobStatus,
        assignedArtisans: formData.assignedArtisans.map((artisanId) => ({
          artisanId,
        })),
      };

      await updateWeldingJob(jobId, updates);
      router.push(`/professional-hub/jobs/${jobId}`);
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update welding job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteWeldingJob(jobId);
      router.push("/professional-hub/jobs");
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete welding job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/professional-hub/jobs/${jobId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Work Order
            </h1>
            <p className="text-muted-foreground">
              Modify job details and specifications • Job ID:{" "}
              {jobId.substring(0, 8)}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Job
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Update customer details for this welding job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact">Contact *</Label>
                <Input
                  id="customerContact"
                  value={formData.customerContact}
                  onChange={(e) =>
                    handleInputChange("customerContact", e.target.value)
                  }
                  placeholder="Phone or email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerLocation">Location</Label>
              <Input
                id="customerLocation"
                value={formData.customerLocation}
                onChange={(e) =>
                  handleInputChange("customerLocation", e.target.value)
                }
                placeholder="Customer location (optional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Update job specifications and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Input
                  id="jobType"
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  placeholder="e.g., Gate, Grill, Door Repair"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (UGX) *</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    handleInputChange("estimatedCost", e.target.value)
                  }
                  placeholder="Enter estimated cost"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description/Specifications *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Include measurements, specific requirements, and any special instructions"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required Delivery Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !requiredDeliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {requiredDeliveryDate
                        ? format(requiredDeliveryDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={requiredDeliveryDate}
                      onSelect={setRequiredDeliveryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Job Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WeldingJobStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Needed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Materials Needed</CardTitle>
                <CardDescription>
                  Update materials required for this job
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addMaterial}>
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {materialsNeeded.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No materials added yet. Click &quot;Add Material&quot; to get
                started.
              </p>
            ) : (
              <div className="space-y-4">
                {materialsNeeded.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Material Name
                        </Label>
                        <Input
                          placeholder="Material name"
                          value={material.name}
                          onChange={(e) =>
                            updateMaterial(material.id, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={material.quantity || ""}
                          onChange={(e) =>
                            updateMaterial(
                              material.id,
                              "quantity",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Unit
                        </Label>
                        <Input
                          placeholder="Unit (e.g., pieces, kg)"
                          value={material.unit}
                          onChange={(e) =>
                            updateMaterial(material.id, "unit", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Cost per Unit
                        </Label>
                        <Input
                          type="number"
                          placeholder="Cost per unit"
                          value={material.costPerUnit || ""}
                          onChange={(e) =>
                            updateMaterial(
                              material.id,
                              "costPerUnit",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job History */}
        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
            <CardDescription>Timeline of changes and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Job Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()} at{" "}
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {job.updatedAt !== job.createdAt && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(job.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Current Status: {job.status}
                  </p>
                  <p className="text-xs text-orange-600">
                    Status can be updated above
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link href={`/professional-hub/jobs/${jobId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Work Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
