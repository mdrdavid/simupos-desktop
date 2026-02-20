/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState } from'react';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBanking } from '@/context/BankingContext';
import { toast } from '@/components/ui/use-toast';

export function BankReconciliation({ bankAccountId }: { bankAccountId: string }) {
  const { importBankStatement, reconcileBankAccount, loading } = useBanking();
  const [statementBalance, setStatementBalance] = useState("");
  const [statementDate, setStatementDate] = useState("");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // Logic to parse CSV will go here
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Import Bank Statement</h2>
        <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          <Button>Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold">Statement Transactions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Statement transactions will be rendered here */}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="font-semibold">System Transactions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* System transactions will be rendered here */}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Reconcile</Button>
      </div>
    </div>
  );
}