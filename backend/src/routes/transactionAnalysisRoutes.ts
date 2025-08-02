import { Router } from "express";
import { TransactionAnalysisController } from "../controllers/TransactionAnalysisController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const transactionAnalysisController = new TransactionAnalysisController();

router.get("/analysis/branch/:branchId", authenticateToken, transactionAnalysisController.getAnalysis);

export { router as transactionAnalysisRoutes };
