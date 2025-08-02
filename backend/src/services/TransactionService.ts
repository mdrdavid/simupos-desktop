import { ItemService } from "./ItemService";
import { DeepPartial, MoreThanOrEqual, Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Transaction, TransactionItem, Item, AgroProduct } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { TransactionIdService } from "./TransactionIdService";
import { Subscription, SubscriptionStatus } from "../models/Subscription";
import { MovementType } from "../models/StockMovement";
import { SalesMetricsService } from "./SalesMetricsService";

export class TransactionService {
  private defaultPageLimit = 1000;
  private transactionRepository: Repository<Transaction>;
  private transactionItemRepository: Repository<TransactionItem>;
  private itemRepository: Repository<Item>;
  private syncService: SyncService;
  private itemService: ItemService;
  private transactionIdService: TransactionIdService;
  private agroProductRepository: Repository<AgroProduct>;
  private salesMetricsService: SalesMetricsService;
  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.agroProductRepository = AppDataSource.getRepository(AgroProduct);
    this.transactionItemRepository =
      AppDataSource.getRepository(TransactionItem);
    this.itemRepository = AppDataSource.getRepository(Item);
    this.syncService = new SyncService();
    this.transactionIdService = new TransactionIdService(
      this.transactionRepository
    );
    this.itemService = new ItemService();
    this.salesMetricsService = new SalesMetricsService();
  }

  async createAgroTransaction(transactionData: {
    amount: number;
    paymentMethod: "cash" | "mtn_momo" | "airtel_money";
    customerName?: string;
    customerPhone?: string;
    items: Array<{
      agroProductId: string;
      price: number;
      quantity: number;
      purchasePrice?: number;
      name?: string;
      productType?: string;
      unit?: string;
      subUnit?: string;
      conversionFactor?: number;
    }>;
    branchId: string;
    userId: string;
    localId?: string;
  }) {
    // First check transaction limits
    const limitCheck = await this.checkTransactionLimit(transactionData.userId);
    if (!limitCheck.canProceed) {
      throw new ApiError(
        403,
        limitCheck.message || "Transaction limit reached"
      );
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate the 6-digit ID
      const transactionId =
        await this.transactionIdService.generateUniqueTransactionId();

      // Create the transaction
      const transaction = this.transactionRepository.create({
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
        customerName: transactionData.customerName || null,
        customerPhone: transactionData.customerPhone || null,
        branchId: transactionData.branchId,
        userId: transactionData.userId,
        transactionId,
        timestamp: new Date(),
        isAgroTransaction: true, // Flag this as an agro transaction
        localId: transactionData.localId || null,
      } as DeepPartial<Transaction>);

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Create transaction items and update stock
      const transactionItems: TransactionItem[] = [];

      for (const itemData of transactionData.items) {
        // Handle agro product only
        const agroProduct = await queryRunner.manager.findOne(AgroProduct, {
          where: { id: itemData.agroProductId, isDeleted: false },
        });

        if (!agroProduct) {
          throw new ApiError(
            404,
            `Agro product with ID ${itemData.agroProductId} not found`
          );
        }

        if (agroProduct.totalStockQuantity < itemData.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for agro product ${agroProduct.name}. Available: ${agroProduct.totalStockQuantity}, Requested: ${itemData.quantity}`
          );
        }

        // Update agro product stock
        agroProduct.totalStockQuantity -= itemData.quantity;
        await queryRunner.manager.save(agroProduct);

        // Create transaction item
        const transactionItem = new TransactionItem();
        transactionItem.price = itemData.price;
        transactionItem.quantity = itemData.quantity;
        transactionItem.purchasePrice = itemData.purchasePrice;
        transactionItem.transactionId = savedTransaction.id;
        transactionItem.isAgroProduct = true; // Always true for agro transactions
        transactionItem.agroProductId = itemData.agroProductId;
        transactionItem.name = itemData.name || agroProduct.name;
        transactionItem.productType = itemData.productType || "agro";
        transactionItem.unit = itemData.unit || agroProduct.unitOfMeasure;

        // Optional fields
        if (itemData.subUnit) transactionItem.subUnit = itemData.subUnit;
        if (itemData.conversionFactor) {
          transactionItem.conversionFactor = parseFloat(
            itemData.conversionFactor.toString()
          );
        }

        const savedItem = await queryRunner.manager.save(transactionItem);
        transactionItems.push(savedItem);
      }

      savedTransaction.items = transactionItems;
      await queryRunner.commitTransaction();

      // Log for sync
      await this.syncService.logChange(
        "Transaction",
        savedTransaction.id,
        SyncOperation.CREATE,
        savedTransaction,
        transactionData.userId,
        transactionData.branchId
      );

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createTransaction(transactionData: {
    amount: number;
    paymentMethod: "cash" | "mtn_momo" | "airtel_money";
    customerName?: string;
    customerPhone?: string;
    items: Array<{
      itemId: string;
      price: number;
      quantity: number;
      purchasePrice?: number;
      name?: string;
      productType?: string;
      unit?: string;
      subUnit?: string;
      conversionFactor?: number;
    }>;
    branchId: string;
    userId: string;
    localId?: string;
  }) {
    // First check transaction limits
    const limitCheck = await this.checkTransactionLimit(transactionData.userId);
    if (!limitCheck.canProceed) {
      throw new ApiError(
        403,
        limitCheck.message || "Transaction limit reached"
      );
    }
    // First check for duplicate by localId
    if (transactionData.localId) {
      const existing = await this.getTransactionByLocalId(
        transactionData.localId
      );
      if (existing) {
        // Return existing transaction if found
        return existing;
      }
    }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate the 6-digit ID
      const transactionId =
        await this.transactionIdService.generateUniqueTransactionId();
      // Create the transaction
      const transaction = this.transactionRepository.create({
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
        customerName: transactionData.customerName || null,
        customerPhone: transactionData.customerPhone || null,
        branchId: transactionData.branchId,
        userId: transactionData.userId,
        transactionId,
        timestamp: new Date(),
        localId: transactionData.localId || null,
      } as DeepPartial<Transaction>);

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Create transaction items and update stock
      const transactionItems: TransactionItem[] = [];

      for (const itemData of transactionData.items) {
        const item = await this.itemRepository.findOne({
          where: { id: itemData.itemId, isDeleted: false },
        });

        if (!item) {
          throw new ApiError(404, `Item with ID ${itemData.itemId} not found`);
        }

        if ((item.stockQuantity || 0) < itemData.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for item ${item.name}. Available: ${item.stockQuantity}, Requested: ${itemData.quantity}`
          );
        }

        // Create transaction item with proper typing
        const transactionItem = new TransactionItem();
        transactionItem.price = itemData.price;
        transactionItem.quantity = itemData.quantity;
        transactionItem.purchasePrice =
          itemData.purchasePrice ?? item.purchasePrice ?? undefined;
        transactionItem.transactionId = savedTransaction.id;
        transactionItem.itemId = itemData.itemId;
        transactionItem.name = itemData.name || item.name;
        transactionItem.productType = itemData.productType || item.productType;
        transactionItem.unit = itemData.unit || item.unit;
        transactionItem.subUnit = itemData.subUnit || item.subUnit;
        transactionItem.conversionFactor = itemData.conversionFactor
          ? parseFloat(itemData.conversionFactor.toString())
          : typeof item.conversionFactor === "number"
            ? item.conversionFactor
            : undefined;

        // Update item stock
        if (item.productType !== "service") {
          item.stockQuantity = (item.stockQuantity || 0) - itemData.quantity;
          await queryRunner.manager.save(item);
        }
        const savedItem = await queryRunner.manager.save(transactionItem);
        transactionItems.push(savedItem);
      }

      savedTransaction.items = transactionItems;
      await queryRunner.commitTransaction();

      // Log for sync
      await this.syncService.logChange(
        "Transaction",
        savedTransaction.id,
        SyncOperation.CREATE,
        savedTransaction,
        transactionData.userId,
        transactionData.branchId
      );

      return savedTransaction;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      // Handle unique constraint violation specifically
      if (error.code === "23505" && error.constraint?.includes("localId")) {
        // If duplicate localId error, try to fetch the existing transaction
        if (transactionData.localId) {
          const existing = await this.getTransactionByLocalId(
            transactionData.localId
          );
          if (existing) {
            return existing;
          }
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createCustomAmountTransaction(transactionData: {
    amount: number;
    paymentMethod: "cash" | "mtn_momo" | "airtel_money";
    customerName?: string;
    customerPhone?: string;
    branchId: string;
    userId: string;
    customItemName?: string;
    localId?: string;
  }) {
    // First check transaction limits
    const limitCheck = await this.checkTransactionLimit(transactionData.userId);
    if (!limitCheck.canProceed) {
      throw new ApiError(
        403,
        limitCheck.message || "Transaction limit reached"
      );
    }

    // The public method now uses a transaction, and calls the internal method
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedTransaction =
        await this._createCustomAmountTransactionInternal(
          transactionData,
          queryRunner.manager
        );
      await queryRunner.commitTransaction();

      // Log for sync (outside the transaction logic passed to internal method)
      await this.syncService.logChange(
        "Transaction",
        savedTransaction.id,
        SyncOperation.CREATE,
        savedTransaction,
        transactionData.userId,
        transactionData.branchId
      );
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Internal method that accepts an EntityManager
  public async _createCustomAmountTransactionInternal(
    transactionData: {
      amount: number;
      paymentMethod: "cash" | "mtn_momo" | "airtel_money";
      customerName?: string;
      customerPhone?: string;
      branchId: string;
      userId: string;
      customItemName?: string;
      localId?: string;
    },
    manager: import("typeorm").EntityManager
  ): Promise<Transaction> {
    // Generate the 6-digit ID - this can be done before saving if it doesn't involve the manager for generation itself.
    // If transactionIdService needs the manager, it should be passed. Assuming it doesn't for now.
    const transactionId =
      await this.transactionIdService.generateUniqueTransactionId();

    // Create the transaction
    const transaction = manager.create(Transaction, {
      amount: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      customerName: transactionData.customerName || null,
      customerPhone: transactionData.customerPhone || null,
      branchId: transactionData.branchId,
      userId: transactionData.userId,
      transactionId,
      timestamp: new Date(),
      isCustomAmount: true,
      customItemName: transactionData.customItemName || null,
      localId: transactionData.localId || null,
    } as DeepPartial<Transaction>);

    const savedTransaction = await manager.save(transaction);
    // Note: Sync log is handled by the caller public method after commit.
    return savedTransaction;
  }

  async getTransactions(
    branchId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
      customerPhone?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.items", "items")
      .leftJoinAndSelect("items.item", "item")
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.isDeleted = false");

    if (filters?.startDate) {
      queryBuilder.andWhere("transaction.timestamp >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("transaction.timestamp <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters?.paymentMethod) {
      queryBuilder.andWhere("transaction.paymentMethod = :paymentMethod", {
        paymentMethod: filters.paymentMethod,
      });
    }

    if (filters?.customerPhone) {
      queryBuilder.andWhere("transaction.customerPhone = :customerPhone", {
        customerPhone: filters.customerPhone,
      });
    }

    const page = filters?.page || 1;
    // const limit = filters?.limit || 20;
    const limit = filters?.limit || this.defaultPageLimit;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("transaction.timestamp", "DESC");

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
async getTransactionsWithSummary(
  branchId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: string;
    customerPhone?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  // Main query builder for transactions
  const queryBuilder = this.transactionRepository
    .createQueryBuilder("transaction")
    .leftJoinAndSelect("transaction.items", "items")
    .leftJoinAndSelect("items.item", "item")
    .where("transaction.branchId = :branchId", { branchId })
    .andWhere("transaction.isDeleted = false");

  // Apply filters to both main query and summary
  if (filters?.startDate) {
    queryBuilder.andWhere("transaction.timestamp >= :startDate", {
      startDate: filters.startDate,
    });
  }

  if (filters?.endDate) {
    queryBuilder.andWhere("transaction.timestamp <= :endDate", {
      endDate: filters.endDate,
    });
  }

  if (filters?.paymentMethod) {
    queryBuilder.andWhere("transaction.paymentMethod = :paymentMethod", {
      paymentMethod: filters.paymentMethod,
    });
  }

  if (filters?.customerPhone) {
    queryBuilder.andWhere("transaction.customerPhone = :customerPhone", {
      customerPhone: filters.customerPhone,
    });
  }

  // Get summary data first (with same filters)
  const summaryQuery = this.transactionRepository
    .createQueryBuilder("transaction")
    .select("COUNT(transaction.id)", "totalTransactions")
    .addSelect("COALESCE(SUM(transaction.amount), 0)", "totalRevenue") // Changed from totalAmount to amount
    .where("transaction.branchId = :branchId", { branchId })
    .andWhere("transaction.isDeleted = false");

  // Apply same filters to summary query
  if (filters?.startDate) {
    summaryQuery.andWhere("transaction.timestamp >= :startDate", {
      startDate: filters.startDate,
    });
  }
  if (filters?.endDate) {
    summaryQuery.andWhere("transaction.timestamp <= :endDate", {
      endDate: filters.endDate,
    });
  }
  if (filters?.paymentMethod) {
    summaryQuery.andWhere("transaction.paymentMethod = :paymentMethod", {
      paymentMethod: filters.paymentMethod,
    });
  }
  if (filters?.customerPhone) {
    summaryQuery.andWhere("transaction.customerPhone = :customerPhone", {
      customerPhone: filters.customerPhone,
    });
  }

  const summaryResult = await summaryQuery.getRawOne();

  // Pagination for main query
  const page = filters?.page || 1;
  const limit = filters?.limit || this.defaultPageLimit;
  const skip = (page - 1) * limit;

  queryBuilder.skip(skip).take(limit);
  queryBuilder.orderBy("transaction.timestamp", "DESC");

  const [transactions, total] = await queryBuilder.getManyAndCount();

  // Calculate average transaction value
  const avgValue = summaryResult.totalTransactions > 0 
    ? Number(summaryResult.totalRevenue) / Number(summaryResult.totalTransactions)
    : 0;

  return {
    transactions,
    summary: {
      totalTransactions: Number(summaryResult.totalTransactions) || 0,
      totalRevenue: Number(summaryResult.totalRevenue) || 0,
      averageTransactionValue: parseFloat(avgValue.toFixed(2)),
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["items", "items.item"],
    });

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return transaction;
  }

  async getTransactionByTransactionId(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId, isDeleted: false },
      relations: ["items", "items.item"],
    });

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return transaction;
  }

  // In your TransactionService
  async deleteTransaction(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["items", "items.item", "items.agroProduct"], // Load related items
    });

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    // Restore stock quantities before deletion
    await this.restoreStockQuantities(transaction.items);

    // Soft delete the transaction
    transaction.isDeleted = true;
    await this.transactionRepository.save(transaction);

    // Soft delete all associated transaction items
    if (transaction.items && transaction.items.length > 0) {
      await this.transactionItemRepository.update(
        { transactionId: id },
        { isDeleted: true }
      );
    }

    // Log for sync
    await this.syncService.logChange(
      "Transaction",
      transaction.id,
      SyncOperation.DELETE,
      transaction,
      userId,
      transaction.branchId
    );

    return { message: "Transaction deleted successfully" };
  }

  private async restoreStockQuantities(items: TransactionItem[]) {
    for (const item of items) {
      if (item.item) {
        // For regular items
        await this.itemRepository.increment(
          { id: item.item.id },
          "stockQuantity",
          item.quantity
        );

        // Log stock movement
        await this.itemService.createStockMovement({
          itemId: item.item.id,
          quantity: item.quantity,
          type: MovementType.ADJUSTMENT,
          reason: `Stock restored from deleted transaction`,
          previousStock: item.item.stockQuantity,
          newStock: item.item.stockQuantity + item.quantity,
        });
      } else if (item.agroProduct) {
        // For agro products
        await this.agroProductRepository.increment(
          { id: item.agroProduct.id },
          "stockQuantity",
          item.quantity
        );

        // Log stock movement for agro product
        await this.itemService.createStockMovement({
          itemId: item.agroProduct.id,
          quantity: item.quantity,
          type: MovementType.ADJUSTMENT,
          reason: `Stock restored from deleted transaction`,
          previousStock: item.agroProduct.totalStockQuantity,
          newStock: item.agroProduct.totalStockQuantity + item.quantity,
          // isAgroProduct: true,
        });
      }
    }
  }

  // async deleteTransaction(id: string, userId: string) {
  //   const transaction = await this.transactionRepository.findOne({
  //     where: { id, isDeleted: false },
  //   });

  //   if (!transaction) {
  //     throw new ApiError(404, "Transaction not found");
  //   }

  //   transaction.isDeleted = true;
  //   await this.transactionRepository.save(transaction);

  //   // Log for sync
  //   await this.syncService.logChange(
  //     "Transaction",
  //     transaction.id,
  //     SyncOperation.DELETE,
  //     transaction,
  //     userId,
  //     transaction.branchId
  //   );

  //   return { message: "Transaction deleted successfully" };
  // }

  async countUserTransactions(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.isDeleted = false");

    if (startDate) {
      queryBuilder.andWhere("transaction.timestamp >= :startDate", {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere("transaction.timestamp <= :endDate", { endDate });
    }

    return queryBuilder.getCount();
  }

  async checkTransactionLimit(
    userId: string
  ): Promise<{ canProceed: boolean; message?: string }> {
    try {
      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const activeSubscription = await subscriptionRepo.findOne({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          endDate: MoreThanOrEqual(new Date()),
        },
        relations: ["plan"],
      });

      if (!activeSubscription) {
        throw new ApiError(403, "No active subscription found");
      }

      if (activeSubscription.plan.maxTransactions === 0) {
        return { canProceed: true };
      }

      const transactionCount = await this.countUserTransactions(
        userId,
        activeSubscription.startDate,
        activeSubscription.endDate
      );

      if (transactionCount >= activeSubscription.plan.maxTransactions) {
        throw new ApiError(
          403,
          `You have reached your subscription limit of ${activeSubscription.plan.maxTransactions} transactions. Please upgrade your plan.`
        );
      }

      return { canProceed: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Error checking transaction limit");
    }
  }

  async getTransactionByLocalId(localId: string) {
    return this.transactionRepository.findOne({ where: { localId } });
  }
}
