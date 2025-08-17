import type { Request, Response, NextFunction } from "express";
import { CashRegisterService } from "../services/CashRegisterService";
import {
  openRegisterSchema,
  closeRegisterSchema,
  cashInOutSchema,
  getSessionsSchema,
} from "../utils/validation/cashRegisterValidators";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface User {
      id: string;
      isAdmin?: boolean;
    }
    interface Request {
      user: User;
    }
  }
}

export class CashRegisterController {
  private cashRegisterService: CashRegisterService;

  constructor() {
    this.cashRegisterService = new CashRegisterService();
  }

  public openRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = openRegisterSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, "Validation error", error.details);
      }

      const { openingFloat, branchId } = value;
      const session = await this.cashRegisterService.openSession(
        req.user.id,
        branchId,
        openingFloat
      );

      res.status(201).json({
        success: true,
        message: "Cash register opened successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  public closeRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = closeRegisterSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, "Validation error", error.details);
      }

      const { sessionId, closingBalance, notes } = value;
      const session = await this.cashRegisterService.closeSession(
        sessionId,
        req.user.id,
        closingBalance,
        notes
      );

      res.json({
        success: true,
        message: "Cash register closed successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  public cashIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = cashInOutSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, "Validation error", error.details);
      }

      const { sessionId, amount, reason } = value;
      const session = await this.cashRegisterService.cashIn(
        sessionId,
        req.user.id,
        amount,
        reason
      );

      res.json({
        success: true,
        message: "Cash added successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  public cashOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = cashInOutSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, "Validation error", error.details);
      }

      const { sessionId, amount, reason } = value;
      const session = await this.cashRegisterService.cashOut(
        sessionId,
        req.user.id,
        amount,
        reason
      );

      res.json({
        success: true,
        message: "Cash removed successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCurrentSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.query;
      const session = await this.cashRegisterService.getCurrentSession(
        req.user.id,
        branchId as string
      );

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  public getSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error, value } = getSessionsSchema.validate(req.query);
      if (error) {
        throw new ApiError(400, "Validation error", error.details);
      }

      const {
        branchId,
        userId,
        startDate,
        endDate,
        status,
        page = 1,
        limit = 20,
      } = value;

      const { sessions, pagination } = await this.cashRegisterService.getSessions(
        {
          branchId,
          userId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
          page,
          limit,
        }
      );

      res.json({
        success: true,
        data: {
          sessions,
          pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getSessionLogs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { sessionId } = req.params;
      const logs = await this.cashRegisterService.getSessionLogs(
        sessionId,
        req.user.id,
        req.user.isAdmin || false
      );

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDailySummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId, date } = req.query;
      const summary = await this.cashRegisterService.getDailySummary(
        branchId as string,
        req.user.id,
        new Date(date as string)
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  public recordSale = async (
    sessionId: string,
    amount: number,
    transactionId: string,
    userId: string
  ) => {
    return this.cashRegisterService.recordSale(
      sessionId,
      userId,
      amount,
      transactionId
    );
  };
}