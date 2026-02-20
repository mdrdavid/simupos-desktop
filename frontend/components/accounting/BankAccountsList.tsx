"use client"

import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useBanking } from '@/context/BankingContext';
import Link from 'next/link';

export function BankAccountsList() {
  const { bankAccounts, fetchBankAccounts, loading } = useBanking();

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  if (loading && bankAccounts.length === 0) return <div>Loading bank accounts...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account Name</TableHead>
          <TableHead>Account Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bankAccounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell className="font-medium">{account.accountName}</TableCell>
            <TableCell>{account.accountNumber}</TableCell>
            <TableCell className="capitalize">{account.accountType}</TableCell>
            <TableCell>{account.currentBalance.toLocaleString()} UGX</TableCell>
            <TableCell className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/accounting/banking/reconcile/${account.id}`}>Reconcile</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/accounting/banking/transactions/${account.id}`}>Transactions</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {bankAccounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
              No bank accounts found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}