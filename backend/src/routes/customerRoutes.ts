import { Router } from "express";
import { CustomerController } from "../controllers/CustomerController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const customerController = new CustomerController();

router.use(authenticateToken);

// Create customer
router.post("/", customerController.createCustomer);

// Get customers for a branch
router.get("/branch/:branchId", customerController.getCustomers);

// Get specific customer
router.get("/:id", customerController.getCustomer);

// Update customer
router.put("/:id", customerController.updateCustomer);

// Delete customer
router.delete("/:id", customerController.deleteCustomer);

// Get customer analytics for a branch
router.get(
  "/branch/:branchId/analytics",
  customerController.getCustomerAnalytics
);

export { router as customerRoutes };
