import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BankAccountsList } from '@/components/accounting/BankAccountsList';

const BankingPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bank & Cash Management</h1>
        <Button asChild>
          <Link href="/accounting/banking/new">New Bank Account</Link>
        </Button>
      </div>
      <BankAccountsList />
    </div>
  );
};

export default BankingPage;