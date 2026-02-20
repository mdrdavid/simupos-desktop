import React from 'react';
import { NewBillForm } from '@/components/accounting/NewBillForm';

const NewBillPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Bill</h1>
      <NewBillForm />
    </div>
  );
};

export default NewBillPage;