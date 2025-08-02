import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { SaleStatus } from "../models/Sale";
import { SaleItem, Item, StockMovement, Sale } from "../models";
import { MovementType } from "../models/StockMovement";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
export class SaleService {
  private saleRepository: Repository<Sale>;
  private saleItemRepository: Repository<SaleItem>;
  private itemRepository: Repository<Item>;
  private stockMovementRepository: Repository<StockMovement>;
  private syncService: SyncService;

  constructor() {
    this.saleRepository = AppDataSource.getRepository(Sale);
    this.saleItemRepository = AppDataSource.getRepository(SaleItem);
    this.itemRepository = AppDataSource.getRepository(Item);
    this.stockMovementRepository = AppDataSource.getRepository(StockMovement);
    this.syncService = new SyncService();
  }

  async createSale(saleData: {
    items: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>;
    paymentMethod: string;
    amountPaid: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    userId: string;
    branchId: string;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate items and check stock
      const items = await this.itemRepository.findByIds(
        saleData.items.map((item) => item.itemId),
      );

      if (items.length !== saleData.items.length) {
        throw new ApiError(400, "Some items not found");
      }

      // Check stock availability
      for (const saleItem of saleData.items) {
        const item = items.find((i) => i.id === saleItem.itemId);
        if (!item) {
          throw new ApiError(400, `Item not found: ${saleItem.itemId}`);
        }
        if (item.stockQuantity < saleItem.quantity) {
          throw new ApiError(400, `Insufficient stock for item: ${item.name}`);
        }
      }

      // Calculate totals
      let subtotal = 0;
      const saleItems: Partial<SaleItem>[] = [];

      for (const saleItemData of saleData.items) {
        const item = items.find((i) => i.id === saleItemData.itemId)!;
        const total =
          saleItemData.unitPrice * saleItemData.quantity -
          (saleItemData.discount || 0);
        subtotal += total;

        saleItems.push({
          itemId: saleItemData.itemId,
          quantity: saleItemData.quantity,
          unitPrice: saleItemData.unitPrice,
          unitCost: item.purchasePrice,
          total,
          discount: saleItemData.discount || 0,
        });
      }

      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      const change = saleData.amountPaid - total;

      if (change < 0) {
        throw new ApiError(400, "Insufficient payment amount");
      }

      // Generate sale number
      const saleNumber = await this.generateSaleNumber(saleData.branchId);

      // Create sale
      const sale = queryRunner.manager.create(Sale, {
        saleNumber,
        subtotal,
        tax,
        total,
        amountPaid: saleData.amountPaid,
        change,
        paymentMethod: saleData.paymentMethod as any,
        status: SaleStatus.COMPLETED,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        notes: saleData.notes,
        userId: saleData.userId,
        branchId: saleData.branchId,
      });

      await queryRunner.manager.save(sale);

      // Create sale items and update stock
      for (const saleItemData of saleItems) {
        const saleItem = queryRunner.manager.create(SaleItem, {
          ...saleItemData,
          saleId: sale.id,
        });
        await queryRunner.manager.save(saleItem);

        // Update item stock
        const item = items.find((i) => i.id === saleItemData.itemId)!;
        const previousStock = item.stockQuantity;
        const newStock = previousStock - saleItemData.quantity!;

        await queryRunner.manager.update(Item, item.id, { stockQuantity: newStock });

        // Create stock movement
        const stockMovement = queryRunner.manager.create(StockMovement, {
          itemId: item.id,
          type: MovementType.SALE,
          quantity: saleItemData.quantity!,
          previousStock,
          newStock,
          reason: "Sale",
          reference: sale.id,
          userId: saleData.userId,
          unitCost: item.purchasePrice,
        });
        await queryRunner.manager.save(stockMovement);
      }

      await queryRunner.commitTransaction();

      // Log for sync
      await this.syncService.logChange(
        "Sale",
        sale.id,
        SyncOperation.CREATE,
        sale,
        saleData.userId,
        saleData.branchId,
      );

      // Return sale with items
      return await this.getSaleById(sale.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSales(
    branchId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: SaleStatus;
      customerName?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder("sale")
      .leftJoinAndSelect("sale.items", "items")
      .leftJoinAndSelect("items.item", "item")
      .leftJoinAndSelect("sale.user", "user")
      .where("sale.branchId = :branchId", { branchId })
      .andWhere("sale.isDeleted = false");

    if (filters?.startDate) {
      queryBuilder.andWhere("sale.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("sale.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere("sale.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.customerName) {
      queryBuilder.andWhere("sale.customerName ILIKE :customerName", {
        customerName: `%${filters.customerName}%`,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("sale.createdAt", "DESC");

    const [sales, total] = await queryBuilder.getManyAndCount();

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSaleById(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["items", "items.item", "user", "branch"],
    });

    if (!sale) {
      throw new ApiError(404, "Sale not found");
    }

    return sale;
  }

  async getSalesAnalytics(
    branchId: string,
    period?: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    let queryBuilder = this.saleRepository
      .createQueryBuilder("sale")
      .leftJoinAndSelect("sale.items", "items")
      .leftJoinAndSelect("items.item", "item")
      .where("sale.branchId = :branchId", { branchId })
      .andWhere("sale.isDeleted = false")
      .andWhere("sale.status = :status", { status: SaleStatus.COMPLETED });

    if (period?.startDate) {
      queryBuilder = queryBuilder.andWhere("sale.createdAt >= :startDate", {
        startDate: period.startDate,
      });
    }

    if (period?.endDate) {
      queryBuilder = queryBuilder.andWhere("sale.createdAt <= :endDate", {
        endDate: period.endDate,
      });
    }

    const sales = await queryBuilder.getMany();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number.parseFloat(sale.total.toString()),
      0,
    );
    const totalProfit = sales.reduce((sum, sale) => {
      return (
        sum + sale.items.reduce((itemSum, item) => itemSum + item.profit, 0)
      );
    }, 0);

    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Top selling items
    const itemSales: {
      [key: string]: { item: Item; quantity: number; revenue: number };
    } = {};

    sales.forEach((sale) => {
      sale.items.forEach((saleItem) => {
        const key = saleItem.item.id;
        if (!itemSales[key]) {
          itemSales[key] = {
            item: saleItem.item,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[key].quantity += saleItem.quantity;
        itemSales[key].revenue += Number.parseFloat(saleItem.total.toString());
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Daily sales for the period
    const dailySales: {
      [key: string]: { date: string; sales: number; revenue: number };
    } = {};

    sales.forEach((sale) => {
      const date = sale.createdAt.toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, sales: 0, revenue: 0 };
      }
      dailySales[date].sales += 1;
      dailySales[date].revenue += Number.parseFloat(sale.total.toString());
    });

    return {
      totalSales,
      totalRevenue,
      totalProfit,
      averageSaleValue,
      profitMargin,
      topSellingItems,
      dailySales: Object.values(dailySales).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    };
  }

  private async generateSaleNumber(branchId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

    const lastSale = await this.saleRepository.findOne({
      where: { branchId },
      order: { createdAt: "DESC" },
    });

    let sequence = 1;
    if (lastSale && lastSale.saleNumber.includes(dateStr)) {
      const lastSequence = Number.parseInt(
        lastSale.saleNumber.split("-").pop() || "0",
      );
      sequence = lastSequence + 1;
    }

    return `SALE-${dateStr}-${sequence.toString().padStart(4, "0")}`;
  }
}
