/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useData, Transaction } from "@/context/DataContext";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Loader2,
  Search,
  Calendar
} from "lucide-react";
import { generateSalesLogPDF } from "@/src/utils/exportUtils";

export default function SalesLogPage() {
  const { getTransactions, loading } = useData();
  const { currentBranch } = useBranch();
  const { businessData } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  useEffect(() => {
    const fetchMonthData = async (monthStr: string) => {
      if (!currentBranch) return;

      const [year, month] = monthStr.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      try {
        const data = await getTransactions({
          startDate,
          endDate,
          limit: 1000, // Get more for the report
        });
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchMonthData(selectedMonth);
  }, [selectedMonth, currentBranch, getTransactions]);

  const handleDownloadPDF = () => {
    const monthName = new Date(selectedMonth + "-01").toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );
    generateSalesLogPDF(transactions, monthName, businessData, currentBranch);
  };

  const totalRevenue = transactions.reduce((sum, tx) => {
    const amount = Number(
      tx.amount ||
        (tx as any).total ||
        (tx as any).totalAmount ||
        (tx as any).total_amount ||
        (tx as any).grandTotal ||
        0
    );
    return sum + amount;
  }, 0);

  const totalQty = transactions.reduce((sum, tx) => {
    const itemsQty =
      tx.items?.reduce(
        (s: number, i) =>
          s + (Number(i.quantity || (i as any).qty || (i as any).qtySold) || 0),
        0
      ) || 0;
    return sum + (itemsQty > 0 ? itemsQty : 1);
  }, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Monthly Sales Log Book
          </h1>
          <p className="text-gray-600">View and export detailed sales logs for your business</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 h-10 w-48 border-gray-200 focus:ring-blue-500 bg-white"
            />
          </div>
          <Button
            onClick={handleDownloadPDF}
            disabled={loading || transactions.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-0 shadow-sm border-b-4 border-b-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">UGX {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm border-b-4 border-b-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalQty.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm border-b-4 border-b-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{transactions.length.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Item(s)</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Payment Method</th>
                  <th className="px-6 py-4 font-bold">Seller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="text-gray-500 font-medium">Fetching sales records...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Search className="h-12 w-12 opacity-20" />
                        <span className="font-medium">No sales recorded for this period</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {tx.items && tx.items.length > 0 ? (
                            tx.items.map((item, i) => (
                              <div
                                key={i}
                                className="text-gray-900 font-medium line-clamp-1"
                              >
                                {(item as any).name || (item as any).itemName}{" "}
                                <span className="text-gray-400 font-normal ml-1">
                                  x
                                  {(item as any).quantity ||
                                    (item as any).qty ||
                                    (item as any).qtySold}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-900 font-medium">
                              {(tx as any).customItemName ||
                                (tx as any).itemName ||
                                "Custom Sale"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        UGX{" "}
                        {Number(
                          tx.amount ||
                            (tx as any).total ||
                            (tx as any).totalAmount ||
                            (tx as any).total_amount ||
                            (tx as any).grandTotal ||
                            0
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                          {(
                            tx.paymentMethod ||
                            (tx as any).payment_method ||
                            "CASH"
                          ).replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {tx.user?.firstName ||
                          tx.userName ||
                          (tx as any).seller_name ||
                          (tx as any).seller ||
                          "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-400 pt-4">
        &copy; {new Date().getFullYear()} SimuPOS • Professional Business Management
      </div>
    </div>
  );
}
