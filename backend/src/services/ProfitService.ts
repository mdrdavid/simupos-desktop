import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { SaleStatus } from "../models/Sale";
import { Expense, SaleItem, Item, Sale, TransactionItem } from "../models";
import { PaymentMethod, Transaction } from "../models/Transaction";

export interface ProfitAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    totalSales: number;
    totalRevenue: number;
    averageSaleValue: number;
    salesGrowth?: number;
  };
  costs: {
    totalExpenses: number;
    totalCOGS: number; // Cost of Goods Sold
    operatingExpenses: number;
    expenseGrowth?: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    profitGrowth?: number;
  };
  breakdown: {
    dailyProfit: Array<{
      date: string;
      revenue: number;
      expenses: number;
      grossProfit: number;
      netProfit: number;
    }>;
    categoryExpenses: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    topProfitableItems: Array<{
      item: Item;
      quantitySold: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }>;
  };
}

export class ProfitService {
  private saleRepository: Repository<Sale>;
  private expenseRepository: Repository<Expense>;
  private saleItemRepository: Repository<SaleItem>;
  private transactionRepository: Repository<Transaction>;
  private itemRepository: Repository<Item>;
  private transactionItemRepository: Repository<TransactionItem>;
  constructor() {
    this.saleRepository = AppDataSource.getRepository(Sale);
    this.expenseRepository = AppDataSource.getRepository(Expense);
    this.saleItemRepository = AppDataSource.getRepository(SaleItem);
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.itemRepository = AppDataSource.getRepository(Item);
    this.transactionItemRepository =
      AppDataSource.getRepository(TransactionItem);
  }

  async calculateProfitAnalysis(
    branchId: string,
    startDate: Date,
    endDate: Date,
    compareWithPrevious = false
  ): Promise<ProfitAnalysis> {
    // Get sales data
    const salesData = await this.getTransactionData(
      branchId,
      startDate,
      endDate
    );

    // Get expense data
    const expenseData = await this.getExpenseData(branchId, startDate, endDate);

    // Get COGS (Cost of Goods Sold)
    const cogsData = await this.getCOGSData(branchId, startDate, endDate);

    // Calculate daily breakdown
    const dailyBreakdown = await this.getDailyProfitBreakdown(
      branchId,
      startDate,
      endDate
    );

    // Get category expenses
    const categoryExpenses = await this.getCategoryExpenseBreakdown(
      branchId,
      startDate,
      endDate
    );

    // Get top profitable items
    const topProfitableItems = await this.getTopProfitableItems(
      branchId,
      startDate,
      endDate
    );

    // Calculate growth if comparison is requested
    let salesGrowth: number | undefined;
    let expenseGrowth: number | undefined;
    let profitGrowth: number | undefined;

    if (compareWithPrevious) {
      const periodDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const previousStartDate = new Date(
        startDate.getTime() - periodDays * 24 * 60 * 60 * 1000
      );
      const previousEndDate = new Date(startDate.getTime() - 1);

      const previousSalesData = await this.getTransactionData(
        branchId,
        previousStartDate,
        previousEndDate
      );
      const previousExpenseData = await this.getExpenseData(
        branchId,
        previousStartDate,
        previousEndDate
      );
      const previousCOGSData = await this.getCOGSData(
        branchId,
        previousStartDate,
        previousEndDate
      );

      const previousNetProfit =
        previousSalesData.totalRevenue -
        previousCOGSData.totalCOGS -
        previousExpenseData.totalExpenses;

      salesGrowth =
        previousSalesData.totalRevenue > 0
          ? ((salesData.totalRevenue - previousSalesData.totalRevenue) /
              previousSalesData.totalRevenue) *
            100
          : 0;

      expenseGrowth =
        previousExpenseData.totalExpenses > 0
          ? ((expenseData.totalExpenses - previousExpenseData.totalExpenses) /
              previousExpenseData.totalExpenses) *
            100
          : 0;

      const currentNetProfit =
        salesData.totalRevenue - cogsData.totalCOGS - expenseData.totalExpenses;
      profitGrowth =
        previousNetProfit !== 0
          ? ((currentNetProfit - previousNetProfit) /
              Math.abs(previousNetProfit)) *
            100
          : 0;
    }

    // Calculate profit metrics
    const grossProfit = salesData.totalRevenue - cogsData.totalCOGS;
    const netProfit = grossProfit - expenseData.totalExpenses;
    const grossProfitMargin =
      salesData.totalRevenue > 0
        ? (grossProfit / salesData.totalRevenue) * 100
        : 0;
    const netProfitMargin =
      salesData.totalRevenue > 0
        ? (netProfit / salesData.totalRevenue) * 100
        : 0;

    return {
      period: { startDate, endDate },
      revenue: {
        totalSales: salesData.totalTransactions,
        totalRevenue: salesData.totalRevenue,
        averageSaleValue: salesData.averageTransactionValue,
        salesGrowth,
      },
      costs: {
        totalExpenses: expenseData.totalExpenses,
        totalCOGS: cogsData.totalCOGS,
        operatingExpenses: expenseData.totalExpenses,
        expenseGrowth,
      },
      profit: {
        grossProfit,
        netProfit,
        grossProfitMargin,
        netProfitMargin,
        profitGrowth,
      },
      breakdown: {
        dailyProfit: dailyBreakdown,
        categoryExpenses,
        topProfitableItems,
      },
    };
  }

