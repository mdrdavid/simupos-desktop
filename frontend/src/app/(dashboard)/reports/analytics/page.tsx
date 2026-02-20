"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import SalesReport from '@/components/dashboard/reports/sales-report';
import ProductStats from '@/components/dashboard/reports/product-stats';
import SuppliersReport from '@/components/dashboard/reports/suppliers-report';
import OrdersReport from '@/components/dashboard/reports/orders-report';
import { ReportsDashboardProvider, useReportsDashboard } from '@/context/ReportsDashboardContext';
import DateFilter from '@/components/dashboard/reports/DateFilter';

const AnalyticsPageContent = () => {
  const { dashboardData, loading, error, filter } = useReportsDashboard();

  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div>No data available.</div>;
  }

  return (
    <div className="grid gap-6">
      <SalesReport salesData={dashboardData.sales[filter]} />
      <ProductStats
        totalProducts={dashboardData.totalProducts}
        lowStockItems={dashboardData.lowStockItems}
        topPerformingProducts={dashboardData.topPerformingProducts}
      />
      <SuppliersReport data={dashboardData.suppliersReport} />
      <OrdersReport data={dashboardData.ordersReport} />
    </div>
  );
};

const AnalyticsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'owner' && user.role !== 'manager'))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
    return null;
  }

  return (
    <ReportsDashboardProvider>
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <DateFilter />
        </div>
        <AnalyticsPageContent />
      </div>
    </ReportsDashboardProvider>
  );
};

export default AnalyticsPage;
