"use client"

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { AgedReceivables } from '@/src/types/accountsReceivable';

export function AgedReceivablesTable() {
  const { getAgedReceivables, loading } = useAccountsReceivable();
  const [agedData, setAgedData] = useState<AgedReceivables | null>(null);

  useEffect(() => {
    const fetchAgedData = async () => {
      try {
        const data = await getAgedReceivables();
        setAgedData(data);
      } catch (error) {
        console.error("Failed to fetch aged receivables", error);
      }
    };
    fetchAgedData();
  }, [getAgedReceivables]);

  if (loading) return <div>Loading aged receivables...</div>;
  if (!agedData) return <div>No aged receivables data available.</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Current</p>
          <p className="text-2xl font-bold">{agedData.current.toLocaleString()} UGX</p>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">1-30 Days</p>
          <p className="text-2xl font-bold">{agedData.days30.toLocaleString()} UGX</p>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">31-60 Days</p>
          <p className="text-2xl font-bold">{agedData.days60.toLocaleString()} UGX</p>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">61-90 Days</p>
          <p className="text-2xl font-bold">{agedData.days90.toLocaleString()} UGX</p>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Over 90 Days</p>
          <p className="text-2xl font-bold text-red-600">{agedData.over90.toLocaleString()} UGX</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Age (Days)</TableHead>
            <TableHead>Amount Due</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agedData.agedInvoices.map((item) => (
            <TableRow key={item.invoice.id}>
              <TableCell>{item.invoice.invoiceNumber}</TableCell>
              <TableCell>{item.invoice.customer?.name || 'N/A'}</TableCell>
              <TableCell>{item.age}</TableCell>
              <TableCell>{item.invoice.balanceDue.toLocaleString()}</TableCell>
              <TableCell>{item.ageCategory}</TableCell>
            </TableRow>
          ))}
          {agedData.agedInvoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                No outstanding invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}