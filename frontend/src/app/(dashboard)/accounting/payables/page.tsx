import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AgedPayablesTable } from '@/components/accounting/AgedPayablesTable';

const PayablesPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Accounts Payable</h1>
        <Button asChild>
          <Link href="/accounting/payables/new">New Bill</Link>
        </Button>
      </div>
      <AgedPayablesTable />
    </div>
  );
};

export default PayablesPage;