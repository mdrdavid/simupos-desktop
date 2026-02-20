"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "lucide-react";

const COLORS = ["#41A5A5", "#6366F1", "#EC4899", "#F59E0B", "#10B981"];

export function CategorySalesChart() {
  const { categorySalesBreakdown, loading } = useDashboardStats();

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (!categorySalesBreakdown || categorySalesBreakdown.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Tag className="h-5 w-5 text-purple-500" />
          Top Sales by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySalesBreakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value: number) => `UGX ${value.toLocaleString()}`}
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                {categorySalesBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