  private async getTransactionData(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    paymentMethodBreakdown: Record<PaymentMethod, number>;
  }> {
    // Main transaction metrics
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "COUNT(*) as total_transactions",
        "COALESCE(SUM(transaction.amount), 0) as total_revenue",
        "COALESCE(AVG(transaction.amount), 0) as average_transaction_value",
      ])
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.isDeleted = false")
      .andWhere("transaction.createdAt >= :startDate", { startDate })
      .andWhere("transaction.createdAt <= :endDate", { endDate })
      .getRawOne();

    // Payment method breakdown
    const paymentMethods = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "transaction.paymentMethod as method",
        "COALESCE(SUM(transaction.amount), 0) as amount",
        "COUNT(*) as count",
      ])
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.isDeleted = false")
      .andWhere("transaction.createdAt >= :startDate", { startDate })
      .andWhere("transaction.createdAt <= :endDate", { endDate })
      .groupBy("transaction.paymentMethod")
      .getRawMany();

    // Convert payment methods to a structured object
    const paymentMethodBreakdown = paymentMethods.reduce(
      (acc, curr) => {
        acc[curr.method] = {
          amount: Number.parseFloat(curr.amount) || 0,
          count: Number.parseInt(curr.count) || 0,
        };
        return acc;
      },
      {} as Record<PaymentMethod, { amount: number; count: number }>
    );

    return {
      totalTransactions: Number.parseInt(result.total_transactions) || 0,
      totalRevenue: Number.parseFloat(result.total_revenue) || 0,
      averageTransactionValue:
        Number.parseFloat(result.average_transaction_value) || 0,
      paymentMethodBreakdown,
    };
  }
  private async getSalesData(branchId: string, startDate: Date, endDate: Date) {
    const result = await this.saleRepository
      .createQueryBuilder("sale")
      .select([
        "COUNT(*) as total_sales",
        "COALESCE(SUM(sale.total), 0) as total_revenue",
        "COALESCE(AVG(sale.total), 0) as average_sale_value",
      ])
      .where("sale.branchId = :branchId", { branchId })
      .andWhere("sale.status = :status", { status: SaleStatus.COMPLETED })
      .andWhere("sale.isDeleted = false")
      .andWhere("sale.createdAt >= :startDate", { startDate })
      .andWhere("sale.createdAt <= :endDate", { endDate })
      .getRawOne();

    return {
      totalSales: Number.parseInt(result.total_sales) || 0,
      totalRevenue: Number.parseFloat(result.total_revenue) || 0,
      averageSaleValue: Number.parseFloat(result.average_sale_value) || 0,
    };
  }

  private async getExpenseData(
    branchId: string,
    startDate: Date,
    endDate: Date
  ) {
    const result = await this.expenseRepository
      .createQueryBuilder("expense")
      .select("COALESCE(SUM(expense.amount), 0) as total_expenses")
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false")
      .andWhere("expense.date >= :startDate", { startDate })
      .andWhere("expense.date <= :endDate", { endDate })
      .getRawOne();

    return {
      totalExpenses: Number.parseFloat(result.total_expenses) || 0,
    };
  }

  private async getCOGSData(branchId: string, startDate: Date, endDate: Date) {
    const result = await this.transactionItemRepository
      .createQueryBuilder("ti")
      .leftJoin("ti.transaction", "t")
      .select(
        "COALESCE(SUM(ti.quantity * COALESCE(ti.purchasePrice, 0)), 0) as total_cogs"
      )
      .where("t.branchId = :branchId", { branchId })
      .andWhere("t.isDeleted = false")
      .andWhere("t.createdAt >= :startDate", { startDate })
      .andWhere("t.createdAt <= :endDate", { endDate })
      .getRawOne();

    return {
      totalCOGS: Number.parseFloat(result?.total_cogs) || 0,
    };
  }

  // private async getCOGSData(branchId: string, startDate: Date, endDate: Date) {
  //   const result = await this.transactionItemRepository
  //     .createQueryBuilder("transactionItem")
  //     .leftJoin("transactionItem.transaction", "transaction")
  //     .select(
  //       "COALESCE(SUM(transactionItem.quantity * COALESCE(transactionItem.unitCost, 0)), 0) as total_cogs"
  //     )
  //     .where("transaction.branchId = :branchId", { branchId })
  //     .andWhere("transaction.isDeleted = false")
  //     .andWhere("transaction.createdAt >= :startDate", { startDate })
  //     .andWhere("transaction.createdAt <= :endDate", { endDate })
  //     .getRawOne();

  //   return {
  //     totalCOGS: Number.parseFloat(result.total_cogs) || 0,
  //   };
  // }

  private async getDailyProfitBreakdown(
    branchId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Get daily revenue from transactions instead of sales
    const dailyRevenue = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select([
        "DATE(transaction.createdAt) as date",
        "COALESCE(SUM(transaction.amount), 0) as revenue",
      ])
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.isDeleted = false")
      .andWhere("transaction.createdAt >= :startDate", { startDate })
      .andWhere("transaction.createdAt <= :endDate", { endDate })
      .groupBy("DATE(transaction.createdAt)")
      .getRawMany();

    // Get daily expenses
    const dailyExpenses = await this.expenseRepository
      .createQueryBuilder("expense")
      .select([
        "DATE(expense.date) as date",
        "COALESCE(SUM(expense.amount), 0) as expenses",
      ])
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false")
      .andWhere("expense.date >= :startDate", { startDate })
      .andWhere("expense.date <= :endDate", { endDate })
      .groupBy("DATE(expense.date)")
      .getRawMany();

    // Get daily COGS
    const dailyCOGS = await this.transactionItemRepository
      .createQueryBuilder("ti")
      .leftJoin("ti.transaction", "t")
      .select([
        "DATE(t.createdAt) as date",
        "COALESCE(SUM(ti.quantity * COALESCE(ti.purchasePrice, 0)), 0) as cogs",
      ])
      .where("t.branchId = :branchId", { branchId })
      .andWhere("t.isDeleted = false")
      .andWhere("t.createdAt >= :startDate", { startDate })
      .andWhere("t.createdAt <= :endDate", { endDate })
      .groupBy("DATE(t.createdAt)")
      .getRawMany();

    // Combine data by date
    const dateMap: { [key: string]: any } = {};

    // Helper function to ensure date is in YYYY-MM-DD format
    const formatDate = (dateString: string | Date): string => {
      if (typeof dateString === "string") {
        // If it's already in ISO format (YYYY-MM-DD), return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // Otherwise parse and format
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      }
      // If it's a Date object
      return dateString.toISOString().split("T")[0];
    };

    dailyRevenue.forEach((item) => {
      const date = formatDate(item.date);
      if (!dateMap[date])
        dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
      dateMap[date].revenue = Number.parseFloat(item.revenue);
    });

    dailyExpenses.forEach((item) => {
      const date = formatDate(item.date);
      if (!dateMap[date])
        dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
      dateMap[date].expenses = Number.parseFloat(item.expenses);
    });

    dailyCOGS.forEach((item) => {
      const date = formatDate(item.date);
      if (!dateMap[date])
        dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
      dateMap[date].cogs = Number.parseFloat(item.cogs);
    });

    // Convert to array and sort by date
    const result = Object.values(dateMap).map((item: any) => ({
      date: item.date,
      revenue: item.revenue,
      expenses: item.expenses,
      grossProfit: item.revenue - item.cogs,
      netProfit: item.revenue - item.cogs - item.expenses,
    }));

    // Sort by date (now guaranteed to be in YYYY-MM-DD format)
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // private async getDailyProfitBreakdown(
  //   branchId: string,
  //   startDate: Date,
  //   endDate: Date
  // ) {
  //   // Get daily revenue from transactions instead of sales
  //   const dailyRevenue = await this.transactionRepository
  //     .createQueryBuilder("transaction")
  //     .select([
  //       "DATE(transaction.createdAt) as date",
  //       "COALESCE(SUM(transaction.amount), 0) as revenue",
  //     ])
  //     .where("transaction.branchId = :branchId", { branchId })
  //     .andWhere("transaction.isDeleted = false")
  //     .andWhere("transaction.createdAt >= :startDate", { startDate })
  //     .andWhere("transaction.createdAt <= :endDate", { endDate })
  //     .groupBy("DATE(transaction.createdAt)")
  //     .getRawMany();

  //   // Get daily expenses
  //   const dailyExpenses = await this.expenseRepository
  //     .createQueryBuilder("expense")
  //     .select([
  //       "DATE(expense.date) as date",
  //       "COALESCE(SUM(expense.amount), 0) as expenses",
  //     ])
  //     .where("expense.branchId = :branchId", { branchId })
  //     .andWhere("expense.isDeleted = false")
  //     .andWhere("expense.date >= :startDate", { startDate })
  //     .andWhere("expense.date <= :endDate", { endDate })
  //     .groupBy("DATE(expense.date)")
  //     .getRawMany();

  //   // Get daily COGS
  //   const dailyCOGS = await this.transactionItemRepository
  //     .createQueryBuilder("ti")
  //     .leftJoin("ti.transaction", "t")
  //     .select([
  //       "DATE(t.createdAt) as date",
  //       "COALESCE(SUM(ti.quantity * COALESCE(ti.purchasePrice, 0)), 0) as cogs",
  //     ])
  //     .where("t.branchId = :branchId", { branchId })
  //     .andWhere("t.isDeleted = false")
  //     .andWhere("t.createdAt >= :startDate", { startDate })
  //     .andWhere("t.createdAt <= :endDate", { endDate })
  //     .groupBy("DATE(t.createdAt)")
  //     .getRawMany();
  //   // Combine data by date
  //   const dateMap: { [key: string]: any } = {};

  //   dailyRevenue.forEach((item) => {
  //     const date = item.date;
  //     if (!dateMap[date])
  //       dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
  //     dateMap[date].revenue = Number.parseFloat(item.revenue);
  //   });

  //   dailyExpenses.forEach((item) => {
  //     const date = item.date;
  //     if (!dateMap[date])
  //       dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
  //     dateMap[date].expenses = Number.parseFloat(item.expenses);
  //   });

  //   dailyCOGS.forEach((item) => {
  //     const date = item.date;
  //     if (!dateMap[date])
  //       dateMap[date] = { date, revenue: 0, expenses: 0, cogs: 0 };
  //     dateMap[date].cogs = Number.parseFloat(item.cogs);
  //   });

  //   return Object.values(dateMap)
  //     .map((item: any) => ({
  //       date: item.date,
  //       revenue: item.revenue,
  //       expenses: item.expenses,
  //       grossProfit: item.revenue - item.cogs,
  //       netProfit: item.revenue - item.cogs - item.expenses,
  //     }))
  //     .sort((a, b) => a.date.localeCompare(b.date));
  // }

  private async getCategoryExpenseBreakdown(
    branchId: string,
    startDate: Date,
    endDate: Date
  ) {
    const result = await this.expenseRepository
      .createQueryBuilder("expense")
      .select([
        "expense.category as category",
        "COALESCE(SUM(expense.amount), 0) as amount",
      ])
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false")
      .andWhere("expense.date >= :startDate", { startDate })
      .andWhere("expense.date <= :endDate", { endDate })
      .groupBy("expense.category")
      .getRawMany();

    const totalExpenses = result.reduce(
      (sum, item) => sum + Number.parseFloat(item.amount),
      0
    );

    return result.map((item) => ({
      category: item.category,
      amount: Number.parseFloat(item.amount),
      percentage:
        totalExpenses > 0
          ? (Number.parseFloat(item.amount) / totalExpenses) * 100
          : 0,
    }));
  }

  private async getTopProfitableItems(
    branchId: string,
    startDate: Date,
    endDate: Date
  ) {
    const result = await this.transactionItemRepository
      .createQueryBuilder("ti")
      .leftJoin("ti.transaction", "t")
      .leftJoin("ti.item", "item")
      .select([
        "item.id as item_id",
        "SUM(ti.quantity) as quantity_sold",
        "SUM(ti.price * ti.quantity) as revenue",
        "SUM(ti.quantity * COALESCE(ti.purchasePrice, 0)) as cost",
        "SUM(ti.quantity * (ti.price - COALESCE(ti.purchasePrice, 0))) as profit",
      ])
      .where("t.branchId = :branchId", { branchId })
      .andWhere("t.isDeleted = false")
      .andWhere("t.createdAt >= :startDate", { startDate })
      .andWhere("t.createdAt <= :endDate", { endDate })
      .andWhere("ti.itemId IS NOT NULL") // Only include regular items
      .groupBy("item.id")
      .orderBy("profit", "DESC")
      .limit(20)
      .getRawMany();
    // Load full item entities for the top items
    const itemIds = result.map((item) => item.item_id);
    const items = await this.itemRepository.findByIds(itemIds);
    const itemsMap = new Map(items.map((item) => [item.id, item]));

    return result
      .map((item) => {
        const revenue = Number.parseFloat(item.revenue);
        const cost = Number.parseFloat(item.cost);
        const profit = Number.parseFloat(item.profit);
        const fullItem = itemsMap.get(item.item_id);

        if (!fullItem) return undefined; // Filter out undefined items

        return {
          item: fullItem, // This will have all Item properties
          quantitySold: Number.parseInt(item.quantity_sold),
          revenue,
          cost,
          profit,
          margin: revenue > 0 ? (profit / revenue) * 100 : 0,
        };
      })
      .filter(
        (
          item
        ): item is {
          item: Item;
          quantitySold: number;
          revenue: number;
          cost: number;
          profit: number;
          margin: number;
        } => item !== undefined
      );
  }
  async getQuickProfitSummary(
    branchId: string,
    period: "today" | "week" | "month" | "quarter" | "year"
  ) {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    switch (period) {
      case "today":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0
        );
        break;
      case "week":
        const weekStart = now.getDate() - now.getDay();
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          weekStart,
          0,
          0,
          0
        );
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1, 0, 0, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        break;
    }

    const analysis = await this.calculateProfitAnalysis(
      branchId,
      startDate,
      endDate,
      true
    );

    return {
      period,
      revenue: analysis.revenue.totalRevenue,
      expenses: analysis.costs.totalExpenses,
      grossProfit: analysis.profit.grossProfit,
      netProfit: analysis.profit.netProfit,
      profitMargin: analysis.profit.netProfitMargin,
      growth: {
        sales: analysis.revenue.salesGrowth,
        expenses: analysis.costs.expenseGrowth,
        profit: analysis.profit.profitGrowth,
      },
    };
  }
}
