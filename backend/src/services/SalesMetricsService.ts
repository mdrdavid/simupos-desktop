
import { AppDataSource } from "../config/database";
import { Transaction } from "../models/Transaction";
import { Repository } from "typeorm";

export class SalesMetricsService {
  private transactionRepository: Repository<Transaction>;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
  }

  async getTotalSales(branchId?: string): Promise<number> {
    let query = this.transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.isDeleted = false");

    if (branchId) {
      query = query.andWhere("transaction.branchId = :branchId", { branchId });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getTotalTransactions(branchId?: string): Promise<number> {
    let query = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.isDeleted = false");

    if (branchId) {
      query = query.andWhere("transaction.branchId = :branchId", { branchId });
    }

    return query.getCount();
  }

  async getSalesMetrics(branchId?: string): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }> {
    const totalSales = await this.getTotalSales(branchId);
    const totalTransactions = await this.getTotalTransactions(branchId);
    const averageTransactionValue =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      averageTransactionValue,
    };
  }
}
