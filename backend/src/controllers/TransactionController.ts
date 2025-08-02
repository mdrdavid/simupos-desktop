import type { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/TransactionService";
import {
  transactionSchema,
  transactionSchemaAgro,
} from "../utils/validationSchemas";
import { ApiError } from "../utils/ApiError";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
    }
    interface Request {
      user: User;
    }
  }
}

export class TransactionController {
  private transactionService: TransactionService;
  private defaultPageLimit = 1000;
  constructor() {
    this.transactionService = new TransactionService();
  }
  public createAgroTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Prepare data for validation
      const validationData = {
        ...req.body,
        branchId: req.body.branchId,
        customerName: req.body.customerName || null,
        customerPhone: req.body.customerPhone || null,
        items: req.body.items?.map((item: any) => ({
          agroProductId: item.agroProductId, // Only agroProductId is kept
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
          name: item.name,
          productType: item.productType || "agro", // Default to agro
          unit: item.unit,
          subUnit: item.subUnit,
          conversionFactor: item.conversionFactor
            ? Number(item.conversionFactor)
            : null,
        })),
      };
      console.log("Validation Data:", validationData);
      // Validate first
      const { error } = transactionSchemaAgro.validate(validationData);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      // Prepare complete data with userId for service
      const completeData = {
        ...validationData,
        userId: req.user.id,
      };

      // Create agro transaction
      const transaction =
        await this.transactionService.createAgroTransaction(completeData);

      res.status(201).json({
        success: true,
        data: transaction,
        shortId: transaction.transactionId,
      });
    } catch (error) {
      next(error);
    }
  };

  public createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Prepare data for validation (without userId)
      const validationData = {
        ...req.body,
        branchId: req.body.branchId,
        customerName: req.body.customerName || null,
        customerPhone: req.body.customerPhone || null,
        items: req.body.items?.map((item: any) => ({
          itemId: item.itemId || item.id,
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
          name: item.name,
          productType: item.productType,
          unit: item.unit,
          subUnit: item.subUnit,
          conversionFactor: item.conversionFactor
            ? Number(item.conversionFactor)
            : null,
        })),
        customItemName: req.body.customItemName || null,
        isCustomAmount: req.body.isCustomAmount || false,
      };
      // Validate first
      const { error } = transactionSchema.validate(validationData);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      // Prepare complete data with userId for service
      const completeData = {
        ...validationData,
        userId: req.user.id,
      };
      console.log("completeData", completeData);
      let transaction;
      try {
        if (validationData.isCustomAmount) {
          // Custom amount transaction
          transaction =
            await this.transactionService.createCustomAmountTransaction({
              ...completeData,
              items: [], // Ensure items is empty for custom amount
            });
        } else {
          // Regular transaction with items
          transaction =
            await this.transactionService.createTransaction(completeData);
        }
      } catch (error: any) {
        // Handle duplicate transaction specifically
        if (error.code === "23505" && error.constraint?.includes("localId")) {
          if (completeData.localId) {
            const existing =
              await this.transactionService.getTransactionByLocalId(
                completeData.localId
              );
            if (existing) {
              res.status(200).json({
                success: true,
                data: existing,
                shortId: existing.transactionId,
                warning: "Transaction already exists",
              });
              return;
            }
          }
        }
        throw error;
      }

      res.status(201).json({
        success: true,
        data: transaction,
        shortId: transaction.transactionId,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        paymentMethod: req.query.paymentMethod as string,
        customerPhone: req.query.customerPhone as string,
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };

      const result = await this.transactionService.getTransactions(
        branchId,
        filters
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTransactionsWithSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        paymentMethod: req.query.paymentMethod as string,
        customerPhone: req.query.customerPhone as string,
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };

      const result = await this.transactionService.getTransactionsWithSummary(
        branchId,
        filters
      );
      console.log("Transactions with Summary Result:", result);
      res.json({
        success: true,
        transactions: result.transactions,
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      // Check if this is a UUID or transactionId
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id
        );

      let transaction;
      if (isUUID) {
        transaction = await this.transactionService.getTransactionById(id);
      } else {
        transaction =
          await this.transactionService.getTransactionByTransactionId(id);
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  };

  public getTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionById(id);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  };

  public deleteTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.transactionService.deleteTransaction(
        id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public checkTransactionLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.transactionService.checkTransactionLimit(
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTransactionByLocalId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { localId } = req.params;
      const transaction =
        await this.transactionService.getTransactionByLocalId(localId);

      if (!transaction) {
        res
          .status(404)
          .json({ success: false, message: "Transaction not found" });
        return;
      }

      res.json({ success: true, exists: true });
    } catch (error) {
      next(error);
    }
  };
}
