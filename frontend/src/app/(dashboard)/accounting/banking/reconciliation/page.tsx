import React from 'react';
import { BankReconciliation } from '@/components/accounting/BankReconciliation';

const ReconciliationPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bank Reconciliation</h1>
      <BankReconciliation bankAccountId="default-account-id" />
    </div>
  );
};

export default ReconciliationPage;