import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AgedReceivablesTable } from '@/components/accounting/AgedReceivablesTable';

const ReceivablesPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Accounts Receivable</h1>
        <Button asChild>
          <Link href="/accounting/receivables/new">New Invoice</Link>
        </Button>
      </div>
      <AgedReceivablesTable />
    </div>
  );
};

export default ReceivablesPage;