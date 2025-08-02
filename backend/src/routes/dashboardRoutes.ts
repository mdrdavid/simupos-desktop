import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticateToken);

router.get(
  "/branch/:branchId",
  dashboardController.getDashboardData
);

export { router as dashboardRoutes };
