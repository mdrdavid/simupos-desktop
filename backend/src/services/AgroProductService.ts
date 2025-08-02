import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { AgroProduct, StockShipment } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { AgroProductVariant } from "../models/AgroProductVariant";

export class AgroProductService {
  private productRepository: Repository<AgroProduct>;
  private shipmentRepository: Repository<StockShipment>;
  private variantRepository: Repository<AgroProductVariant>;
  private syncService: SyncService;

  constructor() {
    this.productRepository = AppDataSource.getRepository(AgroProduct);
    this.variantRepository = AppDataSource.getRepository(AgroProductVariant);
    this.shipmentRepository = AppDataSource.getRepository(StockShipment);

    this.syncService = new SyncService();
  }

  async createProductWeb(productData: Partial<AgroProduct>, userId: string) {
    const product = this.productRepository.create(productData);
    return await this.productRepository.save(product);
  }
  async createProduct(productData: Partial<AgroProduct>, userId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the product
      const product = this.productRepository.create(productData);
      await queryRunner.manager.save(product);

      // Create initial stock shipment if initial stock is provided
      if (
        productData.totalStockQuantity &&
        productData.totalStockQuantity > 0
      ) {
        const initialShipment = this.shipmentRepository.create({
          product,
          quantity: productData.totalStockQuantity,
          costPrice: productData.currentAverageCostPrice || 0,
          currency: productData.baseCurrency || "UGX",
          receivedDate: new Date(),
          branchId: product.branchId,
          type: "INITIAL",
          notes: "Initial stock",
          userId,
        });
        await queryRunner.manager.save(initialShipment);
      }

      await queryRunner.commitTransaction();

      await this.syncService.logChange(
        "AgroProduct",
        product.id,
        SyncOperation.CREATE,
        product,
        userId,
        product.branchId
      );

      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createVariant(
    productId: string,
    variantData: Partial<AgroProductVariant>
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const variant = this.variantRepository.create({
      ...variantData,
      product,
    });

    return await this.variantRepository.save(variant);
  }

  async addStockShipmentWeb(
    productId: string,
    variantId: string | null,
    shipmentData: Partial<StockShipment>
  ) {
    let product: AgroProduct | null = null;
    let variant: AgroProductVariant | null = null;

    if (variantId) {
      variant = await this.variantRepository.findOne({
        where: { id: variantId },
        relations: ["product"],
      });
      if (!variant) {
        throw new ApiError(404, "Variant not found");
      }
      product = variant.product;
    } else {
      product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new ApiError(404, "Product not found");
      }
    }

    const shipment = this.shipmentRepository.create({
      ...shipmentData,
      product: variant ? null : product,
      variant,
      branchId: product.branchId,
    });

    await this.shipmentRepository.save(shipment);

    // Recalculate stock for product or variant
    if (variant) {
      await this.recalculateVariantStock(variant.id);
    } else {
      await this.recalculateProductStock(product.id);
    }

    return shipment;
  }

  async addStockShipment(
    productId: string,
    shipmentData: Partial<StockShipment>,
    userId: string
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const shipment = this.shipmentRepository.create({
      ...shipmentData,
      product,
      branchId: product.branchId,
    });
    await this.shipmentRepository.save(shipment);

    // Recalculate average cost and total quantity
    await this.recalculateProductStock(productId);

    await this.syncService.logChange(
      "StockShipment",
      shipment.id,
      SyncOperation.CREATE,
      shipment,
      userId,
      product.branchId
    );

    return shipment;
  }

  async recalculateProductStock(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ["stockShipments"],
    });

    if (!product) return;

    let totalCostInBaseCurrency = 0;
    let totalQuantityForAvgCost = 0;
    let overallTotalStockQuantity = 0;

    product.stockShipments.forEach((shipment) => {
      // Ensure quantities are properly parsed as numbers
      const shipmentQuantity = parseFloat(shipment.quantity.toString());
      const shipmentCostPrice = parseFloat(shipment.costPrice.toString());

      overallTotalStockQuantity += shipmentQuantity;
      if (shipment.currency === product.baseCurrency) {
        totalCostInBaseCurrency += shipmentCostPrice * shipmentQuantity;
        totalQuantityForAvgCost += shipmentQuantity;
      }
    });

    // Calculate average cost safely
    product.currentAverageCostPrice =
      totalQuantityForAvgCost > 0
        ? parseFloat(
            (totalCostInBaseCurrency / totalQuantityForAvgCost).toFixed(2)
          )
        : 0;

    product.totalStockQuantity = parseFloat(
      overallTotalStockQuantity.toFixed(2)
    );

    await this.productRepository.save(product);
  }
  async recalculateVariantStock(variantId: string) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ["stockShipments"],
    });

    if (!variant) return;

    let totalCostInBaseCurrency = 0;
    let totalQuantityForAvgCost = 0;
    let overallTotalStockQuantity = 0;

    variant.stockShipments.forEach((shipment) => {
      const shipmentQuantity = parseFloat(shipment.quantity.toString());
      const shipmentCostPrice = parseFloat(shipment.costPrice.toString());

      overallTotalStockQuantity += shipmentQuantity;
      if (shipment.currency === variant.product.baseCurrency) {
        totalCostInBaseCurrency += shipmentCostPrice * shipmentQuantity;
        totalQuantityForAvgCost += shipmentQuantity;
      }
    });

    variant.currentAverageCostPrice =
      totalQuantityForAvgCost > 0
        ? parseFloat(
            (totalCostInBaseCurrency / totalQuantityForAvgCost).toFixed(2)
          )
        : 0;

    variant.totalStockQuantity = parseFloat(
      overallTotalStockQuantity.toFixed(2)
    );

    await this.variantRepository.save(variant);
  }

  async getProductsByBranch(
    branchId: string,
    filters?: {
      search?: string;
      category?: string;
      lowStock?: boolean;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .where("product.branchId = :branchId", { branchId })
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("product.stockShipments", "shipments");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(product.name ILIKE :search OR product.productCode ILIKE :search)",
        {
          search: `%${filters.search}%`,
        }
      );
    }

    if (filters?.category) {
      queryBuilder.andWhere("product.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.lowStock) {
      queryBuilder.andWhere(
        "product.totalStockQuantity <= product.minStockLevel"
      );
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("product.name", "ASC");

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<any> {
    const item = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["branch"],
    });

    if (!item) {
      throw new ApiError(404, "Item not found");
    }

    return item;
  }

  async updateProductStock(
    productId: string,
    quantityChange: number,
    reason?: string,
    userId?: string
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ["stockShipments"],
    });

    if (!product) {
      throw new ApiError(404, "Agro product not found");
    }

    const newQuantity = product.totalStockQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new ApiError(400, "Insufficient stock for this adjustment");
    }

    // Create a stock movement record
    const movement = await this.shipmentRepository.create({
      product,
      quantity: quantityChange,
      costPrice: product.currentAverageCostPrice,
      currency: product.baseCurrency,
      receivedDate: new Date(),
      branchId: product.branchId,
      type: quantityChange > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
      notes: reason || "Manual stock adjustment",
      userId,
    });
    await this.shipmentRepository.save(movement);

    // Update product stock
    product.totalStockQuantity = newQuantity;
    await this.productRepository.save(product);

    // Log for sync
    if (userId) {
      await this.syncService.logChange(
        "AgroProduct",
        product.id,
        SyncOperation.UPDATE,
        product,
        userId,
        product.branchId
      );
    }

    return product;
  }

  // ... other CRUD methods
}
