import React from 'react';
import { NewInvoiceForm } from '@/components/accounting/NewInvoiceForm';

const NewInvoicePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Invoice</h1>
      <NewInvoiceForm />
    </div>
  );
};

export default NewInvoicePage;