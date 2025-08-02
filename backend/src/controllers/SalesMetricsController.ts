import { Request, Response, NextFunction } from "express";
import { SalesMetricsService } from "../services/SalesMetricsService";

export class SalesMetricsController {
  private salesMetricsService: SalesMetricsService;

  constructor() {
    this.salesMetricsService = new SalesMetricsService();
  }

  public getSalesMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const metrics = await this.salesMetricsService.getSalesMetrics(
        branchId as string
      );
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };

  public getTotalSales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const totalSales = await this.salesMetricsService.getTotalSales(
        branchId as string
      );
      res.json({ totalSales });
    } catch (error) {
      next(error);
    }
  };

  public getTotalTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const totalTransactions =
        await this.salesMetricsService.getTotalTransactions(branchId as string);
      res.json({ totalTransactions });
    } catch (error) {
      next(error);
    }
  };
}
