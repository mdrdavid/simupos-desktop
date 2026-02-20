import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesReportProps {
  salesData: number;
}

const SalesReport: React.FC<SalesReportProps> = ({ salesData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">UGX {salesData.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
};

export default SalesReport;
