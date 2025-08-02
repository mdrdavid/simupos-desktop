import { AppDataSource } from "../config/database";
import { Transaction } from "../models/Transaction";
import { Item } from "../models/Item";
import { Customer } from "../models/Customer";
import { MoreThanOrEqual, Repository, Raw } from "typeorm";

export class DashboardService {
  private transactionRepository: Repository<Transaction>;
  private itemRepository: Repository<Item>;
  private customerRepository: Repository<Customer>;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.itemRepository = AppDataSource.getRepository(Item);
    this.customerRepository = AppDataSource.getRepository(Customer);
  }

  public async getDashboardData(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const todaysSalesResult = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.timestamp >= :today", { today })
      .andWhere("transaction.isDeleted = false")
      .getRawOne();
    const todaysSales = todaysSalesResult.total || 0;

    const todaysTransactions = await this.transactionRepository.count({
      where: {
        branchId,
        timestamp: MoreThanOrEqual(today),
        isDeleted: false,
      },
    });

    const totalProducts = await this.itemRepository.count({
      where: { branchId, isDeleted: false },
    });

    const totalCustomers = await this.customerRepository.count({
      where: { branchId, isDeleted: false },
    });

    const weeklySales = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select(
        "DATE(transaction.timestamp) as date, SUM(transaction.amount) as total"
      )
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.timestamp >= :sevenDaysAgo", { sevenDaysAgo })
      .andWhere("transaction.isDeleted = false")
      .groupBy("DATE(transaction.timestamp)")
      .orderBy("DATE(transaction.timestamp)", "ASC")
      .getRawMany();

    const recentTransactions = await this.transactionRepository.find({
      where: { branchId, isDeleted: false },
      relations: ["items"], // Include the items relation
      order: { timestamp: "DESC" },
      take: 5,
    });

    const lowStockItems = await this.itemRepository.find({
      where: {
        branchId,
        isDeleted: false,
        stockQuantity: Raw((alias) => `${alias} <= "minStockLevel"`),
      },
      take: 5,
    });

    return {
      todaysSales,
      todaysTransactions,
      totalProducts,
      totalCustomers,
      weeklySales,
      recentTransactions,
      lowStockItems,
    };
  }
}
