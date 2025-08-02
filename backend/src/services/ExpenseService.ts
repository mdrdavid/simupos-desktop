import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Expense, PaymentMethod } from "../models/Expense";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";

export class ExpenseService {
  private expenseRepository: Repository<Expense>;
  private syncService: SyncService;

  constructor() {
    this.expenseRepository = AppDataSource.getRepository(Expense);
    this.syncService = new SyncService();
  }

  async createExpense(expenseData: {
    amount: number;
    category: string;
    description?: string;
    date: Date;
    paymentMethod: PaymentMethod;
    receiptNumber?: string;
    vendor?: string;
    isRecurring?: boolean;
    branchId: string;
    userId: string;
  }) {
    const expense = this.expenseRepository.create(expenseData);
    await this.expenseRepository.save(expense);

    // Log for sync
    await this.syncService.logChange(
      "Expense",
      expense.id,
      SyncOperation.CREATE,
      expense,
      expenseData.userId,
      expenseData.branchId
    );

    return expense;
  }

  async getExpenses(
    branchId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      paymentMethod?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder("expense")
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false");

    if (filters?.startDate) {
      queryBuilder.andWhere("expense.date >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("expense.date <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere("expense.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.paymentMethod) {
      queryBuilder.andWhere("expense.paymentMethod = :paymentMethod", {
        paymentMethod: filters.paymentMethod,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("expense.date", "DESC");

    const [expenses, total] = await queryBuilder.getManyAndCount();

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getExpenseById(id: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    return expense;
  }

  async updateExpense(
    id: string,
    updateData: Partial<Expense>,
    userId: string
  ) {
    const expense = await this.expenseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    Object.assign(expense, updateData);
    await this.expenseRepository.save(expense);

    // Log for sync
    await this.syncService.logChange(
      "Expense",
      expense.id,
      SyncOperation.UPDATE,
      expense,
      userId,
      expense.branchId
    );

    return expense;
  }

  async deleteExpense(id: string, userId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    expense.isDeleted = true;
    await this.expenseRepository.save(expense);

    // Log for sync
    await this.syncService.logChange(
      "Expense",
      expense.id,
      SyncOperation.DELETE,
      expense,
      userId,
      expense.branchId
    );

    return { message: "Expense deleted successfully" };
  }

  async getExpenseAnalytics(
    branchId: string,
    period?: {
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder("expense")
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false");

    if (period?.startDate) {
      queryBuilder.andWhere("expense.date >= :startDate", {
        startDate: period.startDate,
      });
    }

    if (period?.endDate) {
      queryBuilder.andWhere("expense.date <= :endDate", {
        endDate: period.endDate,
      });
    }

    const expenses = await queryBuilder.getMany();

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const byCategory = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPaymentMethod = expenses.reduce(
      (acc, expense) => {
        acc[expense.paymentMethod] =
          (acc[expense.paymentMethod] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalExpenses,
      byCategory,
      byPaymentMethod,
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      count: expenses.length,
      recurringExpenses: expenses.filter((e) => e.isRecurring).length,
    };
  }

  async getExpensesByDateRange(
    branchId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ) {
    let dateFormat: string;
    switch (groupBy) {
      case "week":
        dateFormat = 'YYYY-"W"WW';
        break;
      case "month":
        dateFormat = "YYYY-MM";
        break;
      default:
        dateFormat = "YYYY-MM-DD";
    }

    const result = await this.expenseRepository
      .createQueryBuilder("expense")
      .select([
        `TO_CHAR(expense.expenseDate, '${dateFormat}') as period`,
        "COUNT(*) as count",
        "SUM(expense.amount) as total_amount",
        "expense.category as category",
      ])
      .where("expense.branchId = :branchId", { branchId })
      .andWhere("expense.isDeleted = false")
      .andWhere("expense.expenseDate >= :startDate", { startDate })
      .andWhere("expense.expenseDate <= :endDate", { endDate })
      .groupBy("period, expense.category")
      .orderBy("period", "ASC")
      .getRawMany();

    return result;
  }
}

