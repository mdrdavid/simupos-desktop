import { Request, Response, NextFunction } from "express";
import { TransactionAnalysisService } from "../services/TransactionAnalysisService";
import { ApiError } from "../utils/ApiError";

type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
const validPeriods: Period[] = ["daily", "weekly", "monthly", "quarterly", "yearly"];

export class TransactionAnalysisController {
  private transactionAnalysisService: TransactionAnalysisService;

  constructor() {
    this.transactionAnalysisService = new TransactionAnalysisService();
  }

  public getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const period = req.query.period as Period;

      if (!period || !validPeriods.includes(period)) {
        throw new ApiError(400, "Invalid or missing period parameter. Must be one of: " + validPeriods.join(", "));
      }

      const analysis = await this.transactionAnalysisService.getAnalysis(branchId, period);
      res.json({ success: true, data: analysis });
    } catch (error) {
      next(error);
    }
  };
}
