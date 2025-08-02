import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Transaction } from "../models";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export class TransactionAnalysisService {
  private transactionRepository: Repository<Transaction>;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
  }

  private getDateRange(period: Period) {
    const now = new Date();
    switch (period) {
      case "daily":
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case "weekly":
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case "monthly":
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case "quarterly":
        return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) };
      case "yearly":
        return { startDate: startOfYear(now), endDate: endOfYear(now) };
      default:
        throw new Error("Invalid period specified");
    }
  }

  public async getAnalysis(branchId: string, period: Period) {
    const { startDate, endDate } = this.getDateRange(period);

    const queryBuilder = this.transactionRepository.createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.items", "item")
      .leftJoinAndSelect("transaction.user", "user")
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.timestamp BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("transaction.isDeleted = false");

    const transactions = await queryBuilder.getMany();

    const userAnalysis = transactions.reduce((acc, t) => {
      const userId = t.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId: t.userId,
          userName: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown User',
          totalTransactions: 0,
          totalRevenue: 0,
          itemsSold: [],
          paymentMethodAnalysis: {},
        };
      }

      acc[userId].totalTransactions += 1;
      acc[userId].totalRevenue += Number(t.amount);

      t.items.forEach(item => {
        const existingItem = acc[userId].itemsSold.find(i => i.name === item.name);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.amount += item.price * item.quantity;
        } else {
          acc[userId].itemsSold.push({
            name: item.name ?? 'Unknown Item',
            quantity: item.quantity,
            amount: item.price * item.quantity,
          });
        }
      });

      acc[userId].paymentMethodAnalysis[t.paymentMethod] = (acc[userId].paymentMethodAnalysis[t.paymentMethod] || 0) + 1;

      return acc;
    }, {} as Record<string, { userId: string; userName: string; totalTransactions: number; totalRevenue: number; itemsSold: { name: string; quantity: number; amount: number }[]; paymentMethodAnalysis: Record<string, number> }>);

    return {
      period,
      startDate,
      endDate,
      userAnalysis,
    };
  }
}
