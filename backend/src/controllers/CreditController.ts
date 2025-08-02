import { Request, Response, NextFunction } from "express";
import { CreditService } from "../services/CreditService";
import {
  creditEntrySchema,
  creditPaymentSchema,
} from "../utils/validationSchemas";

export class CreditController {
  private creditService: CreditService;

  constructor() {
    this.creditService = new CreditService();
  }

  public createCreditEntry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = creditEntrySchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const creditEntry = await this.creditService.createCreditEntry({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(creditEntry);
    } catch (error) {
      next(error);
    }
  };

  public getCreditEntries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        customerName: req.query.customerName as string,
        status: req.query.status as "unpaid" | "partially_paid" | "paid",
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await this.creditService.getCreditEntries(
        branchId,
        filters
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getCreditEntry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const creditEntry = await this.creditService.getCreditEntryById(id);
      res.json(creditEntry);
    } catch (error) {
      next(error);
    }
  };

  public recordPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = creditPaymentSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await this.creditService.recordPayment({
        ...req.body,
        userId: req.user.id,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getPaymentsForEntry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { creditEntryId } = req.params;
      const payments =
        await this.creditService.getPaymentsForEntry(creditEntryId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  };

  public getCreditAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const analytics = await this.creditService.getCreditAnalytics(branchId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
}
