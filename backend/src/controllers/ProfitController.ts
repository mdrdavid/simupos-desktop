import type { Request, Response, NextFunction } from "express";
import { ProfitService } from "../services/ProfitService";
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      // add other user properties if needed
    }
    interface Request {
      user: User;
    }
  }
}
export class ProfitController {
  private profitService: ProfitService;

  constructor() {
    this.profitService = new ProfitService();
  }

  getProfitAnalysis = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const { startDate, endDate, compare } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: "Start date and end date are required" });
        return;
      }

      const analysis = await this.profitService.calculateProfitAnalysis(
        branchId,
        new Date(startDate as string),
        new Date(endDate as string),
        compare === "true"
      );

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  };

  getQuickProfitSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const { period } = req.query;

      if (
        !period ||
        !["today", "week", "month", "quarter", "year"].includes(
          period as string
        )
      ) {
        res
          .status(400)
          .json({
            error:
              "Valid period is required (today, week, month, quarter, year)",
          });
        return;
      }

      const summary = await this.profitService.getQuickProfitSummary(
        branchId,
        period as "today" | "week" | "month" | "quarter" | "year"
      );

      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  getAllBranchesProfitComparison = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: "Start date and end date are required" });
        return;
      }

      // Get all branches for the user's organization
      const branches = await this.getBranchesForUser(
        req.user.id,
        req.user.role
      );

      if (!Array.isArray(branches) || branches.length === 0) {
        res.status(404).json({ error: "No branches found for the user" });
        return;
      }

      const comparisons = await Promise.all(
        branches.map(async (branch) => {
          const analysis = await this.profitService.calculateProfitAnalysis(
            branch.id,
            new Date(startDate as string),
            new Date(endDate as string)
          );

          return {
            branch: {
              id: branch.id,
              name: branch.name,
              isMain: branch.isMain,
            },
            revenue: analysis.revenue.totalRevenue,
            expenses: analysis.costs.totalExpenses,
            grossProfit: analysis.profit.grossProfit,
            netProfit: analysis.profit.netProfit,
            profitMargin: analysis.profit.netProfitMargin,
          };
        })
      );

      // Sort by net profit descending
      comparisons.sort((a, b) => b.netProfit - a.netProfit);

      res.json({
        period: { startDate, endDate },
        branches: comparisons,
        totals: {
          revenue: comparisons.reduce((sum, branch) => sum + branch.revenue, 0),
          expenses: comparisons.reduce(
            (sum, branch) => sum + branch.expenses,
            0
          ),
          grossProfit: comparisons.reduce(
            (sum, branch) => sum + branch.grossProfit,
            0
          ),
          netProfit: comparisons.reduce(
            (sum, branch) => sum + branch.netProfit,
            0
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private async getBranchesForUser(userId: string, userRole: string) {
    // This would typically come from a BranchService method
    // For now, we'll implement a simple version
    const { AppDataSource } = await import("../config/database");
    const branchRepository = AppDataSource.getRepository("Branch");

    if (userRole === "owner") {
      // Owners can see all branches
      await branchRepository.find({
        where: { isDeleted: false, isActive: true },
        select: ["id", "name", "isMain"],
      });
      return;
    } else {
      // Other roles can only see their assigned branch
      const userRepository = AppDataSource.getRepository("User");
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["branch"],
      });

      return user?.branch ? [user.branch] : [];
    }
  }
}
