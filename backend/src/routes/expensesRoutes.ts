import { Router } from "express";
import { ExpenseController } from "../controllers/ExpenseController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const expenseController = new ExpenseController();

// All routes require authentication
router.use(authenticateToken as import("express").RequestHandler);

// Create expense
router.post("/", expenseController.createExpense);

// Get expenses for a branch
router.get("/branch/:branchId", expenseController.getExpenses);

// Get specific expense
router.get("/:id", expenseController.getExpense);

// Update expense
router.put("/:id", expenseController.updateExpense);

// Delete expense
router.delete("/:id", expenseController.deleteExpense);

// Get expense analytics for a branch
router.get(
  "/branch/:branchId/analytics",
  expenseController.getExpenseAnalytics
);

// Get expenses by date range with grouping
router.get(
  "/branch/:branchId/date-range",
  expenseController.getExpensesByDateRange
);

// export default router;
export { router as expenseRoutes };
