"use client"

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { AgedPayables } from '@/src/types/accountsPayable';

export function AgedPayablesTable() {
  const { getAgedPayables, loading } = useAccountsPayable();
  const [agedData, setAgedData] = useState<AgedPayables | null>(null);

  useEffect(() => {
    const fetchAgedData = async () => {
      try {
        const data = await getAgedPayables();
        setAgedData(data);
      } catch (error) {
        console.error("Failed to fetch aged payables", error);
      }
    };
    fetchAgedData();
  }, [getAgedPayables]);

  if (loading) return <div>Loading aged payables...</div>;
  if (!agedData) return <div>No aged payables data available.</div>;

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
            <TableHead>Bill #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Age (Days)</TableHead>
            <TableHead>Amount Due</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agedData.agedBills.map((item) => (
            <TableRow key={item.bill.id}>
              <TableCell>{item.bill.billNumber}</TableCell>
              <TableCell>{item.bill.supplier?.name || 'N/A'}</TableCell>
              <TableCell>{item.age}</TableCell>
              <TableCell>{item.bill.balanceDue.toLocaleString()}</TableCell>
              <TableCell className="capitalize">{item.ageCategory}</TableCell>
            </TableRow>
          ))}
          {agedData.agedBills.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                No outstanding bills found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}