import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { authenticateToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/roleAuth";

const router = Router();
const reportController = new ReportController();

router.use(authenticateToken as import("express").RequestHandler);

// Generate reports
router.post(
  "/:businessId/reports/sales",
  requireRole(["owner", "manager"]),
  reportController.generateSalesReport
);
router.post(
  "/:businessId/reports/inventory",
  requireRole(["owner", "manager"]),
  reportController.generateInventoryReport
);

// Get reports
router.get("/:businessId/reports", reportController.getReports);
router.get("/reports/:id", reportController.getReport);

// Delete report
router.delete(
  "/reports/:id",
  requireRole(["owner", "manager"]),
  reportController.deleteReport
);

export { router as reportRoutes };
