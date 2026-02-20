"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useReportsDashboard, FilterType } from '@/context/ReportsDashboardContext';

const DateFilter = () => {
  const { filter, setFilter } = useReportsDashboard();

  const filters: FilterType[] = ['daily', 'weekly', 'monthly', 'annual'];

  return (
    <div className="flex space-x-2">
      {filters.map((f) => (
        <Button
          key={f}
          variant={filter === f ? 'default' : 'outline'}
          onClick={() => setFilter(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default DateFilter;
