import { Router } from "express";
import { ProfitController } from "../controllers/ProfitController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const profitController = new ProfitController();

// All routes require authentication
router.use(authenticateToken as import("express").RequestHandler);

// Get detailed profit analysis for a branch
router.get("/branch/:branchId/analysis", profitController.getProfitAnalysis);

// Get quick profit summary for a branch
router.get("/branch/:branchId/summary", profitController.getQuickProfitSummary);

// Get profit comparison across all branches
router.get("/comparison", profitController.getAllBranchesProfitComparison);

export { router as profitRoutes };
