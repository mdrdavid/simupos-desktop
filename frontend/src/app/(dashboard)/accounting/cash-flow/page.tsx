import React from 'react';
import { CashFlowStatement } from '@/components/accounting/CashFlowStatement';

const CashFlowPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cash Flow Statement</h1>
      <CashFlowStatement />
    </div>
  );
};

export default CashFlowPage;