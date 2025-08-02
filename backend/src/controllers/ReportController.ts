import type { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/ReportService";
import { reportSchema } from "../utils/validationSchemas";

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  generateSalesReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = reportSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { businessId } = req.params;
      const { branchId, startDate, endDate } = req.body;

      const report = await this.reportService.generateSalesReport({
        businessId,
        branchId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: req.user.id,
      });

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  };

  generateInventoryReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { businessId } = req.params;
      const { branchId } = req.body;

      const report = await this.reportService.generateInventoryReport({
        businessId,
        branchId,
        userId: req.user.id,
      });

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.params;
      const filters = {
        type: req.query.type as any,
        branchId: req.query.branchId as string,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.reportService.getReports(businessId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReportById(id);
      res.json(report);
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.reportService.deleteReport(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
