import { Router } from "express";
import { CashRegisterController } from "../controllers/CashRegisterController";
import { authenticateToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/roleAuth";

const router = Router();
const cashRegisterController = new CashRegisterController();

// All routes require authentication
router.use(authenticateToken);

// Open register (cashier, staff, admin)
router.post(
  "/open",
  requireRole(["cashier", "staff", "admin"]),
  cashRegisterController.openRegister
);

// Close register (cashier, staff, admin)
router.post(
  "/close",
  requireRole(["cashier", "staff", "admin"]),
  cashRegisterController.closeRegister
);

// Cash in/out operations (cashier, staff, admin)
router.post(
  "/cash-in",
  requireRole(["cashier", "staff", "admin"]),
  cashRegisterController.cashIn
);
router.post(
  "/cash-out",
  requireRole(["cashier", "staff", "admin"]),
  cashRegisterController.cashOut
);

// Get current session
router.get("/current", cashRegisterController.getCurrentSession);

// Get session logs
router.get("/sessions/:sessionId/logs", cashRegisterController.getSessionLogs);

// Get sessions (with filters)
router.get("/sessions", cashRegisterController.getSessions);

// Get daily summary
router.get("/daily-summary", cashRegisterController.getDailySummary);

// Admin only routes
router.get(
  "/admin/sessions",
  requireRole(["admin", "manager"]),
  cashRegisterController.getSessions
);

export { router as cashRegisterRoutes };