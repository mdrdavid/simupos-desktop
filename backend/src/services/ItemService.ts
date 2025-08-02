import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Item, StockMovement } from "../models";
import { MovementType } from "../models/StockMovement";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { FrontendItem } from "../types/item.types";
import { ItemTransformer } from "./transformer";

export class ItemService {
  private itemRepository: Repository<Item>;
  private stockMovementRepository: Repository<StockMovement>;
  private syncService: SyncService;
  private defaultPageLimit = 200;

  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
    this.stockMovementRepository = AppDataSource.getRepository(StockMovement);
    this.syncService = new SyncService();
  }

  async createItem(
    itemData: FrontendItem,
    userId: string
  ): Promise<FrontendItem> {
    const itemToCreate = ItemTransformer.toBackend(itemData);
    // Check for duplicate barcode in the same branch
    if (itemData.barcode) {
      const existingItem = await this.itemRepository.findOne({
        where: {
          barcode: itemData.barcode,
          branchId: itemData.branchId,
          isDeleted: false,
        },
      });

      if (existingItem) {
        throw new ApiError(
          400,
          "Item with this barcode already exists in this branch"
        );
      }
    }
    const item = this.itemRepository.create({
      ...itemToCreate,
      createdBy: userId,
    });

    await this.itemRepository.save(item);
    return ItemTransformer.toFrontend(item);
  }

  async getItemById(id: string): Promise<FrontendItem> {
    const item = await this.itemRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["branch"],
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    return ItemTransformer.toFrontend(item);
  }

  async updateItem(
    id: string,
    updateData: Partial<FrontendItem>,
    userId: string
  ): Promise<FrontendItem> {
    const item = await this.itemRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    // Transform frontend data to backend model
    const backendUpdate = ItemTransformer.toBackend({
      ...item,
      ...updateData,
    });

    // Handle stock changes
    if (
      backendUpdate.stockQuantity !== undefined &&
      backendUpdate.stockQuantity !== item.stockQuantity
    ) {
      const stockDifference = backendUpdate.stockQuantity - item.stockQuantity;
      const movementType =
        stockDifference > 0 ? MovementType.IN : MovementType.OUT;

      await this.createStockMovement({
        itemId: item.id,
        type: movementType,
        quantity: Math.abs(stockDifference),
        previousStock: item.stockQuantity,
        newStock: backendUpdate.stockQuantity,
        reason: "Stock adjustment",
        userId,
        unitCost: item.purchasePrice,
      });
    }

    // Apply updates
    Object.assign(item, backendUpdate);
    await this.itemRepository.save(item);

    // Log for sync
    await this.syncService.logChange(
      "Item",
      item.id,
      SyncOperation.UPDATE,
      item,
      userId,
      item.branchId
    );

    return ItemTransformer.toFrontend(item);
  }

  async getItems(
    branchId: string,
    filters?: {
      search?: string;
      category?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<{ items: FrontendItem[]; pagination: any }> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder("item")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("item.isDeleted = false");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(item.name ILIKE :search OR item.barcode ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.category) {
      queryBuilder.andWhere("item.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.lowStock) {
      queryBuilder.andWhere("item.stockQuantity <= item.minStockLevel");
    }

    if (filters?.outOfStock) {
      queryBuilder.andWhere("item.stockQuantity <= 0");
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || this.defaultPageLimit;
    // const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("item.name", "ASC");

    const [items, total] = await queryBuilder.getManyAndCount();
    console.log("limit", limit);
    return {
      items: items.map((item) => ItemTransformer.toFrontend(item)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getItemsWithTotals(
    branchId: string,
    filters?: {
      search?: string;
      category?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    items: FrontendItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stockSummary: {
      totalItems: number;
      totalItemsInStock: number;
      totalStockValue: number;
    };
  }> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder("item")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("item.isDeleted = false");

    // Apply filters
    if (filters?.search) {
      queryBuilder.andWhere(
        "(item.name ILIKE :search OR item.barcode ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.category) {
      queryBuilder.andWhere("item.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.lowStock) {
      queryBuilder.andWhere("item.stockQuantity <= item.minStockLevel");
    }

    if (filters?.outOfStock) {
      queryBuilder.andWhere("item.stockQuantity <= 0");
    }

    // Get stock summary
    let stockSummary = {
      totalItems: 0, // New field for count of distinct items
      totalItemsInStock: 0, // Existing sum of all units
      totalStockValue: 0, // Existing sum of stock value
    };

    try {
      // Get count of distinct items
      const itemsCount = await this.itemRepository.count({
        where: {
          branchId,
          isDeleted: false,
          ...(filters?.category && { category: filters.category }),
          // Add other filter conditions as needed
        },
      });

      // Get sum of all units and their value
      const summaryResult = await this.itemRepository
        .createQueryBuilder("item")
        .select("COALESCE(SUM(item.stockQuantity), 0)", "totalItemsInStock")
        .addSelect(
          "COALESCE(SUM(item.stockQuantity * item.sellingPrice), 0)",
          "totalStockValue"
        )
        .where("item.branchId = :branchId", { branchId })
        .andWhere("item.isDeleted = false")
        // Add same filters as above
        .andWhere(filters?.category ? "item.category = :category" : "1=1", {
          category: filters?.category,
        })
        .getRawOne();

      stockSummary = {
        totalItems: itemsCount,
        totalItemsInStock: Number(summaryResult?.totalItemsInStock) || 0,
        totalStockValue: Number(summaryResult?.totalStockValue) || 0,
      };
    } catch (error) {
      console.error("Error calculating stock summary:", error);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || this.defaultPageLimit;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("item.name", "ASC");

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((item) => ItemTransformer.toFrontend(item)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stockSummary,
    };
  }

  async getItemByBarcode(
    barcode: string,
    branchId: string
  ): Promise<FrontendItem> {
    const item = await this.itemRepository.findOne({
      where: { barcode, branchId, isDeleted: false },
      relations: ["branch"],
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    return ItemTransformer.toFrontend(item);
  }
  async deleteItem(id: string, userId: string) {
    const item = await this.itemRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    item.isDeleted = true;
    await this.itemRepository.save(item);

    // Log for sync
    await this.syncService.logChange(
      "Item",
      item.id,
      SyncOperation.DELETE,
      item,
      userId,
      item.branchId
    );

    return { message: "Item deleted successfully" };
  }
  async topUpStock(
    id: string,
    quantity: number,
    userId: string,
    notes?: string
  ): Promise<FrontendItem> {
    const item = await this.itemRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    const previousStock = item.stockQuantity;
    const newStock = previousStock + quantity;

    await this.createStockMovement({
      itemId: item.id,
      type: MovementType.IN,
      quantity,
      previousStock,
      newStock,
      reason: notes || "Stock top-up",
      userId,
      unitCost: item.purchasePrice,
    });

    item.stockQuantity = newStock;
    await this.itemRepository.save(item);

    // Log for sync
    await this.syncService.logChange(
      "Item",
      item.id,
      SyncOperation.UPDATE,
      item,
      userId,
      item.branchId
    );

    return ItemTransformer.toFrontend(item);
  }

  async getProductionMovements(
    branchId: string,
    filters?: {
      type?: MovementType;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const query = this.stockMovementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.item", "item")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("movement.isDeleted = false");

    if (filters?.type) {
      query.andWhere("movement.type = :type", { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere("movement.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere("movement.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    query.orderBy("movement.createdAt", "DESC");

    return query.getMany();
  }
  async getStockMovements(
    itemId: string,
    filters?: {
      type?: MovementType;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.user", "user")
      .where("movement.itemId = :itemId", { itemId })
      .andWhere("movement.isDeleted = false");

    if (filters?.type) {
      queryBuilder.andWhere("movement.type = :type", { type: filters.type });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("movement.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("movement.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || this.defaultPageLimit;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("movement.createdAt", "DESC");

    const [movements, total] = await queryBuilder.getManyAndCount();

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAllStockMovements(
    branchId: string,
    filters?: {
      type?: MovementType;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.item", "item")
      .leftJoinAndSelect("movement.user", "user")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("movement.isDeleted = false");

    if (filters?.type) {
      queryBuilder.andWhere("movement.type = :type", { type: filters.type });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("movement.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("movement.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || this.defaultPageLimit;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("movement.createdAt", "DESC");

    const [movements, total] = await queryBuilder.getManyAndCount();

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  async getInventoryAnalytics(
    branchId: string,
    period?: {
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const queryBuilder = this.itemRepository
      .createQueryBuilder("item")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("item.isDeleted = false");

    const items = await queryBuilder.getMany();

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.stockQuantity, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.sellingPrice * item.stockQuantity,
      0
    );
    const totalCost = items.reduce(
      (sum, item) => sum + (item.purchasePrice || 0) * item.stockQuantity,
      0
    );
    const totalPotentialProfit = totalValue - totalCost;
    const lowStockItems = items.filter(
      (item) => item.stockQuantity <= item.minStockLevel
    ).length;

    // Get stock movements for the period
    let movementsQuery = this.stockMovementRepository
      .createQueryBuilder("movement")
      .leftJoin("movement.item", "item")
      .where("item.branchId = :branchId", { branchId })
      .andWhere("movement.isDeleted = false");

    if (period?.startDate) {
      movementsQuery = movementsQuery.andWhere(
        "movement.createdAt >= :startDate",
        { startDate: period.startDate }
      );
    }

    if (period?.endDate) {
      movementsQuery = movementsQuery.andWhere(
        "movement.createdAt <= :endDate",
        { endDate: period.endDate }
      );
    }

    const movements = await movementsQuery.getMany();

    const stockIn = movements
      .filter((m) => m.type === MovementType.IN)
      .reduce((sum, m) => sum + m.quantity, 0);

    const stockOut = movements
      .filter(
        (m) => m.type === MovementType.OUT || m.type === MovementType.SALE
      )
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalItems,
      totalStock,
      totalValue,
      totalCost,
      totalPotentialProfit,
      profitMargin:
        totalValue > 0 ? (totalPotentialProfit / totalValue) * 100 : 0,
      lowStockItems,
      stockIn,
      stockOut,
      netStockChange: stockIn - stockOut,
      topItems: items
        .sort(
          (a, b) =>
            b.sellingPrice * b.stockQuantity - a.sellingPrice * a.stockQuantity
        )
        .slice(0, 10),
      lowStockAlerts: items
        .filter((item) => item.stockQuantity <= item.minStockLevel)
        .sort((a, b) => a.stockQuantity - b.stockQuantity),
    };
  }

  public async createStockMovement(movementData: {
    itemId: string;
    type: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    reference?: string;
    userId?: string;
    unitCost?: number;
  }) {
    const movement = this.stockMovementRepository.create(movementData);
    await this.stockMovementRepository.save(movement);
    return movement;
  }

  async produceItem(
    processedItemId: string,
    quantityToProduce: number,
    userId: string
  ): Promise<{
    inputMovements: StockMovement[];
    outputMovement: StockMovement;
    producedItem: FrontendItem;
  }> {
    const item = await this.itemRepository.findOne({
      where: { id: processedItemId, isDeleted: false },
      relations: ["rawMaterials"],
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    // Verify raw materials and calculate needs
    const inputMovements: StockMovement[] = [];

    for (const material of item.rawMaterials || []) {
      const rawItem = await this.itemRepository.findOne({
        where: { id: material.itemId, isDeleted: false },
      });

      if (!rawItem) {
        throw new ApiError(404, `Raw material ${material.itemId} not found`);
      }

      const neededQuantity = material.quantityNeeded * quantityToProduce;
      if ((rawItem.stockQuantity || 0) < neededQuantity) {
        throw new ApiError(400, `Insufficient stock for ${rawItem.name}`);
      }

      // Create input movement
      const movement = await this.createStockMovement({
        itemId: rawItem.id,
        type: MovementType.PRODUCTIONINPUT,
        quantity: -neededQuantity,
        previousStock: rawItem.stockQuantity || 0,
        newStock: (rawItem.stockQuantity || 0) - neededQuantity,
        reason: `Production of ${quantityToProduce} ${item.name}`,
        userId,
      });

      inputMovements.push(movement);

      // Update raw material stock
      rawItem.stockQuantity = (rawItem.stockQuantity || 0) - neededQuantity;
      await this.itemRepository.save(rawItem);
    }

    // Create output movement
    const outputMovement = await this.createStockMovement({
      itemId: item.id,
      type: MovementType.PRODUCTIONOUTPUT,
      quantity: quantityToProduce,
      previousStock: item.stockQuantity || 0,
      newStock: (item.stockQuantity || 0) + quantityToProduce,
      reason: "Production output",
      userId,
    });

    // Update processed item stock
    item.stockQuantity = (item.stockQuantity || 0) + quantityToProduce;
    await this.itemRepository.save(item);

    return {
      inputMovements,
      outputMovement,
      producedItem: ItemTransformer.toFrontend(item),
    };
  }
}
