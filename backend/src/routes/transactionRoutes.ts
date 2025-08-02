import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const transactionController = new TransactionController();

router.use(authenticateToken);

router.post("/", transactionController.createTransaction);
router.post("/agro", transactionController.createAgroTransaction);
router.get("/check-limit", transactionController.checkTransactionLimit);
// router.get("/branch/:branchId", transactionController.getTransactions);
router.get(
  "/branch/:branchId",
  transactionController.getTransactionsWithSummary
);
router.get("/id/:id", transactionController.getTransactionById);
router.get("/:id", transactionController.getTransaction);
router.delete("/:id", transactionController.deleteTransaction);
router.delete(
  "/by-local-id/:localId",
  transactionController.getTransactionByLocalId
);

export { router as transactionRoutes };
