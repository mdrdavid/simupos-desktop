import type { Request, Response, NextFunction } from "express";
import { SaleService } from "../services/SaleService";
import { saleSchema } from "../utils/validationSchemas";
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user: User;
    }
  }
}
export class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = saleSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const saleData = {
        ...req.body,
        userId: req.user.id,
        branchId: req.user.branchId,
      };

      const sale = await this.saleService.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  };

  getSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        status: req.query.status as any,
        customerName: req.query.customerName as string,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.saleService.getSales(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sale = await this.saleService.getSaleById(id);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  };

  getSalesAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { branchId } = req.params;
      const period = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const analytics = await this.saleService.getSalesAnalytics(
        branchId,
        period,
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
}
