import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { CreditEntry } from "../models/CreditEntry";
import { CreditPayment, PaymentMethod } from "../models/CreditPayment";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { Branch, User } from "../models";
import { TransactionService } from "./TransactionService"; 

export class CreditService {
  private creditEntryRepository: Repository<CreditEntry>;
  private creditPaymentRepository: Repository<CreditPayment>;
  private syncService: SyncService;
  private transactionService: TransactionService; 

  constructor() {
    this.creditEntryRepository = AppDataSource.getRepository(CreditEntry);
    this.creditPaymentRepository = AppDataSource.getRepository(CreditPayment);
    this.syncService = new SyncService();
    this.transactionService = new TransactionService(); 
  }

  async createCreditEntry(entryData: {
    customerName: string;
    customerPhone?: string;
    items: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    totalAmount: number;
    dateTaken: Date;
    dueDate?: Date;
    branchId: string;
    userId: string;
  }) {
    const creditEntry = this.creditEntryRepository.create({
      ...entryData,
      amountPaid: 0,
      balance: entryData.totalAmount,
      status: "unpaid",
    });

    await this.creditEntryRepository.save(creditEntry);

    await this.syncService.logChange(
      "CreditEntry",
      creditEntry.id,
      SyncOperation.CREATE,
      creditEntry,
      entryData.userId,
      entryData.branchId
    );

    return creditEntry;
  }

