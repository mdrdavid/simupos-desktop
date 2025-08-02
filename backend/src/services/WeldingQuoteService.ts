import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { WeldingQuote, WeldingQuoteLineItem } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";

export class WeldingQuoteService {
  private quoteRepository: Repository<WeldingQuote>;
  private lineItemRepository: Repository<WeldingQuoteLineItem>;
  private syncService: SyncService;

  constructor() {
    this.quoteRepository = AppDataSource.getRepository(WeldingQuote);
    this.lineItemRepository = AppDataSource.getRepository(WeldingQuoteLineItem);
    this.syncService = new SyncService();
  }

  async createQuote(
    jobId: string,
    customerDetails: { name: string; contact: string; location?: string },
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      materialDetails?: { name: string; unit: string; isCustom: boolean };
    }>,
    branchId: string,
    userId: string,
    notes?: string,
    validUntil?: Date
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate totals
      const subTotal = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxRate = 0.18; // Default tax rate, could be configurable
      const taxAmount = subTotal * taxRate;
      const totalAmount = subTotal + taxAmount;

      // Create the quote
      const quote = this.quoteRepository.create({
        weldingJobId: jobId,
        quoteNumber: `QT-${Date.now().toString().slice(-6)}`,
        customerDetails,
        subTotal,
        taxRate,
        taxAmount,
        totalAmount,
        validUntil,
        notes,
        status: "Draft",
        branchId,
      });
      await queryRunner.manager.save(quote);

      // Create line items
      const lineItemEntities = lineItems.map((item) =>
        this.lineItemRepository.create({
          ...item,
          total: item.quantity * item.unitPrice,
          quote,
        })
      );
      await queryRunner.manager.save(lineItemEntities);

      await queryRunner.commitTransaction();

      await this.syncService.logChange(
        "WeldingQuote",
        quote.id,
        SyncOperation.CREATE,
        quote,
        userId,
        branchId
      );

      return quote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuoteStatus(quoteId: string, status: string, userId: string) {
    const quote = await this.quoteRepository.findOne({
      where: { id: quoteId },
    });
    if (!quote) {
      throw new ApiError(404, "Quote not found");
    }

    quote.status = status;
    await this.quoteRepository.save(quote);

    await this.syncService.logChange(
      "WeldingQuote",
      quote.id,
      SyncOperation.UPDATE,
      quote,
      userId,
      quote.branchId
    );

    return quote;
  }
async updateQuote(
  quoteId: string,
  userId: string,
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    materialDetails?: { name: string; unit: string; isCustom: boolean };
  }>,
  notes?: string,
  validUntil?: Date,
  status?: string
) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const quote = await this.quoteRepository.findOne({
      where: { id: quoteId },
      relations: ["lineItems"],
    });

    if (!quote) {
      throw new ApiError(404, "Quote not found");
    }

    // Update basic fields
    if (notes !== undefined) quote.notes = notes;
    if (validUntil !== undefined) quote.validUntil = validUntil;
    if (status !== undefined) quote.status = status;

    // Only update line items if they are explicitly provided
    if (lineItems !== undefined) {
      // Remove existing line items
      await this.lineItemRepository.delete({ quote: { id: quoteId } });

      // Create new line items
      const lineItemEntities = lineItems.map((item) =>
        this.lineItemRepository.create({
          ...item,
          total: item.quantity * item.unitPrice,
          quote,
        })
      );
      await queryRunner.manager.save(lineItemEntities);

      // Recalculate totals
      const subTotal = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxRate = quote.taxRate ?? 0.18; // default if missing
      const taxAmount = subTotal * taxRate;
      const totalAmount = subTotal + taxAmount;

      quote.subTotal = subTotal;
      quote.taxAmount = taxAmount;
      quote.totalAmount = totalAmount;
    }

    await queryRunner.manager.save(quote);
    await queryRunner.commitTransaction();

    await this.syncService.logChange(
      "WeldingQuote",
      quote.id,
      SyncOperation.UPDATE,
      quote,
      userId,
      quote.branchId
    );

    return quote;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
//   async updateQuote(
//     quoteId: string,
//     userId: string,
//     lineItems?: Array<{
//       description: string;
//       quantity: number;
//       unitPrice: number;
//       materialDetails?: { name: string; unit: string; isCustom: boolean };
//     }>,
//     notes?: string,
//     validUntil?: Date,
//     status?: string
//   ) {
//     const queryRunner = AppDataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const quote = await this.quoteRepository.findOne({
//         where: { id: quoteId },
//         relations: ["lineItems"],
//       });

//       if (!quote) {
//         throw new ApiError(404, "Quote not found");
//       }

//       // Update basic fields
//       if (notes !== undefined) quote.notes = notes;
//       if (validUntil !== undefined) quote.validUntil = validUntil;
//       if (status !== undefined) quote.status = status;

//       // Update line items if provided
//       if (lineItems) {
//         // Remove existing line items
//         await this.lineItemRepository.delete({ quote: { id: quoteId } });

//         // Create new line items
//         const lineItemEntities = lineItems.map((item) =>
//           this.lineItemRepository.create({
//             ...item,
//             total: item.quantity * item.unitPrice,
//             quote,
//           })
//         );
//         await queryRunner.manager.save(lineItemEntities);

//         // Recalculate totals
//         const subTotal = lineItems.reduce(
//           (sum, item) => sum + item.quantity * item.unitPrice,
//           0
//         );
//         const taxRate = quote.taxRate ?? 0; // default if missing
//         const taxAmount = subTotal * taxRate;
//         const totalAmount = subTotal + taxAmount;

//         quote.subTotal = subTotal;
//         quote.taxAmount = taxAmount;
//         quote.totalAmount = totalAmount;
//       }

//       await queryRunner.manager.save(quote);
//       await queryRunner.commitTransaction();

//       await this.syncService.logChange(
//         "WeldingQuote",
//         quote.id,
//         SyncOperation.UPDATE,
//         quote,
//         userId,
//         quote.branchId
//       );

//       return quote;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw error;
//     } finally {
//       await queryRunner.release();
//     }
//   }
  async getQuoteById(quoteId: string) {
    return await this.quoteRepository.findOne({
      where: { id: quoteId, isDeleted: false },
      relations: ["lineItems", "weldingJob", "invoices"],
    });
  }

  async getQuotesByBranch(
    branchId: string,
    filters: {
      status?: string;
      jobId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const queryBuilder = this.quoteRepository
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.lineItems", "lineItems")
      .where("quote.branchId = :branchId", { branchId })
      .andWhere("quote.isDeleted = false");

    if (filters.status) {
      queryBuilder.andWhere("quote.status = :status", {
        status: filters.status,
      });
    }

    if (filters.jobId) {
      queryBuilder.andWhere("quote.weldingJobId = :jobId", {
        jobId: filters.jobId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(quote.quoteNumber ILIKE :search OR quote.customerDetails->>'name' ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("quote.createdAt", "DESC");

    const [quotes, total] = await queryBuilder.getManyAndCount();

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteQuote(quoteId: string, userId: string) {
    const quote = await this.quoteRepository.findOne({
      where: { id: quoteId },
    });
    if (!quote) {
      throw new ApiError(404, "Quote not found");
    }

    quote.isDeleted = true;
    await this.quoteRepository.save(quote);

    await this.syncService.logChange(
      "WeldingQuote",
      quote.id,
      SyncOperation.DELETE,
      quote,
      userId,
      quote.branchId
    );

    return { message: "Quote marked as deleted" };
  }
}
