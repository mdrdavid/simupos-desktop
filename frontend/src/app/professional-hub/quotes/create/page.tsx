/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useWelding } from "@/context/WeldingContext";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { WeldingJobStatus } from "@/src/types/welding";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function CreateWeldingInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const quoteId = searchParams.get("quoteId");

  const { getWeldingJobById, updateWeldingJob } = useWelding();
  const { createInvoiceFromQuote, createStandaloneInvoice, getQuoteById } =
    useWeldingFinancials();

  const [job, setJob] = useState<any>(null);
  const [sourceQuote, setSourceQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [includeTax, setIncludeTax] = useState(true);

  useEffect(() => {
    if (jobId) {
      const jobData = getWeldingJobById(jobId);
      if (jobData) {
        setJob(jobData);
        setCustomerName(jobData.customerName);
        setCustomerContact(jobData.customerContact);

        // Set default due date (30 days from now)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        setDueDate(defaultDueDate.toISOString().split("T")[0]);

        if (quoteId) {
          // Load from quote
          const quote = getQuoteById(quoteId);
          if (quote) {
            setSourceQuote(quote);
            setLineItems([...quote.lineItems]);
            setNotes(quote.notes || "");
          }
        } else {
          // Initialize with job-based line items
          const initialItems: LineItem[] = [
            {
              id: `service-${Date.now()}`,
              description: `Invoice for: ${jobData.jobType} - ${jobData.description.substring(0, 50)}...`,
              quantity: 1,
              unitPrice: jobData.estimatedCost,
              total: jobData.estimatedCost,
            },
          ];
          setLineItems(initialItems);
        }
      }
    }
  }, [jobId, quoteId, getWeldingJobById, getQuoteById]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = Number(
              (updatedItem.quantity * updatedItem.unitPrice).toFixed(2)
            );
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const calculateTotals = () => {
    const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = includeTax ? subTotal * 0.18 : 0;
    const totalAmount = subTotal + taxAmount;

    return { subTotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) {
      toast.error("Job not found");
      return;
    }

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    if (
      lineItems.some(
        (item) => !item.description || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      toast.success(
        "All line items must have a description, positive quantity, and valid unit price"
      );
      return;
    }

    setIsLoading(true);
    try {
      const issueDateObj = new Date(issueDate);
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;

      let newInvoice;
      if (sourceQuote) {
        newInvoice = await createInvoiceFromQuote(
          sourceQuote,
          issueDateObj,
          dueDateObj,
          includeTax
        );
      } else {
        newInvoice = await createStandaloneInvoice(
          job,
          lineItems,
          issueDateObj,
          dueDateObj,
          notes,
          includeTax
        );
      }

      if (newInvoice) {
        await updateWeldingJob(job.id, {
          activeInvoiceId: newInvoice.id,
          status: WeldingJobStatus.PENDING,
        });

        router.push(`/welding/invoices/${newInvoice.id}`);
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const { subTotal, taxAmount, totalAmount } = calculateTotals();

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
        <Link href={`/welding/jobs/${job.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">
            For Job: {job.jobType} - {job.description.substring(0, 50)}...
            {sourceQuote && ` • From Quote: ${sourceQuote.quoteNumber}`}
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
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={!!sourceQuote}
              />
            </div>
            <div>
              <Label htmlFor="customerContact">Customer Contact</Label>
              <Input
                id="customerContact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="Phone or email"
                required
                disabled={!!sourceQuote}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {!sourceQuote && (
                <Button type="button" variant="outline" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg"
                >
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Service or material description"
                      rows={2}
                      disabled={!!sourceQuote}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      disabled={!!sourceQuote}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "unitPrice",
                          Number(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      disabled={!!sourceQuote}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                      UGX {item.total.toLocaleString()}
                    </div>
                  </div>
                  {!sourceQuote && (
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tax Toggle */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="includeTax"
                checked={includeTax}
                onCheckedChange={(checked) => setIncludeTax(checked as boolean)}
              />
              <Label htmlFor="includeTax">Include Tax (18%)</Label>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {subTotal.toLocaleString()}</span>
                </div>
                {includeTax && (
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span>UGX {taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={issueDate}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes / Payment Terms</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bank details, thank you message, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/welding/jobs/${job.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
