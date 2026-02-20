import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExpenseCategoryList } from '@/components/accounting/ExpenseCategoryList';

const ExpensesPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expense Categories</h1>
        <Button asChild>
          <Link href="/accounting/expenses/new">New Category</Link>
        </Button>
      </div>
      <ExpenseCategoryList />
    </div>
  );
};

export default ExpensesPage;