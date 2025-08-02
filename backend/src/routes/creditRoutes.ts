import { Router } from "express";
import { CreditController } from "../controllers/CreditController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const creditController = new CreditController();

router.use(authenticateToken);

// Create credit entry
router.post("/entries", creditController.createCreditEntry);

// Get credit entries for a branch
router.get("/entries/branch/:branchId", creditController.getCreditEntries);

// Get specific credit entry
router.get("/entries/:id", creditController.getCreditEntry);

// Record payment
router.post("/payments", creditController.recordPayment);

// Get payments for a credit entry
router.get(
  "/payments/entry/:creditEntryId",
  creditController.getPaymentsForEntry
);

// Get credit analytics for a branch
router.get("/analytics/branch/:branchId", creditController.getCreditAnalytics);

export { router as creditRoutes };
