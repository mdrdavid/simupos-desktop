/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { QuoteStatus } from "@/src/types/weldingFinancials";

export default function WeldingQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const { getWeldingJobById } = useWelding();
  const { getQuoteById, updateQuoteStatus, updateQuote, deleteQuote } =
    useWeldingFinancials();

  const [quote, setQuote] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<QuoteStatus>(QuoteStatus.DRAFT);

  useEffect(() => {
    const quoteData = getQuoteById(quoteId);
    if (quoteData) {
      setQuote(quoteData);
      setCustomerName(quoteData.customerDetails.name);
      setCustomerContact(quoteData.customerDetails.contact);
      setCustomerLocation(quoteData.customerDetails.location || "");
      setLineItems(quoteData.lineItems);
      setNotes(quoteData.notes || "");
      if (quoteData.validUntil) setValidUntil(new Date(quoteData.validUntil));
      setStatus(quoteData.status);

      const jobData = getWeldingJobById(quoteData.weldingJobId);
      if (jobData) {
        setJob(jobData);
      }
    }
  }, [quoteId, getQuoteById, getWeldingJobById]);

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
      router.push(`/welding/jobs/${job.id}`);
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
    const taxAmount = Math.round(subTotal * taxRate);
    const totalAmount = subTotal + taxAmount;

    return {
      subTotal,
      taxAmount,
      totalAmount,
      taxRate,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/welding/jobs/${job.id}`}>
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
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
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

      {/* Job Info */}
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
              <p className="text-lg font-medium">{job.id.substring(0, 8)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Customer details for this quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerContact">Contact</Label>
              <Input
                id="customerContact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerLocation">Location (Optional)</Label>
            <Input
              id="customerLocation"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
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
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                {isEditing && <div className="col-span-1"></div>}
              </div>

              {/* Line Items */}
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-5">
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
                  <div className="col-span-2">
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
                  <div className="col-span-2">
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
                        UGX {item.unitPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    UGX {item.total.toLocaleString()}
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
                  <span>UGX {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Tax (18%):</span>
                  <span>UGX {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-base mt-2">
                  <span>Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
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
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={isEditing}
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
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {!isEditing && (
        <Card>
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
                  href={`/welding/invoices/create?jobId=${job.id}&quoteId=${quoteId}`}
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
