
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { AgroSale, AgroProductSaleItem } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { AgroProductService } from "./AgroProductService";

export class AgroTransactionService {
  private saleRepository: Repository<AgroSale>;
  private saleItemRepository: Repository<AgroProductSaleItem>;
  private syncService: SyncService;
  private agroProductService: AgroProductService;

  constructor() {
    this.saleRepository = AppDataSource.getRepository(AgroSale);
    this.saleItemRepository = AppDataSource.getRepository(AgroProductSaleItem);
    this.syncService = new SyncService();
    this.agroProductService = new AgroProductService();
  }

  async createSale(saleData: {
    saleDate: Date;
    items: Array<{
      agroProductId: string;
      quantity: number;
      unitPrice: number;
      productName: string;
      unitOfMeasure: string;
    }>;
    totalAmount: number;
    currency: string;
    isCreditSale: boolean;
    amountPaid: number;
    customerDetails?: {
      name: string;
      phoneNumber?: string;
      address?: string;
    };
    paymentMethod?: "cash" | "mobile_money" | "bank_transfer" | "other";
    branchId: string;
    userId: string;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the sale
      const sale = this.saleRepository.create({
        saleDate: saleData.saleDate,
        totalAmount: saleData.totalAmount,
        currency: saleData.currency || "UGX",
        isCreditSale: saleData.isCreditSale,
        amountPaid: saleData.amountPaid,
        balanceDue: saleData.totalAmount - (saleData.amountPaid || 0),
        customerDetails: saleData.customerDetails,
        paymentMethod: saleData.paymentMethod,
        branchId: saleData.branchId,
        userId: saleData.userId,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Create sale items and update product stock
      const saleItems: AgroProductSaleItem[] = [];
      for (const item of saleData.items) {
        // Check product availability
        const product = await this.agroProductService.getProductById(
          item.agroProductId
        );
        if (product.totalStockQuantity < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for ${product.name}. Available: ${product.totalStockQuantity}, Requested: ${item.quantity}`
          );
        }

        // Create sale item
        const saleItem = this.saleItemRepository.create({
          sale: savedSale,
          productId: item.agroProductId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          unitOfMeasure: item.unitOfMeasure,
        });

        const savedItem = await queryRunner.manager.save(saleItem);
        saleItems.push(savedItem);

        // Update product stock
        await this.agroProductService.updateProductStock(
          item.agroProductId,
          -item.quantity,
          `Sold in sale ${savedSale.id}`,
          saleData.userId
        );
      }

      savedSale.items = saleItems;
      await queryRunner.commitTransaction();

      // Log for sync
      await this.syncService.logChange(
        "AgroSale",
        savedSale.id,
        SyncOperation.CREATE,
        savedSale,
        saleData.userId,
        saleData.branchId
      );

      return savedSale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSalesByBranch(
    branchId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      isCreditSale?: boolean;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder("sale")
      .leftJoinAndSelect("sale.items", "items")
      .where("sale.branchId = :branchId", { branchId });

    if (filters?.startDate) {
      queryBuilder.andWhere("sale.saleDate >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("sale.saleDate <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters?.isCreditSale !== undefined) {
      queryBuilder.andWhere("sale.isCreditSale = :isCreditSale", {
        isCreditSale: filters.isCreditSale,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("sale.saleDate", "DESC");

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
      where: { id },
      relations: ["items", "items.product"],
    });

    if (!sale) {
      throw new ApiError(404, "Sale not found");
    }

    return sale;
  }

  async getSalesByProductId(productId: string) {
    return this.saleRepository
      .createQueryBuilder("sale")
      .leftJoinAndSelect("sale.items", "items")
      .where("items.productId = :productId", { productId })
      .getMany();
  }
}
