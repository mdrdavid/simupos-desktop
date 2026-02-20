/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useBusinessGrowth } from "@/src/hooks/useBusinessGrowth";
import { CapitalTransaction } from "@/src/types/business-growth";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";

export const CapitalTransactionsTable = () => {
  const { getCapitalTransactions, loading, error } = useBusinessGrowth();
  const [data, setData] = useState<{
    transactions: CapitalTransaction[];
    pagination: any;
  } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      const result = await getCapitalTransactions({ page, limit: 10 });
      if (result) {
        setData(result);
      }
    };
    fetchTransactions();
  }, [page, getCapitalTransactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Capital Transactions</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="min-w-[100px]">{formatDate(tx.date)}</TableCell>
                <TableCell>
                  <span
                    className={`capitalize px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      tx.type === "injection"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tx.type}
                  </span>
                </TableCell>
                <TableCell className="min-w-[120px]">{formatCurrency(tx.amount)}</TableCell>
                <TableCell className="min-w-[200px]">{tx.source || tx.reason || tx.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {data?.pagination.pages || 1}
        </span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.pagination.pages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};