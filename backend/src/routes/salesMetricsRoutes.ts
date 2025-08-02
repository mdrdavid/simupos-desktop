import { Router } from "express";
import { SalesMetricsController } from "../controllers/SalesMetricsController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const salesMetricsController = new SalesMetricsController();

router.use(authenticateToken);

router.get("/metrics/branches/:branchId", salesMetricsController.getSalesMetrics);
router.get("/total-sales/branches/:branchId", salesMetricsController.getTotalSales);
router.get("/total-transactions/branches/:branchId", salesMetricsController.getTotalTransactions);

export { router as salesMetricsRoutes };