  async getCreditEntries(
    branchId: string,
    filters?: {
      customerName?: string;
      status?: "unpaid" | "partially_paid" | "paid";
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.creditEntryRepository
      .createQueryBuilder("creditEntry")
      .where("creditEntry.branchId = :branchId", { branchId });

    if (filters?.customerName) {
      queryBuilder.andWhere(
        "LOWER(creditEntry.customerName) LIKE LOWER(:customerName)",
        { customerName: `%${filters.customerName}%` }
      );
    }

    if (filters?.status) {
      queryBuilder.andWhere("creditEntry.status = :status", {
        status: filters.status,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("creditEntry.dateTaken", "DESC");

    const [creditEntries, total] = await queryBuilder.getManyAndCount();

    return {
      creditEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCreditEntryById(id: string) {
    const creditEntry = await this.creditEntryRepository.findOne({
      where: { id },
      relations: ["payments"],
    });

    if (!creditEntry) {
      throw new ApiError(404, "Credit entry not found");
    }

    return creditEntry;
  }

  async recordPayment(paymentData: {
    creditEntryId: string;
    amountPaid: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    notes?: string;
    branchId: string;
    userId: string;
  }) {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Fetch and verify credit entry
      const creditEntry = await transactionalEntityManager.findOne(
        CreditEntry,
        {
          where: { id: paymentData.creditEntryId },
        }
      );

      if (!creditEntry) throw new ApiError(404, "Credit entry not found");

      // 2. Verify branch and user
      const [branch, user] = await Promise.all([
        transactionalEntityManager.findOne(Branch, {
          where: { id: paymentData.branchId },
        }),
        transactionalEntityManager.findOne(User, {
          where: { id: paymentData.userId },
        }),
      ]);

      if (!branch) throw new ApiError(404, "Branch not found");
      if (!user) throw new ApiError(404, "User not found");

      // Convert all amounts to numbers to ensure proper arithmetic
      const totalAmount = Number(creditEntry.totalAmount);
      const previousPaid = Number(creditEntry.amountPaid);
      const currentPayment = Number(paymentData.amountPaid);

      // 3. Calculate new total paid
      const newPaid = previousPaid + currentPayment;

      // Prevent overpayment
      if (newPaid > totalAmount) {
        throw new ApiError(400, "Payment exceeds outstanding balance");
      }

      // 4. Create and save payment
      const payment = this.creditPaymentRepository.create({
        ...paymentData,
        creditEntry,
        branch,
        user,
      });

      const savedPayment = await transactionalEntityManager.save(
        CreditPayment,
        payment
      );

      // 5. Update credit entry with proper number values
      creditEntry.amountPaid = newPaid;

      // Calculate balance with proper decimal handling
      const balance = parseFloat((totalAmount - newPaid).toFixed(2));
      creditEntry.balance = balance;

      // 6. Update status
      if (balance === 0) {
        creditEntry.status = "paid";
      } else if (newPaid > 0) {
        creditEntry.status = "partially_paid";
      } else {
        creditEntry.status = "unpaid";
      }

      const savedCreditEntry = await transactionalEntityManager.save(
        CreditEntry,
        creditEntry
      );

      // 7. Sync logs
      // Note: Sync logs should ideally also be part of the transaction or handled carefully
      // For now, logging them after successful commit. If transaction fails, these won't run.
      await this.syncService.logChange(
        "CreditPayment",
        savedPayment.id,
        SyncOperation.CREATE,
        savedPayment,
        paymentData.userId,
        paymentData.branchId
      );

      await this.syncService.logChange(
        "CreditEntry",
        savedCreditEntry.id,
        SyncOperation.UPDATE,
        savedCreditEntry,
        paymentData.userId,
        paymentData.branchId
      );

      // 8. Create general transaction using the same entity manager
      const generalTransaction =
        await this.transactionService._createCustomAmountTransactionInternal(
          {
            amount: paymentData.amountPaid,
            paymentMethod: paymentData.paymentMethod as
              | "cash"
              | "mtn_momo"
              | "airtel_money",
            customerName: savedCreditEntry.customerName,
            customerPhone: savedCreditEntry.customerPhone,
            branchId: paymentData.branchId,
            userId: paymentData.userId,
            customItemName: `Credit Payment for Entry ID: ${savedCreditEntry.id}`,
          },
          transactionalEntityManager
        );

      // 9. Sync logs (all operations now part of the same transaction)
      // Sync logs are called here, if any step above fails, transaction rolls back, these are not called.
      await this.syncService.logChange(
        "CreditPayment",
        savedPayment.id,
        SyncOperation.CREATE,
        savedPayment,
        paymentData.userId,
        paymentData.branchId
      );

      await this.syncService.logChange(
        "CreditEntry",
        savedCreditEntry.id,
        SyncOperation.UPDATE,
        savedCreditEntry,
        paymentData.userId,
        paymentData.branchId
      );

      await this.syncService.logChange(
        "Transaction", // Sync log for the general transaction
        generalTransaction.id,
        SyncOperation.CREATE,
        generalTransaction,
        paymentData.userId,
        paymentData.branchId
      );

      return {
        creditEntry: savedCreditEntry,
        payment: savedPayment,
        transaction: generalTransaction,
      };
    });
  }

  async getPaymentsForEntry(creditEntryId: string) {
    return this.creditPaymentRepository.find({
      where: { creditEntry: { id: creditEntryId } },
      order: { paymentDate: "DESC" },
    });
  }

  async getCreditAnalytics(branchId: string) {
    const queryBuilder = this.creditEntryRepository
      .createQueryBuilder("creditEntry")
      .where("creditEntry.branchId = :branchId", { branchId });

    const creditEntries = await queryBuilder.getMany();

    const totalCredit = creditEntries.reduce(
      (sum, entry) => sum + entry.totalAmount,
      0
    );
    const totalPaid = creditEntries.reduce(
      (sum, entry) => sum + entry.amountPaid,
      0
    );
    const totalOutstanding = creditEntries.reduce(
      (sum, entry) => sum + entry.balance,
      0
    );

    const byStatus = creditEntries.reduce(
      (acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCredit,
      totalPaid,
      totalOutstanding,
      byStatus,
      count: creditEntries.length,
      unpaidAmount: creditEntries
        .filter((e) => e.status === "unpaid")
        .reduce((sum, entry) => sum + entry.balance, 0),
      partiallyPaidAmount: creditEntries
        .filter((e) => e.status === "partially_paid")
        .reduce((sum, entry) => sum + entry.balance, 0),
    };
  }
}
