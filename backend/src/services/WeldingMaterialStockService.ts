import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { WeldingMaterialStock } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";

export class WeldingMaterialStockService {
  private stockRepository: Repository<WeldingMaterialStock>;
  private syncService: SyncService;

  constructor() {
    this.stockRepository = AppDataSource.getRepository(WeldingMaterialStock);
    this.syncService = new SyncService();
  }

  async createStockItem(
    stockData: Partial<WeldingMaterialStock>,
    userId: string
  ) {
    const stockItem = this.stockRepository.create(stockData);
    await this.stockRepository.save(stockItem);

    await this.syncService.logChange(
      "WeldingMaterialStock",
      stockItem.id,
      SyncOperation.CREATE,
      stockItem,
      userId,
      stockItem.branchId
    );

    return stockItem;
  }

  async updateStockItem(
    stockId: string,
    updates: Partial<WeldingMaterialStock>,
    userId: string
  ) {
    const stockItem = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stockItem) {
      throw new ApiError(404, "Stock item not found");
    }

    const updatedItem = this.stockRepository.merge(stockItem, updates);
    await this.stockRepository.save(updatedItem);

    await this.syncService.logChange(
      "WeldingMaterialStock",
      stockItem.id,
      SyncOperation.UPDATE,
      updatedItem,
      userId,
      stockItem.branchId
    );

    return updatedItem;
  }

  async deleteStockItem(stockId: string, userId: string) {
    const stockItem = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stockItem) {
      throw new ApiError(404, "Stock item not found");
    }

    stockItem.isDeleted = true;
    await this.stockRepository.save(stockItem);

    await this.syncService.logChange(
      "WeldingMaterialStock",
      stockItem.id,
      SyncOperation.DELETE,
      stockItem,
      userId,
      stockItem.branchId
    );

    return { message: "Stock item marked as deleted" };
  }

  async getStockItemById(stockId: string) {
    const stockItem = await this.stockRepository.findOne({
      where: { id: stockId, isDeleted: false },
      relations: ["branch"],
    });

    if (!stockItem) {
      throw new ApiError(404, "Stock item not found");
    }

    return stockItem;
  }

  async getStockByBranch(
    branchId: string,
    filters: {
      lowStock?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const queryBuilder = this.stockRepository
      .createQueryBuilder("stock")
      .where("stock.branchId = :branchId", { branchId })
      .andWhere("stock.isDeleted = false");

    if (filters.lowStock) {
      queryBuilder.andWhere("stock.quantityInStock <= stock.lowStockThreshold");
    }

    if (filters.search) {
      queryBuilder.andWhere("stock.name ILIKE :search", {
        search: `%${filters.search}%`,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("stock.name", "ASC");

    const [stockItems, total] = await queryBuilder.getManyAndCount();

    return {
      stockItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async consumeMaterialFromStock(
    stockId: string,
    quantity: number,
    userId: string
  ) {
    const stockItem = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stockItem) {
      throw new ApiError(404, "Stock item not found");
    }

    if (stockItem.quantityInStock < quantity) {
      throw new ApiError(400, "Insufficient stock available");
    }

    stockItem.quantityInStock -= quantity;
    await this.stockRepository.save(stockItem);

    await this.syncService.logChange(
      "WeldingMaterialStock",
      stockItem.id,
      SyncOperation.UPDATE,
      stockItem,
      userId,
      stockItem.branchId
    );

    return stockItem;
  }

  async restockMaterial(
    stockId: string,
    quantity: number,
    supplierInfo?: string,
    userId?: string
  ) {
    const stockItem = await this.stockRepository.findOne({
      where: { id: stockId },
    });
    if (!stockItem) {
      throw new ApiError(404, "Stock item not found");
    }

    stockItem.quantityInStock += quantity;
    stockItem.lastRestockDate = new Date();
    if (supplierInfo) {
      stockItem.supplierInfo = supplierInfo;
    }

    await this.stockRepository.save(stockItem);

    if (userId) {
      await this.syncService.logChange(
        "WeldingMaterialStock",
        stockItem.id,
        SyncOperation.UPDATE,
        stockItem,
        userId,
        stockItem.branchId
      );
    }

    return stockItem;
  }
}
