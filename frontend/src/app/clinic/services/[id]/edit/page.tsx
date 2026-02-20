"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  FileText,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/src/types/clinic";

const categories = [
  "Consultation",
  "Lab",
  "ANC",
  "Procedure",
  "Vaccination",
  "Other",
];

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { getService, updateService } = useClinic();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fee: 0,
    category: "Consultation" as Service["category"],
    description: "",
    duration: 0,
    isActive: true,
  });

  const serviceId = params.id as string;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);
        const serviceData = await getService(serviceId);
        setService(serviceData);
        setFormData({
          name: serviceData.name,
          fee: serviceData.fee,
          category: serviceData.category,
          description: serviceData.description || "",
          duration: serviceData.duration || 0,
          isActive: serviceData.isActive,
        });
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          title: "Service Not Found",
          description: "The requested service could not be found.",
          variant: "destructive",
        });
        router.push("/clinic/services");
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId, getService, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service) return;

    try {
      setIsSaving(true);

      const updateData: Partial<Service> = {
        name: formData.name,
        fee: formData.fee,
        category: formData.category,
        description: formData.description || undefined,
        duration: formData.duration || undefined,
        isActive: formData.isActive,
      };

      await updateService(service.id, updateData);

      toast({
        title: "Service Updated",
        description: "The service has been successfully updated.",
      });

      router.push(`/clinic/services/${service.id}`);
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Service Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested service could not be found.
            </p>
            <Button onClick={() => router.push("/clinic/services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clinic/services/${service.id}`)}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
            <p className="text-gray-600 mt-1">
              Update the details for {service.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                  <CardTitle className="flex items-center text-blue-900">
                    <FileText className="h-6 w-6 mr-3" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Service Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter service name"
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Category and Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: Service["category"]) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fee" className="text-sm font-medium">
                        Service Fee (UGX) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="fee"
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.fee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fee: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          required
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(formData.fee)}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duration (minutes)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Estimated time required for this service
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the service, procedures involved, and any special requirements..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status and Actions */}
              <Card className="border-0 shadow-sm bg-white sticky top-6">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Activity className="h-6 w-6 mr-3" />
                    Status & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Active Status */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isActive" className="text-sm font-medium">
                        Service Status
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                          }
                        />
                        <span className="text-sm font-medium">
                          {formData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        {formData.isActive
                          ? "This service is currently active and available for use in visits."
                          : "This service is inactive and will not be available for new visits."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          router.push(`/clinic/services/${service.id}`)
                        }
                        className="w-full border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Preview */}
              <Card className="border-0 shadow-sm bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900 text-lg">
                    Service Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-green-800">
                      {formData.name || "Service Name"}
                    </p>
                    <p className="text-sm text-green-600">
                      {formData.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Fee:</span>
                    <span className="font-bold text-green-800">
                      {formatCurrency(formData.fee)}
                    </span>
                  </div>
                  {formData.duration > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Duration:</span>
                      <span className="text-sm text-green-800">
                        {formData.duration} min
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Status:</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        formData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
