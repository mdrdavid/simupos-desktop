import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  WeldingInvoice,
  WeldingInvoiceLineItem,
  WeldingInvoicePayment,
  WeldingQuote,
} from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { PaymentMethod } from "../models/WeldingInvoicePayment";

export class WeldingInvoiceService {
  private invoiceRepository: Repository<WeldingInvoice>;
  private lineItemRepository: Repository<WeldingInvoiceLineItem>;
  private paymentRepository: Repository<WeldingInvoicePayment>;
  private quoteRepository: Repository<WeldingQuote>;
  private syncService: SyncService;

  constructor() {
    this.invoiceRepository = AppDataSource.getRepository(WeldingInvoice);
    this.lineItemRepository = AppDataSource.getRepository(
      WeldingInvoiceLineItem
    );
    this.paymentRepository = AppDataSource.getRepository(WeldingInvoicePayment);
    this.quoteRepository = AppDataSource.getRepository(WeldingQuote);
    this.syncService = new SyncService();
  }

  async createInvoiceFromQuote(
  quoteId: string,
  branchId: string,
  userId: string,
  issueDate?: Date,
  dueDate?: Date,
  includeTax: boolean = true
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

    if (quote.status !== "Accepted" && quote.status !== "Sent") {
      throw new ApiError(
        400,
        "Invoice can only be created from an accepted or sent quote"
      );
    }

    // Calculate amounts based on tax inclusion
    const taxRate = includeTax ? quote.taxRate : 0;
    const taxAmount = includeTax ? quote.taxAmount : 0;
    const totalAmount = includeTax ? quote.totalAmount : quote.subTotal;

    // Create the invoice
    const invoice = this.invoiceRepository.create({
      weldingJobId: quote.weldingJobId,
      quoteId: quote.id,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerDetails: quote.customerDetails,
      subTotal: quote.subTotal,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      issueDate: issueDate || new Date(),
      dueDate,
      paymentStatus: "Unpaid",
      notes: quote.notes,
      branchId,
      includeTax, // Store whether tax was included
    });
    await queryRunner.manager.save(invoice);

    // Create line items from quote
    const lineItemEntities = quote.lineItems.map((item) =>
      this.lineItemRepository.create({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        materialDetails: item.materialDetails,
        invoice,
      })
    );
    await queryRunner.manager.save(lineItemEntities);

    // Update quote status
    quote.status = "Invoiced";
    await queryRunner.manager.save(quote);

    await queryRunner.commitTransaction();

    await this.syncService.logChange(
      "WeldingInvoice",
      invoice.id,
      SyncOperation.CREATE,
      invoice,
      userId,
      branchId
    );

    await this.syncService.logChange(
      "WeldingQuote",
      quote.id,
      SyncOperation.UPDATE,
      quote,
      userId,
      branchId
    );

    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
  // async createInvoiceFromQuote(
  //   quoteId: string,
  //   branchId: string,
  //   userId: string,
  //   issueDate?: Date,
  //   dueDate?: Date
  // ) {
  //   const queryRunner = AppDataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const quote = await this.quoteRepository.findOne({
  //       where: { id: quoteId },
  //       relations: ["lineItems"],
  //     });

  //     if (!quote) {
  //       throw new ApiError(404, "Quote not found");
  //     }

  //     if (quote.status !== "Accepted" && quote.status !== "Sent") {
  //       throw new ApiError(
  //         400,
  //         "Invoice can only be created from an accepted or sent quote"
  //       );
  //     }

  //     // Create the invoice
  //     const invoice = this.invoiceRepository.create({
  //       weldingJobId: quote.weldingJobId,
  //       quoteId: quote.id,
  //       invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  //       customerDetails: quote.customerDetails,
  //       subTotal: quote.subTotal,
  //       taxRate: quote.taxRate,
  //       taxAmount: quote.taxAmount,
  //       totalAmount: quote.totalAmount,
  //       amountPaid: 0,
  //       balanceDue: quote.totalAmount,
  //       issueDate: issueDate || new Date(),
  //       dueDate,
  //       paymentStatus: "Unpaid",
  //       notes: quote.notes,
  //       branchId,
  //     });
  //     await queryRunner.manager.save(invoice);

  //     // Create line items from quote
  //     const lineItemEntities = quote.lineItems.map((item) =>
  //       this.lineItemRepository.create({
  //         description: item.description,
  //         quantity: item.quantity,
  //         unitPrice: item.unitPrice,
  //         total: item.total,
  //         materialDetails: item.materialDetails,
  //         invoice,
  //       })
  //     );
  //     await queryRunner.manager.save(lineItemEntities);

  //     // Update quote status
  //     quote.status = "Invoiced";
  //     await queryRunner.manager.save(quote);

  //     await queryRunner.commitTransaction();

  //     await this.syncService.logChange(
  //       "WeldingInvoice",
  //       invoice.id,
  //       SyncOperation.CREATE,
  //       invoice,
  //       userId,
  //       branchId
  //     );

  //     await this.syncService.logChange(
  //       "WeldingQuote",
  //       quote.id,
  //       SyncOperation.UPDATE,
  //       quote,
  //       userId,
  //       branchId
  //     );

  //     return invoice;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async createStandaloneInvoice(
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
  issueDate?: Date,
  dueDate?: Date,
  notes?: string,
  includeTax: boolean = true
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
    const taxRate = includeTax ? 0.18 : 0; // Default tax rate when included
    const taxAmount = includeTax ? subTotal * taxRate : 0;
    const totalAmount = subTotal + taxAmount;

    // Create the invoice
    const invoice = this.invoiceRepository.create({
      weldingJobId: jobId,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerDetails,
      subTotal,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      issueDate: issueDate || new Date(),
      dueDate,
      paymentStatus: "Unpaid",
      notes,
      branchId,
      includeTax, // Store whether tax was included
    });
    await queryRunner.manager.save(invoice);

    // Create line items
    const lineItemEntities = lineItems.map((item) =>
      this.lineItemRepository.create({
        ...item,
        total: item.quantity * item.unitPrice,
        invoice,
      })
    );
    await queryRunner.manager.save(lineItemEntities);

    await queryRunner.commitTransaction();

    await this.syncService.logChange(
      "WeldingInvoice",
      invoice.id,
      SyncOperation.CREATE,
      invoice,
      userId,
      branchId
    );

    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  // async createStandaloneInvoice(
  //   jobId: string,
  //   customerDetails: { name: string; contact: string; location?: string },
  //   lineItems: Array<{
  //     description: string;
  //     quantity: number;
  //     unitPrice: number;
  //     materialDetails?: { name: string; unit: string; isCustom: boolean };
  //   }>,
  //   branchId: string,
  //   userId: string,
  //   issueDate?: Date,
  //   dueDate?: Date,
  //   notes?: string
  // ) {
  //   const queryRunner = AppDataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // Calculate totals
  //     const subTotal = lineItems.reduce(
  //       (sum, item) => sum + item.quantity * item.unitPrice,
  //       0
  //     );
  //     const taxRate = 0.18; // Default tax rate, could be configurable
  //     const taxAmount = subTotal * taxRate;
  //     const totalAmount = subTotal + taxAmount;

  //     // Create the invoice
  //     const invoice = this.invoiceRepository.create({
  //       weldingJobId: jobId,
  //       invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  //       customerDetails,
  //       subTotal,
  //       taxRate,
  //       taxAmount,
  //       totalAmount,
  //       amountPaid: 0,
  //       balanceDue: totalAmount,
  //       issueDate: issueDate || new Date(),
  //       dueDate,
  //       paymentStatus: "Unpaid",
  //       notes,
  //       branchId,
  //     });
  //     await queryRunner.manager.save(invoice);

  //     // Create line items
  //     const lineItemEntities = lineItems.map((item) =>
  //       this.lineItemRepository.create({
  //         ...item,
  //         total: item.quantity * item.unitPrice,
  //         invoice,
  //       })
  //     );
  //     await queryRunner.manager.save(lineItemEntities);

  //     await queryRunner.commitTransaction();

  //     await this.syncService.logChange(
  //       "WeldingInvoice",
  //       invoice.id,
  //       SyncOperation.CREATE,
  //       invoice,
  //       userId,
  //       branchId
  //     );

  //     return invoice;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

 
  async recordPayment(
    invoiceId: string,
    amount: number,
    method: string,
    date: Date,
    reference?: string,
    notes?: string,
    userId?: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. First validate the invoice exists
      const invoice = await queryRunner.manager.findOne(WeldingInvoice, {
        where: { id: invoiceId },
        lock: { mode: "pessimistic_write" }, // Prevents concurrent updates
      });

      if (!invoice) {
        throw new ApiError(404, "Invoice not found");
      }

      // 2. Create and associate payment BEFORE saving
      const payment = new WeldingInvoicePayment();
      payment.amount = Number(amount.toFixed(2));
      payment.method = method as PaymentMethod;
      payment.date = date;
      payment.reference = reference || `PAY-${Date.now().toString().slice(-6)}`;
      payment.notes = notes;
      payment.recordedBy = userId ?? "";
      payment.branchId = invoice.branchId;

      // Critical association
      payment.invoice = invoice; // This sets invoiceId automatically
      payment.invoiceId = invoice.id; // Explicit set for redundancy

      // 3. Save payment first
      await queryRunner.manager.save(payment);
      console.log("Payment Recorded:", payment);
      // 4. Then update invoice
      const newAmountPaid = Number(
        (Number(invoice.amountPaid) + payment.amount).toFixed(2)
      );
      invoice.amountPaid = newAmountPaid;
      invoice.balanceDue = Number(
        (Number(invoice.totalAmount) - newAmountPaid).toFixed(2)
      );
      invoice.paymentStatus =
        invoice.balanceDue <= 0
          ? "Paid"
          : invoice.dueDate && new Date(invoice.dueDate) < new Date()
            ? "Overdue"
            : "Partially Paid";
      invoice.lastPaymentDate = new Date();

      await queryRunner.manager.save(invoice);
      console.log("Updated Invoice:", invoice);
      await queryRunner.commitTransaction();

      return { invoice, payment };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Payment recording failed:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  //   async recordPayment(
  //     invoiceId: string,
  //     amount: number,
  //     method: string,
  //     date: Date,
  //     reference?: string,
  //     notes?: string,
  //     userId?: string
  //   ) {
  //     const queryRunner = AppDataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();

  //     try {
  //       const invoice = await this.invoiceRepository.findOne({
  //         where: { id: invoiceId },
  //         relations: ["paymentsMade"],
  //       });

  //       if (!invoice) {
  //         throw new ApiError(404, "Invoice not found");
  //       }
  //       // Create payment
  //       const payment = this.paymentRepository.create({
  //         amount,
  //         method: method as PaymentMethod,
  //         date,
  //         reference,
  //         notes,
  //         invoice,
  //         recordedBy: userId,
  //         branchId: invoice.branchId,
  //       });
  //       console.log("Payment Details:", payment);
  //       await queryRunner.manager.save(payment);
  //       await queryRunner.manager.save(payment);

  //       // Update invoice totals and status
  //       const newAmountPaid = invoice.amountPaid + amount;
  //       const newBalanceDue = invoice.totalAmount - newAmountPaid;
  //       console.log("New Amount Paid:", newAmountPaid);
  //       console.log("New Balance Due:", newBalanceDue);
  //       let newPaymentStatus = "Partially Paid";
  //       if (newBalanceDue <= 0) {
  //         newPaymentStatus = "Paid";
  //       } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
  //         newPaymentStatus = "Overdue";
  //       }

  //       invoice.amountPaid = newAmountPaid;
  //       invoice.balanceDue = newBalanceDue;
  //       invoice.paymentStatus = newPaymentStatus;
  //       await queryRunner.manager.save(invoice);

  //       await queryRunner.commitTransaction();

  //       if (userId) {
  //         await this.syncService.logChange(
  //           "WeldingInvoicePayment",
  //           payment.id,
  //           SyncOperation.CREATE,
  //           payment,
  //           userId,
  //           invoice.branchId
  //         );

  //         await this.syncService.logChange(
  //           "WeldingInvoice",
  //           invoice.id,
  //           SyncOperation.UPDATE,
  //           invoice,
  //           userId,
  //           invoice.branchId
  //         );
  //       }

  //       return { invoice, payment };
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw error;
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   }

  async getInvoiceById(invoiceId: string) {
    return await this.invoiceRepository.findOne({
      where: { id: invoiceId, isDeleted: false },
      relations: ["lineItems", "paymentsMade", "weldingJob", "quote"],
    });
  }

  async getInvoicesByBranch(
    branchId: string,
    filters: {
      status?: string;
      jobId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.lineItems", "lineItems")
      .leftJoinAndSelect("invoice.paymentsMade", "payments")
      .where("invoice.branchId = :branchId", { branchId })
      .andWhere("invoice.isDeleted = false");

    if (filters.status) {
      queryBuilder.andWhere("invoice.paymentStatus = :status", {
        status: filters.status,
      });
    }

    if (filters.jobId) {
      queryBuilder.andWhere("invoice.weldingJobId = :jobId", {
        jobId: filters.jobId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(invoice.invoiceNumber ILIKE :search OR invoice.customerDetails->>'name' ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("invoice.issueDate", "DESC");

    const [invoices, total] = await queryBuilder.getManyAndCount();

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteInvoice(invoiceId: string, userId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    invoice.isDeleted = true;
    await this.invoiceRepository.save(invoice);

    await this.syncService.logChange(
      "WeldingInvoice",
      invoice.id,
      SyncOperation.DELETE,
      invoice,
      userId,
      invoice.branchId
    );

    return { message: "Invoice marked as deleted" };
  }
}
