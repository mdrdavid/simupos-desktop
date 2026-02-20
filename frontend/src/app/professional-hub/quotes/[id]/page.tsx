/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  CalendarIcon,
  FileText,
  Trash2,
  Send,
  CheckCircle,
  X,
  Edit,
  Printer,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useWelding } from "@/context/WeldingContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DownloadQuoteButton } from "@/components/professional-hub/DownloadQuoteButton";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { QuoteStatus } from "@/src/types/weldingFinancials";
import { useBusiness } from "@/context/BusinessContext";


export default function WeldingQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const { weldingJobs, getWeldingJobById } = useWelding();
  const {
    quotes,
    getQuoteById,
    updateQuoteStatus,
    updateQuote,
    deleteQuote,
  } = useWeldingFinancials();
  const { currentBusiness } = useBusiness();

  const [quote, setQuote] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [includeTax, setIncludeTax] = useState(true);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<QuoteStatus>(QuoteStatus.DRAFT);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const input = printRef.current;
    if (!input) {
      return;
    }

    const originalStyle = {
      width: input.style.width,
    };

    try {
      // Temporarily apply a fixed width for PDF generation
      input.style.width = "1200px";

      const canvas = await html2canvas(input, {
        background: "#ffffff", // Corrected property
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const pdfHeight = pdfWidth / ratio;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`quote-${quote.quoteNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Restore original styles
      input.style.width = originalStyle.width;
    }
  };

  useEffect(() => {
    const quoteData = getQuoteById(quoteId);
    if (quoteData) {
      setQuote(quoteData);
      setCustomerName(quoteData.customerDetails.name);
      setCustomerContact(quoteData.customerDetails.contact);
      setCustomerLocation(quoteData.customerDetails.location || "");
      setLineItems(quoteData.lineItems || []);
      setNotes(quoteData.notes || "");
      if (quoteData.validUntil) setValidUntil(new Date(quoteData.validUntil));
      setStatus(quoteData.status);

      if (quoteData.weldingJobId) {
        const jobData = getWeldingJobById(quoteData.weldingJobId);
        if (jobData) {
          setJob(jobData);
        }
      } else {
        // Standalone quote, no job associated.
        // Set job to a placeholder to pass the loading check.
        setJob({});
      }
    }
  }, [quoteId, getQuoteById, getWeldingJobById, quotes, weldingJobs]);

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (status === newStatus) return;

    setIsSubmitting(true);
    try {
      await updateQuoteStatus(quoteId, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update quote status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      //   await updateQuote(quoteId, {
      //     customerDetails: {
      //       name: customerName,
      //       contact: customerContact,
      //       location: customerLocation,
      //     },
      //     lineItems,
      //     notes,
      //     validUntil: validUntil,
      //   });

      await updateQuote(quoteId, {
        customerDetails: {
          name: customerName,
          contact: customerContact,
          location: customerLocation,
        },
        lineItems,
        notes,
        validUntil,
      } as any); // Not recommended but works as a last resort
      setIsEditing(false);
      // Refresh quote data
      const updatedQuote = getQuoteById(quoteId);
      if (updatedQuote) setQuote(updatedQuote);
    } catch (error) {
      console.error("Failed to update quote:", error);
      alert("Failed to update quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteQuote(quoteId);
      router.push(`/professional-hub/jobs/${job.id}`);
    } catch (error) {
      console.error("Failed to delete quote:", error);
      alert("Failed to delete quote");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLineItemUpdate = (id: string, updates: Partial<any>) => {
    setLineItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const quantity =
            updates.quantity !== undefined
              ? Number(updates.quantity) || 0
              : item.quantity;
          const unitPrice =
            updates.unitPrice !== undefined
              ? Number(updates.unitPrice) || 0
              : item.unitPrice;
          return {
            ...item,
            ...updates,
            quantity,
            unitPrice,
            total: Math.round(quantity * unitPrice),
          };
        }
        return item;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prevItems) => [
      ...prevItems,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotals = () => {
    const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.18;
    const taxAmount = includeTax ? Math.round(subTotal * taxRate) : 0;
    const totalAmount = subTotal + taxAmount;

    return {
      subTotal,
      taxAmount,
      totalAmount,
      taxRate: includeTax ? taxRate : 0,
    };
  };

  const { subTotal, taxAmount, totalAmount } = calculateTotals();

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return "bg-gray-500";
      case QuoteStatus.SENT:
        return "bg-blue-500";
      case QuoteStatus.ACCEPTED:
        return "bg-green-500";
      case QuoteStatus.DECLINED:
        return "bg-red-500";
      case QuoteStatus.INVOICED:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!quote || !job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .printable {
            background: white !important;
          }
          .quote-logo {
            max-width: 80px !important;
            max-height: 80px !important;
            object-fit: contain !important;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            href={
              job?.id
                ? `/professional-hub/jobs/${job.id}`
                : "/professional-hub/quotes"
            }
          >
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Quote Details
              </h1>
              <Badge
                variant="secondary"
                className={`${getStatusColor(status)} text-white`}
              >
                {status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Quote #{quote.quoteNumber} • Created{" "}
              {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <div className="flex items-center space-x-2 mr-2">
                <Checkbox
                  id="include-tax"
                  checked={includeTax}
                  onCheckedChange={(checked) => setIncludeTax(Boolean(checked))}
                />
                <Label htmlFor="include-tax">Include Tax</Label>
              </div>
              <DownloadQuoteButton onClick={handleDownload} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this quote.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={printRef} className="printable">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-bold">Quote</h2>
          <div className="text-right">
            <p className="font-semibold">Quote #{quote.quoteNumber}</p>
            <p className="text-sm text-muted-foreground">
              Date: {new Date(quote.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">quote status: {status}</p>
          </div>
        </div>
        <Card className="mb-6">
          <CardHeader>
            {currentBusiness?.logo && (
              <div className="mb-4 flex justify-start">
                <img 
                  src={currentBusiness.logo} 
                  alt="Business Logo" 
                  className="max-w-[80px] max-h-[80px] object-contain rounded-lg quote-logo"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardTitle>{currentBusiness?.name}</CardTitle>
            <CardDescription>
              {currentBusiness?.address} <br />
              {currentBusiness?.email} | {currentBusiness?.phone}
            </CardDescription>
          </CardHeader>
        </Card>
        {/* Job Info */}
        {job?.id && (
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>
                Details of the associated welding job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Job Type
                  </p>
                  <p className="text-lg font-medium">{job.jobType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Job ID
                  </p>
                  <p className="text-lg font-medium">
                    {job.id.substring(0, 8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Customer details for this quote</CardDescription>
        </CardHeader>
        {isEditing ? (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact">Contact</Label>
                <Input
                  id="customerContact"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerLocation">Location (Optional)</Label>
              <Input
                id="customerLocation"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
              />
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-base">
            <div className="flex gap-2">
              <p className="font-semibold w-32">Customer Name:</p>
              <p>{customerName}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold w-32">Contact:</p>
              <p>{customerContact}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold w-32">Location:</p>
              <p>{customerLocation || "N/A"}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Services and materials included in this quote
              </CardDescription>
            </div>
            {isEditing && (
              <Button variant="outline" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No items in this quote.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Row - visible on md screens and up */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 font-medium text-sm text-muted-foreground px-2">
                <div className="md:col-span-5">Description</div>
                <div className="md:col-span-2 text-center">Quantity</div>
                <div className="md:col-span-2 text-right">Unit Price</div>
                <div className="md:col-span-2 text-right">Total</div>
                {isEditing && <div className="md:col-span-1"></div>}
              </div>

              {/* Line Items */}
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border-b md:border-none pb-4 md:pb-0 mb-4 md:mb-2"
                >
                  {/* Mobile view */}
                  <div className="md:hidden col-span-1 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="col-span-2">
                      {isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemUpdate(item.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Item description"
                          className="font-semibold"
                        />
                      ) : (
                        <p className="font-semibold">{item.description}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Qty</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.quantity.toString()}
                          onChange={(e) =>
                            handleLineItemUpdate(item.id, {
                              quantity: Number.parseFloat(e.target.value),
                            })
                          }
                          placeholder="Qty"
                          className="w-full mt-1"
                          min="0"
                        />
                      ) : (
                        <p>{item.quantity}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Unit Price
                      </span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.unitPrice.toString()}
                          onChange={(e) =>
                            handleLineItemUpdate(item.id, {
                              unitPrice: Number.parseFloat(e.target.value),
                            })
                          }
                          placeholder="Price"
                          className="w-full mt-1 text-right"
                          min="0"
                        />
                      ) : (
                        <p className="text-right">
                          {item.unitPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">
                        Total
                      </span>
                      <p className="font-medium text-right">
                        {item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden md:col-span-5 md:block">
                    {isEditing ? (
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemUpdate(item.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Item description"
                      />
                    ) : (
                      <p className="px-3 py-2">{item.description}</p>
                    )}
                  </div>
                  <div className="hidden md:col-span-2 md:block">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={item.quantity.toString()}
                        onChange={(e) =>
                          handleLineItemUpdate(item.id, {
                            quantity: Number.parseFloat(e.target.value),
                          })
                        }
                        placeholder="Qty"
                        className="text-center"
                        min="0"
                      />
                    ) : (
                      <p className="text-center">{item.quantity}</p>
                    )}
                  </div>
                  <div className="hidden md:col-span-2 md:block">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={item.unitPrice.toString()}
                        onChange={(e) =>
                          handleLineItemUpdate(item.id, {
                            unitPrice: Number.parseFloat(e.target.value),
                          })
                        }
                        placeholder="Price"
                        className="text-right"
                        min="0"
                      />
                    ) : (
                      <p className="text-right">
                        {item.unitPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="hidden md:col-span-2 text-right font-medium md:block">
                    {item.total.toLocaleString()}
                  </div>
                  {isEditing && (
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Totals */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{subTotal.toLocaleString()}</span>
                </div>
                {includeTax && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Tax (18%):</span>
                    <span> {taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base mt-2">
                  <span>Total:</span>
                  <span>{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription>
            Additional information for this quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validUntil && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={(date) => date && setValidUntil(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-base">
                {validUntil
                  ? format(validUntil, "PPP")
                  : "No expiration date set"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Terms</Label>
            {isEditing ? (
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Payment terms, scope details, validity conditions"
                rows={4}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                {notes || "No notes provided"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Quote Status</Label>
            {isEditing ? (
              <Select
                value={status}
                onValueChange={(newStatus) =>
                  handleStatusChange(newStatus as QuoteStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QuoteStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-base font-medium pt-2">{status}</p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Quick Actions */}
      {!isEditing && (
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions for this quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleStatusChange(QuoteStatus.SENT)}
                disabled={
                  status === QuoteStatus.SENT || status === QuoteStatus.INVOICED
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleStatusChange(QuoteStatus.ACCEPTED)}
                disabled={
                  status === QuoteStatus.ACCEPTED ||
                  status === QuoteStatus.INVOICED
                }
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Accepted
              </Button>
              {status === QuoteStatus.ACCEPTED && (
                <Link
                  href={
                    job?.id
                      ? `/professional-hub/invoices/create?jobId=${job.id}&quoteId=${quoteId}`
                      : `/professional-hub/invoices/create?quoteId=${quoteId}`
                  }
                  className="flex-1"
                >
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
