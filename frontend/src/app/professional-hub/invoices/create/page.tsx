/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, CalendarIcon, Plus, X, Save } from "lucide-react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useWelding } from "@/context/WeldingContext";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { WeldingJobStatus } from "@/src/types/welding";
import { toast } from "sonner";

export default function CreateWeldingInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const quoteId = searchParams.get("quoteId");

  const { getWeldingJobById, updateWeldingJob } = useWelding();
  const { getQuoteById, createInvoiceFromQuote, createStandaloneInvoice } =
    useWeldingFinancials();

  const [job, setJob] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 30));
  const [includeTax, setIncludeTax] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (jobId) {
      const weldingJob = getWeldingJobById(jobId);
      if (weldingJob) {
        setJob(weldingJob);
        setCustomerName(weldingJob.customerName);
        setCustomerContact(weldingJob.customerContact);
        setCustomerLocation(weldingJob.customerLocation || "");

        if (!quoteId) {
          // For standalone invoice
          const initialLineItems = [
            {
              id: crypto.randomUUID(),
              description: `Service: ${weldingJob.jobType}`,
              quantity: 1,
              unitPrice: weldingJob.estimatedCost,
              total: weldingJob.estimatedCost,
            },
          ];
          setLineItems(initialLineItems);
        }
      }
    }

    if (quoteId) {
      const quoteData = getQuoteById(quoteId);
      if (quoteData) {
        setQuote(quoteData);
        setCustomerName(quoteData.customerDetails.name);
        setCustomerContact(quoteData.customerDetails.contact);
        setCustomerLocation(quoteData.customerDetails.location || "");
        setLineItems(quoteData.lineItems);
        setNotes(quoteData.notes || "");
      }
    }
  }, [jobId, quoteId, getWeldingJobById, getQuoteById]);

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
      taxRate,
    };
  };

  const { subTotal, taxAmount, totalAmount } = calculateTotals();

  const handleSubmit = async () => {
    if (!job) {
      toast.error("Associated job not found.");
      return;
    }

    if (
      !quoteId &&
      lineItems.some(
        (item) => !item.description || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      toast.success(
        "All line items must have a description, positive quantity, and valid unit price."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let newInvoice;
      if (quote) {
        newInvoice = await createInvoiceFromQuote(
          quote,
          issueDate,
          dueDate,
          includeTax
        );
      } else {
        newInvoice = await createStandaloneInvoice(
          job,
          lineItems,
          issueDate,
          dueDate,
          notes,
          includeTax
        );
      }

      if (newInvoice) {
        await updateWeldingJob(jobId as string, {
          activeInvoiceId: newInvoice.id,
          status: WeldingJobStatus.PENDING,
        });
        router.push(`/professional-hub/jobs/${jobId}?newInvoiceId=${newInvoice.id}`);
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/professional-hub/jobs/${jobId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            {quote
              ? "Create an invoice from quote"
              : "Create a standalone invoice"}
          </p>
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
          {quote && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Creating invoice from Quote #{quote.quoteNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Customer details for this invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={!!quote}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerContact">Contact</Label>
              <Input
                id="customerContact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                disabled={!!quote}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerLocation">Location (Optional)</Label>
            <Input
              id="customerLocation"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              disabled={!!quote}
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
                Services and materials included in this invoice
              </CardDescription>
            </div>
            {!quote && (
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
              {quote
                ? "No items in the source quote."
                : 'No items added yet. Click "Add Item" to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                {!quote && <div className="col-span-1"></div>}
              </div>

              {/* Line Items */}
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-5">
                    {!quote ? (
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
                    {!quote ? (
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
                    {!quote ? (
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
                  {!quote && (
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
                  <span>
                    {includeTax
                      ? `UGX ${taxAmount.toLocaleString()}`
                      : "Not Applicable"}
                  </span>
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

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Additional information for this invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(issueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={(date) => date && setIssueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    disabled={(date) => date < issueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeTax"
              checked={includeTax}
              onCheckedChange={setIncludeTax}
            />
            <Label htmlFor="includeTax">Include Tax (18%)</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Payment Terms</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Payment terms, bank details, thank you message"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Link href={`/professional-hub/jobs/${jobId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || lineItems.length === 0}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Invoice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
