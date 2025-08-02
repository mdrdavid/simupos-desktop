import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/DashboardService";
import { ApiError } from "../utils/ApiError";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  public getDashboardData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;

      if (!branchId) {
        throw new ApiError(400, "Branch ID is required");
      }

      const data = await this.dashboardService.getDashboardData(branchId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
