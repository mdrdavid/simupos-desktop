"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddMaterialToJobDialog } from "@/components/welding/AddMaterialToJobDialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  FileText,
  Receipt,
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  Package,
  CheckCircle,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWelding } from "@/context/WeldingContext";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { WeldingJobStatus } from "@/src/types/welding";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const getStatusColor = (status: WeldingJobStatus) => {
  switch (status) {
    case "Pending":
      return "bg-orange-100 text-orange-800";
    case "Quoted":
      return "bg-blue-100 text-blue-800";
    case "Approved":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Awaiting Materials":
      return "bg-purple-100 text-purple-800";
    case "Ready for Painting":
      return "bg-teal-100 text-teal-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Delivered":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function WeldingJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const {
    getWeldingJobById,
    updateWeldingJob,
    removeMaterialFromJob,
    updateJobMaterial,
    loadingJobs,
  } = useWelding();
  const { getQuoteById, getInvoiceById } = useWeldingFinancials();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const job = getWeldingJobById(jobId);
  const activeQuote = job?.activeQuoteId
    ? getQuoteById(job.activeQuoteId)
    : null;
  const activeInvoice = job?.activeInvoiceId
    ? getInvoiceById(job.activeInvoiceId)
    : null;

  if (loadingJobs) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Job not found
            </h3>
            <p className="text-gray-600 mb-4">
              The workshop job you&quot;re looking for doesn&quot;t exist.
            </p>
            <Link href="/professional-hub/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  const totalMaterialCost =
    job.materialsNeeded?.reduce((acc, material) => {
      // Check if costPerUnit exists and is a valid number
      const costPerUnit = material.costPerUnit || 0;
      return acc + costPerUnit * material.quantity;
    }, 0) || 0;

  const materialsPerPage = 5;

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials =
    job.materialsNeeded?.slice(indexOfFirstMaterial, indexOfLastMaterial) || [];
  const totalPages = job.materialsNeeded
    ? Math.ceil(job.materialsNeeded.length / materialsPerPage)
    : 0;

  const handleStatusUpdate = async (newStatus: WeldingJobStatus) => {
    if (window.confirm(`Change job status to "${newStatus}"?`)) {
      setIsUpdatingStatus(true);
      try {
        await updateWeldingJob(job.id, { status: newStatus });
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Failed to update job status");
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm("Are you sure you want to remove this material?")) {
      removeMaterialFromJob(materialId);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/professional-hub/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{job.jobType}</h1>
            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
          </div>
          <p className="text-gray-600 mt-2">Job ID: {job.id.substring(0, 8)}</p>
        </div>
        <Link href={`/professional-hub/jobs/${job.id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{job.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{job.customerContact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">
                      {job.customerLocation || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date</p>
                    <p className="font-medium">
                      {new Date(job.requiredDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900">{job.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-xl font-semibold text-gray-900">
                      UGX {job.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Total Material Cost</p>
                    <p className="text-xl font-semibold text-green-600">
                      UGX {totalMaterialCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Needed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Materials Needed</CardTitle>
              <AddMaterialToJobDialog jobId={job.id}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </AddMaterialToJobDialog>
            </CardHeader>
            <CardContent>
              {currentMaterials.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {currentMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-gray-600">
                              {material.quantity} {material.unit}
                              {material.isCustom ? (
                                <Badge variant="outline" className="ml-2">
                                  Custom
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="ml-2">
                                  From Stock
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {material.costPerUnit && (
                            <p className="text-sm text-gray-800 font-medium">
                              UGX{" "}
                              {(
                                material.costPerUnit * material.quantity
                              ).toLocaleString()}
                            </p>
                          )}
                          <AddMaterialToJobDialog
                            jobId={job.id}
                            initialData={material}
                            onUpdate={updateJobMaterial}
                          >
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </AddMaterialToJobDialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-600"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.max(prev - 1, 1));
                            }}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={i + 1 === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              );
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No materials added to this job yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Artisans */}
          {job.assignments && job.assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Artisans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-gray-400" />
                        <div>
                          <p className="font-medium">{`${assignment.user.firstName} ${assignment.user.lastName}`}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.user.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          UGX{" "}
                          {parseFloat(assignment.agreedWage).toLocaleString()}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Job Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(WeldingJobStatus).map((status) => (
                  <Button
                    key={status}
                    variant={job.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={job.status === status || isUpdatingStatus}
                    className="text-xs"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated Cost</span>
                <span className="font-medium">
                  UGX{" "}
                  {job.estimatedCost?.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-medium">
                  UGX{" "}
                  {job.totalExpenses?.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Estimated Profit
                </span>
                <span className="font-medium text-green-600">
                  UGX{" "}
                  {job.estimatedProfit?.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="font-medium text-green-600">
                  {job.profitMargin?.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!activeQuote && job.status === "Pending" && (
                <Link href={`/professional-hub/quotes/create?jobId=${job.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Quote
                  </Button>
                </Link>
              )}

              {activeQuote && (
                <Link href={`/professional-hub/quotes/${activeQuote.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Quote
                  </Button>
                </Link>
              )}

              {!activeInvoice &&
                (job.status === "Approved" || job.status === "In Progress") && (
                  <Link
                    href={`/professional-hub/invoices/create?jobId=${job.id}`}
                  >
                    <Button className="w-full bg-transparent" variant="outline">
                      <Receipt className="w-4 h-4 mr-2" />
                      Create Invoice
                    </Button>
                  </Link>
                )}

              {activeInvoice && (
                <Link href={`/professional-hub/invoices/${activeInvoice.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoice
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          {(activeQuote || activeInvoice) && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeQuote && (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quote Total</span>
                      <span className="font-medium">
                        UGX {activeQuote.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="outline">{activeQuote.status}</Badge>
                    </div>
                  </div>
                )}

                {activeInvoice && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Invoice Total
                      </span>
                      <span className="font-medium">
                        UGX {activeInvoice.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount Paid</span>
                      <span className="font-medium text-green-600">
                        UGX {activeInvoice.amountPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance Due</span>
                      <span
                        className={`font-medium ${activeInvoice.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        UGX {activeInvoice.balanceDue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Payment Status
                      </span>
                      <Badge variant="outline">
                        {activeInvoice.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Job Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Job Created</p>
                    <p className="text-xs text-gray-600">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {job.status !== "Pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Status: {job.status}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {job.deliveryConfirmed && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-gray-600">
                        Job completed and delivered
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Feedback */}
          {job.customerRating && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= job.customerRating!
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({job.customerRating}/5)
                    </span>
                  </div>
                  {job.customerFeedback && (
                    <p className="text-sm text-gray-700">
                      {job.customerFeedback}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
