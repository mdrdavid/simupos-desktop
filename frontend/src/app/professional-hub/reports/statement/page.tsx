"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Printer, Download, Search } from "lucide-react";
import Link from "next/link";
import { useWeldingFinancials } from "@/context/WeldingFinancialContext";
import { useBusiness } from "@/context/BusinessContext";
import type { CustomerSnapshot } from "@/src/types/weldingFinancials";
import { generateStatementPDF } from "@/src/utils/exportUtils";

interface Transaction {
  date: Date;
  description: string;
  reference: string;
  charge: number;
  payment: number;
  balance: number;
}

export default function StatementOfAccountPage() {
  const { invoices } = useWeldingFinancials();
  const { currentBusiness } = useBusiness();

  const [selectedClientKey, setSelectedClientKey] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  // Extract unique clients
  const clients = useMemo(() => {
    const clientMap = new Map<string, CustomerSnapshot>();
    invoices.forEach((inv) => {
      const key = `${inv.customerDetails.name}|${inv.customerDetails.contact}`;
      if (!clientMap.has(key)) {
        clientMap.set(key, inv.customerDetails);
      }
    });
    return Array.from(clientMap.entries()).map(([key, details]) => ({
      key,
      ...details,
    }));
  }, [invoices]);

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.key === selectedClientKey);
  }, [clients, selectedClientKey]);

  const transactions = useMemo(() => {
    if (!selectedClient) return [];

    const clientInvoices = invoices.filter(
      (inv) =>
        inv.customerDetails.name === selectedClient.name &&
        inv.customerDetails.contact === selectedClient.contact,
    );

    const txs: Omit<Transaction, "balance">[] = [];
    clientInvoices.forEach((inv) => {
      // Add invoice
      txs.push({
        date: new Date(inv.issueDate),
        description: `Invoice #${inv.invoiceNumber}`,
        reference: inv.invoiceNumber,
        charge: Number(inv.totalAmount) || 0,
        payment: 0,
      });

      // Add payments
      if (inv.paymentsMade) {
        inv.paymentsMade.forEach((pay) => {
          txs.push({
            date: new Date(pay.date),
            description: `Payment - ${pay.method} ${pay.reference ? `(${pay.reference})` : ""}`,
            reference: `REC-${pay.id.substring(0, 5).toUpperCase()}`,
            charge: 0,
            payment: Number(pay.amount) || 0,
          });
        });
      }
    });

    // Sort by date
    let filteredTxs = txs.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Filter by date range if provided
    if (dateFrom) {
      const from = new Date(dateFrom);
      filteredTxs = filteredTxs.filter((tx) => tx.date >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filteredTxs = filteredTxs.filter((tx) => tx.date <= to);
    }

    // Calculate running balance
    let balance = 0;
    return filteredTxs.map((tx) => {
      balance += tx.charge - tx.payment;
      return { ...tx, balance } as Transaction;
    });
  }, [invoices, selectedClient, dateFrom, dateTo]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!selectedClient || !currentBusiness) return;
    generateStatementPDF(selectedClient, transactions, currentBusiness, {
      from: dateFrom,
      to: dateTo,
    });
  };

  const totalCharges = transactions.reduce((sum, tx) => sum + (Number(tx.charge) || 0), 0);
  const totalPayments = transactions.reduce((sum, tx) => sum + (Number(tx.payment) || 0), 0);
  const finalBalance = totalCharges - totalPayments;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="no-print mb-4">
        <Link href="/professional-hub/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .printable {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          body {
            background: white !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 no-print bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row items-end gap-4 flex-1">
          <div className="w-full md:w-64">
            <Label htmlFor="client-select">Select Client</Label>
            <Select
              value={selectedClientKey}
              onValueChange={setSelectedClientKey}
            >
              <SelectTrigger id="client-select">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.key} value={client.key}>
                    {client.name} ({client.contact})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-40">
            <Label htmlFor="date-from">From</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="w-full md:w-40">
            <Label htmlFor="date-to">To</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!selectedClient}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!selectedClient}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {!selectedClient ? (
        <Card className="no-print">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">
              Please select a client to view statement
            </p>
            <p className="text-sm">
              Choose a client from the dropdown above to generate the statement
              of account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          ref={printRef}
          className="printable max-w-[21cm] mx-auto bg-white shadow-lg"
        >
          <Card className="border-none shadow-none">
            <CardContent className="p-8 md:p-12 space-y-10">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Statement of Account
                  </h1>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>
                      Period:{" "}
                      {dateFrom
                        ? new Date(dateFrom).toLocaleDateString()
                        : "All time"}{" "}
                      -{" "}
                      {dateTo
                        ? new Date(dateTo).toLocaleDateString()
                        : "Present"}
                    </p>
                    <p>Date Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  {currentBusiness?.logo ? (
                    <img
                      src={currentBusiness.logo}
                      alt="Logo"
                      className="h-16 w-auto object-contain ml-auto mb-2"
                    />
                  ) : (
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-b-black border-r-[20px] border-r-transparent ml-auto mb-2" />
                  )}
                  <p className="font-bold text-lg">{currentBusiness?.name}</p>
                  <div className="text-sm text-gray-500 whitespace-pre-line">
                    {currentBusiness?.address}
                    {currentBusiness?.phone && `\n${currentBusiness.phone}`}
                    {currentBusiness?.email && `\n${currentBusiness.email}`}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="border-y py-6 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Statement For
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedClient.name}
                  </p>
                  <div className="text-gray-500">
                    <p>{selectedClient.contact}</p>
                    <p>{selectedClient.location}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-end">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Balance Due
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    UGX {finalBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 pb-3 border-b-2 border-gray-900 text-sm font-bold text-gray-900">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2 text-right">Charges</div>
                  <div className="col-span-2 text-right">Payments</div>
                  <div className="col-span-2 text-right">Balance</div>
                </div>
                <div className="divide-y border-b">
                  {transactions.map((tx, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 py-3 text-sm items-center"
                    >
                      <div className="col-span-2 text-gray-600">
                        {tx.date.toLocaleDateString()}
                      </div>
                      <div className="col-span-4 font-medium">
                        {tx.description}
                        <div className="text-xs text-gray-400">
                          {tx.reference}
                        </div>
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {tx.charge > 0
                          ? `UGX ${tx.charge.toLocaleString()}`
                          : "-"}
                      </div>
                      <div className="col-span-2 text-right font-medium text-green-600">
                        {tx.payment > 0
                          ? `UGX ${tx.payment.toLocaleString()}`
                          : "-"}
                      </div>
                      <div className="col-span-2 text-right font-bold">
                        UGX {tx.balance.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      No transactions found for this period.
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Charges</span>
                    <span className="font-medium text-gray-900">
                      UGX {totalCharges.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Payments</span>
                    <span className="font-medium text-green-600">
                      UGX {totalPayments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                    <span className="font-bold text-gray-900">
                      Closing Balance
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      UGX {finalBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-12 text-center text-xs text-gray-400 border-t">
                <p>
                  This is a computer generated statement. Thank you for your
                  business!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
