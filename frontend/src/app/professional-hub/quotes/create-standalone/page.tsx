/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { toast } from "sonner";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { CustomerSnapshot } from "@/src/types/weldingFinancials";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function CreateStandaloneWeldingQuotePage() {
  const router = useRouter();
  const { createStandaloneQuote } = useWeldingFinancials();

  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formattedLineItems, setFormattedLineItems] = useState<{
    [key: string]: { quantity: string; unitPrice: string };
  }>({});
  const [notes, setNotes] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validUntilDate, setValidUntilDate] = useState("");

  useEffect(() => {
    // Set default due date (30 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setValidUntilDate(defaultDueDate.toISOString().split("T")[0]);
  }, []);

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

  const updateNumericLineItem = (
    id: string,
    field: "quantity" | "unitPrice",
    value: string
  ) => {
    const numericValue = parseFormattedNumber(value);
    const formatted = formatNumberWithCommas(value);

    setFormattedLineItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: formatted },
    }));

    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: numericValue };
          updatedItem.total = Number(
            (updatedItem.quantity * updatedItem.unitPrice).toFixed(2)
          );
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
    const taxAmount = subTotal * 0.18;
    const totalAmount = subTotal + taxAmount;

    return { subTotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerContact) {
      toast.error("Customer Name and Contact are required.");
      return;
    }

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    if (
      lineItems.some(
        (item) => !item.description || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      toast.error(
        "All line items must have a description, positive quantity, and valid unit price."
      );
      return;
    }

    setIsLoading(true);
    try {
      const validUntilDateObj = validUntilDate
        ? new Date(validUntilDate)
        : undefined;

      const customerDetails: CustomerSnapshot = {
        name: customerName,
        contact: customerContact,
        location: customerLocation,
      };

      const newQuote = await createStandaloneQuote(
        customerDetails,
        lineItems,
        notes,
        validUntilDateObj
      );

      if (newQuote) {
        toast.success("Quote created successfully!");
        router.push(`/professional-hub/quotes/${newQuote.id}`);
      }
    } catch (error) {
      console.error("Failed to create quote:", error);
      toast.error("Failed to create quote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { subTotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/professional-hub/quotes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Standalone Quote</h1>
          <p className="text-muted-foreground">
            Create a new quote without an associated job.
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
                placeholder="Enter customer's name"
                required
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
              />
            </div>
            <div>
              <Label htmlFor="customerLocation">Location (Optional)</Label>
              <Input
                id="customerLocation"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                placeholder="e.g., Kampala, Uganda"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item) => (
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
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="text"
                      value={
                        formattedLineItems[item.id]?.quantity ||
                        item.quantity.toString()
                      }
                      onChange={(e) =>
                        updateNumericLineItem(
                          item.id,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="text"
                      value={
                        formattedLineItems[item.id]?.unitPrice ||
                        item.unitPrice.toString()
                      }
                      onChange={(e) =>
                        updateNumericLineItem(
                          item.id,
                          "unitPrice",
                          e.target.value
                        )
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                      UGX {item.total.toLocaleString()}
                    </div>
                  </div>
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
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>UGX {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
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
                <Label htmlFor="validUntilDate">Valid Until (Optional)</Label>
                <Input
                  id="validUntilDate"
                  type="date"
                  value={validUntilDate}
                  onChange={(e) => setValidUntilDate(e.target.value)}
                  min={issueDate}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes / Terms</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Validity, payment terms, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/professional-hub/quotes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Quote"}
          </Button>
        </div>
      </form>
    </div>
  );
}
