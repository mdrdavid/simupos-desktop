/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCabStore,
  CabStoreTransactionType,
  CabStoreTransactionCategory,
} from "@/context/CabStoreContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";

export default function NewCabStoreRecord() {
  const router = useRouter();
  const { toast } = useToast();
  const { createRecord, loading } = useCabStore();
  const { currentBranchId } = useAuth();

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    type: CabStoreTransactionType.DEPOSIT,
    amount: "",
    details: "",
    category: CabStoreTransactionCategory.BANK,
    reference: "",
    notes: "",
  });

  const [formattedAmount, setFormattedAmount] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const categoryOptions = Object.values(CabStoreTransactionCategory);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    const formattedValue = formatNumberWithCommas(value);

    setFormData((prev) => ({ ...prev, amount: numericValue.toString() }));
    setFormattedAmount(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBranchId) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category",
        variant: "destructive",
      });
      return;
    }

    try {
      const recordData = {
        ...formData,
        amount: parseFloat(formData.amount),
        branchId: currentBranchId,
      };

      await createRecord(recordData);

      toast({
        title: "Success",
        description: "Record created successfully",
        className: "bg-green-50 border-green-200",
      });

      router.push("/store-financials/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create record",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    handleInputChange("category", value);
    setShowCategorySuggestions(false);
  };

  const filteredCategories = categoryOptions.filter((category) =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              New Transaction
            </h1>
            <p className="text-gray-600">Record a new deposit or withdrawal</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="font-medium text-gray-700">
                    Transaction Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: CabStoreTransactionType) =>
                      handleInputChange("type", value)
                    }
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CabStoreTransactionType.DEPOSIT}>
                        Deposit
                      </SelectItem>
                      <SelectItem value={CabStoreTransactionType.WITHDRAWAL}>
                        Withdrawal
                      </SelectItem>
                      <SelectItem
                        value={CabStoreTransactionType.BALANCE_FORWARD}
                      >
                        Balance Forward
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Label
                    htmlFor="category"
                    className="font-medium text-gray-700"
                  >
                    Category *
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    onFocus={() => setShowCategorySuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCategorySuggestions(false), 200)
                    }
                    placeholder="Type or select a category"
                    className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white"
                    required
                  />

                  {/* Category Suggestions */}
                  {showCategorySuggestions && filteredCategories.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="transactionDate"
                    className="font-medium text-gray-700"
                  >
                    Date *
                  </Label>
                  <Input
                    type="date"
                    id="transactionDate"
                    value={formData.transactionDate}
                    onChange={(e) =>
                      handleInputChange("transactionDate", e.target.value)
                    }
                    className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="font-medium text-gray-700">
                    Amount (UGX) *
                  </Label>
                  <Input
                    type="text"
                    id="amount"
                    value={formattedAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white"
                    required
                  />
                </div>
              </div>

              {/* Reference and Details */}
              <div>
                <Label
                  htmlFor="reference"
                  className="font-medium text-gray-700"
                >
                  Reference
                </Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    handleInputChange("reference", e.target.value)
                  }
                  placeholder="e.g., BANK Mathew, Labour, etc."
                  className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <Label htmlFor="details" className="font-medium text-gray-700">
                  Details
                </Label>
                <Input
                  id="details"
                  value={formData.details}
                  onChange={(e) => handleInputChange("details", e.target.value)}
                  placeholder="Transaction description"
                  className="h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes..."
                  className="min-h-24 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Creating..." : "Create Record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
