import React from 'react';
import { NewExpenseCategoryForm } from '@/components/accounting/NewExpenseCategoryForm';

const NewExpenseCategoryPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Expense Category</h1>
      <NewExpenseCategoryForm />
    </div>
  );
};

export default NewExpenseCategoryPage;