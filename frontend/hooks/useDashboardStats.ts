import { useData, Transaction, Item } from "@/context/DataContext";
import { useCRM } from "@/context/CRMContext";
import { useState, useEffect, useMemo } from "react";
import { useBusiness } from "@/context/BusinessContext";
import { useAgroProduct } from "@/context/AgroProductContext";

interface WeeklySale {
  date: string;
  total: number;
}

// Helper function to calculate sales breakdown for the last 7 days
const calculateWeeklySalesBreakdown = (transactions: Transaction[]): WeeklySale[] => {
  const salesByDay: { [key: string]: number } = {};
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    salesByDay[dateString] = 0;
  }

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (transactionDate >= sevenDaysAgo) {
      const dateString = transactionDate.toISOString().split('T')[0];
      if (salesByDay[dateString] !== undefined) {
        salesByDay[dateString] += Number(transaction.amount) || 0;
      }
    }
  });

  return Object.entries(salesByDay)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper function to calculate best selling products
const calculateBestSellingProducts = (transactions: Transaction[]): { name: string; quantity: number }[] => {
  const productSales: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    if (transaction.items) {
      transaction.items.forEach((item: Item) => {
        if (item.name && item.quantity) {
          const quantity = Number(item.quantity) || 0;
          if (productSales[item.name]) {
            productSales[item.name] += quantity;
          } else {
            productSales[item.name] = quantity;
          }
        }
      });
    }
  });

  return Object.entries(productSales)
    .sort(([, a], [, b]) => b - a) // Sort by quantity in descending order
    .slice(0, 5) // Get the top 5 best-selling products
    .map(([name, quantity]) => ({ name, quantity }));
};

// Helper function to calculate payment method breakdown
const calculatePaymentMethodBreakdown = (transactions: Transaction[]): { name: string; value: number }[] => {
  const breakdown: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    const method = transaction.paymentMethod || "Other";
    const amount = Number(transaction.amount) || 0;
    if (breakdown[method]) {
      breakdown[method] += amount;
    } else {
      breakdown[method] = amount;
    }
  });

  return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
};

// Helper function to calculate category sales breakdown
const calculateCategorySalesBreakdown = (transactions: Transaction[]): { name: string; value: number }[] => {
  const breakdown: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    if (transaction.items) {
      transaction.items.forEach(item => {
        const category = item.category || "Uncategorized";
        const amount = (Number(item.sellingPrice) * Number(item.quantity)) || 0;
        if (breakdown[category]) {
          breakdown[category] += amount;
        } else {
          breakdown[category] = amount;
        }
      });
    }
  });

  return Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
};

export const useDashboardStats = () => {
  const {
    transactions,
    stockSummary,
    getTodaysSales,
    getWeeklySales,
    getMonthlySales,
    getYearlySales,
    getLowStockItems,
    loading: dataLoading,
    error: dataError,
  } = useData();
  const { currentBusiness } = useBusiness();
  const { agroProducts } = useAgroProduct();
  const { getCustomerStats, loading: crmLoading, error: crmError } = useCRM();

  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    totalSpend: 0,
    averageSpend: 0,
  });
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getCustomerStats();
        setCustomerStats(stats);
      } catch (e) {
        console.error("Failed to fetch customer stats", e);
      }
    };
    fetchStats();
  }, [getCustomerStats]);

  const dashboardStats = useMemo(() => {
    setIsCalculating(true);
    const todaysSales = getTodaysSales();
    const weeklySalesTotal = getWeeklySales();
    const monthlySalesTotal = getMonthlySales();
    const annualSalesTotal = getYearlySales();
    const bestSellingProducts = calculateBestSellingProducts(transactions);
    const paymentMethodBreakdown = calculatePaymentMethodBreakdown(transactions);
    const categorySalesBreakdown = calculateCategorySalesBreakdown(transactions);
    const weeklySales = calculateWeeklySalesBreakdown(transactions);
    const todaysTransactions = transactions.filter((t) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(t.timestamp) >= today;
    }).length;
    const recentTransactions = transactions.slice(0, 5);
    const lowStockItems = getLowStockItems();

    let totalProducts = stockSummary.totalItems;
    let totalVariants = 0;

    if (currentBusiness?.businessType === "agro") {
      totalProducts = agroProducts.length;
      totalVariants = agroProducts.reduce((acc, product) => {
        return acc + (product.variants?.length || 0);
      }, 0);
    }

    setIsCalculating(false);
    return {
      todaysSales,
      weeklySalesTotal,
      monthlySalesTotal,
      annualSalesTotal,
      bestSellingProducts,
      paymentMethodBreakdown,
      categorySalesBreakdown,
      weeklySales,
      todaysTransactions,
      totalProducts,
      totalVariants,
      totalCustomers: customerStats.totalCustomers,
      recentTransactions,
      lowStockItems,
    };
  }, [
    transactions,
    stockSummary,
    customerStats,
    getTodaysSales,
    getWeeklySales,
    getMonthlySales,
    getYearlySales,
    getLowStockItems,
    currentBusiness,
    agroProducts,
  ]);

  return {
    ...dashboardStats,
    loading:
      dataLoading ||
      crmLoading ||
      isCalculating,
    error: dataError || crmError,
  };
};
