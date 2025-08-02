"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWelding } from "@/context/WeldingContext";
import type { WeldingMaterial } from "@/src/types/welding";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CreateWeldingJobPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, currentBranchId } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addWeldingJob, materialStock } = useWelding();

  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    customerLocation: "",
    jobType: "",
    description: "",
    estimatedCost: "",
    requiredDeliveryDate: "",
    branchId: "",
  });
  const [materialsNeeded, setMaterialsNeeded] = useState<WeldingMaterial[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateMaterial = (id: string, updates: Partial<WeldingMaterial>) => {
    setMaterialsNeeded((prev) =>
      prev.map((material) =>
        material.id === id ? { ...material, ...updates } : material
      )
    );
  };

  const removeMaterial = (id: string) => {
    setMaterialsNeeded((prev) => prev.filter((material) => material.id !== id));
  };
  // Add this check at the start of handleSubmit
  if (!currentBranchId) {
      toast.error("You must be assigned to a branch to create jobs");
    return;
  }
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBranchId) {
      toast.error("You must be assigned to a branch to create jobs");
      return;
    }

    if (
      !formData.customerName ||
      !formData.customerContact ||
      !formData.jobType ||
      !formData.description ||
      !formData.estimatedCost ||
      !formData.requiredDeliveryDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        estimatedCost: Number.parseFloat(formData.estimatedCost),
        materialsNeeded,
        assignedArtisans: [],
        branchId: currentBranchId,
      };

      const newJob = await addWeldingJob(jobData);
      if (newJob) {
        toast.success("Job created successfully!");
        router.push(`/professional-hub/jobs/${newJob.id}`);
      }
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to create welding job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/professional-hub/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Work Order
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new welding job to the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
                <Label htmlFor="customerContact">Customer Contact *</Label>
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
            <div>
              <Label htmlFor="customerLocation">Customer Location</Label>
              <Input
                id="customerLocation"
                value={formData.customerLocation}
                onChange={(e) =>
                  handleInputChange("customerLocation", e.target.value)
                }
                placeholder="Enter location (optional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobType">Job Type *</Label>
              <Input
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange("jobType", e.target.value)}
                placeholder="e.g., Gate, Grill, Door Repair, Consulting"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description/Specifications *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Include measurements, specific requirements"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
                <Label htmlFor="requiredDeliveryDate">
                  Required Delivery Date *
                </Label>
                <Input
                  id="requiredDeliveryDate"
                  type="date"
                  value={formData.requiredDeliveryDate}
                  onChange={(e) =>
                    handleInputChange("requiredDeliveryDate", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Needed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Materials Needed</CardTitle>
              <Button type="button" onClick={addMaterial} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {materialsNeeded.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
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
                      <Input
                        placeholder="Material name"
                        value={material.name}
                        onChange={(e) =>
                          updateMaterial(material.id, { name: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={material.quantity || ""}
                        onChange={(e) =>
                          updateMaterial(material.id, {
                            quantity: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        placeholder="Unit (kg, meters, pieces)"
                        value={material.unit}
                        onChange={(e) =>
                          updateMaterial(material.id, { unit: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Cost per unit"
                        value={material.costPerUnit || ""}
                        onChange={(e) =>
                          updateMaterial(material.id, {
                            costPerUnit: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/welding/jobs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Job
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
