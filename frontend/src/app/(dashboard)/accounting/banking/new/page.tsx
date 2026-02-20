import React from 'react';
import { NewBankAccountForm } from '@/components/accounting/NewBankAccountForm';

const NewBankAccountPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Bank Account</h1>
      <NewBankAccountForm />
    </div>
  );
};

export default NewBankAccountPage;