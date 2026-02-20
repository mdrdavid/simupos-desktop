/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { formatCurrency } from "@/lib/utils";
import { generateSalesForecastReportPDF } from "@/src/utils/exportUtils";
import { Loader2, Printer } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { generatePredictions } from "@/src/utils/predictionUtils";


interface ProductSale {
  productId: string;
  productName: string;
  dailySales: { date: string; total: number }[];
  totalSales: number;
  forecasts: {
    '7-day': number;
    '14-day': number;
    '30-day': number;
  };
  currentStock: number;
  stockRecommendation: string;
}

export default function SalesForecastReportPage() {
  const { getTransactions, getItems } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(false);
  const { businessData } = useAuth();
  const { currentBranch } = useBranch();

  const handlePrintReport = () => {
    if (productSales.length > 0 && dateRange?.from && dateRange?.to) {
        generateSalesForecastReportPDF(productSales, { from: dateRange.from, to: dateRange.to }, businessData?.name, currentBranch?.name);
    }
  };

  const handleFetchReport = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return;
    }
    setLoading(true);
    try {
      const [transactions, items] = await Promise.all([
        getTransactions({
          startDate: dateRange.from,
          endDate: dateRange.to,
        }),
        getItems(),
      ]);

      const salesByProduct = new Map<string, { productName: string; sales: Map<string, number>; currentStock: number }>();

      const itemStockMap = new Map<string, number>();
      items.forEach(item => {
        itemStockMap.set(item.id, item.stockQuantity || 0);
      });

      transactions.forEach((transaction) => {
        transaction.items.forEach(item => {
          const itemId = item.itemId || item.id;
          if (itemId) {
            if (!salesByProduct.has(itemId)) {
              salesByProduct.set(itemId, {
                productName: item.name,
                sales: new Map(),
                currentStock: itemStockMap.get(itemId) || 0,
              });
            }
            const productData = salesByProduct.get(itemId)!;
            const date = new Date(transaction.timestamp).toLocaleDateString('en-GB');
            const currentTotal = productData.sales.get(date) || 0;
            const itemQuantity = item.quantity || 1;
            const itemPrice = Number((item as any).price) || 0;
            productData.sales.set(date, currentTotal + (itemQuantity * itemPrice));
          }
        });
      });

      const result: ProductSale[] = Array.from(salesByProduct.entries())
        .map(([productId, data]) => {
          const dailySales = Array.from(data.sales.entries()).map(([date, total]) => ({ date, total }));
          const totalSales = dailySales.reduce((sum, day) => sum + day.total, 0);

          const timeSeries = dailySales.map((sale, index) => ({
            x: index,
            y: sale.total,
          }));

          const forecast7 = generatePredictions(timeSeries, 7).reduce((sum, p) => sum + p.y, 0);
          const forecast14 = generatePredictions(timeSeries, 14).reduce((sum, p) => sum + p.y, 0);
          const forecast30 = generatePredictions(timeSeries, 30).reduce((sum, p) => sum + p.y, 0);

          const stockRecommendation = data.currentStock <= 10 ? "Restock" : "Sufficient";

          return {
            productId,
            productName: data.productName,
            dailySales,
            totalSales,
            forecasts: {
              '7-day': forecast7,
              '14-day': forecast14,
              '30-day': forecast30,
            },
            currentStock: data.currentStock,
            stockRecommendation,
          };
        });

      setProductSales(result);

    } catch (error) {
      console.error("Failed to fetch sales forecast report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales Forecast Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button onClick={handleFetchReport} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Report"}
          </Button>
          <Button onClick={handlePrintReport} variant="outline" disabled={productSales.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">7-Day Forecast</TableHead>
                <TableHead className="text-right">14-Day Forecast</TableHead>
                <TableHead className="text-right">30-Day Forecast</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productSales.length > 0 ? (
                productSales.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.totalSales)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.forecasts['7-day'])}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.forecasts['14-day'])}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.forecasts['30-day'])}</TableCell>
                    <TableCell className="text-right">{product.currentStock}</TableCell>
                    <TableCell>{product.stockRecommendation}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No data for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
