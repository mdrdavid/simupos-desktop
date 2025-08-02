import { Router } from "express";
import {
  SubscriptionController,
  SubscriptionPlanController,
} from "../controllers";
import {
  authenticateToken,
  requireAdminRole,
  requireRole,
} from "../middlewares/auth";
import { UserRole } from "../models/User";

const router = Router();
const subscriptionController = new SubscriptionController();
const planController = new SubscriptionPlanController();

router.use(authenticateToken as import("express").RequestHandler);

// Get current subscription
router.get("/current", subscriptionController.getCurrentSubscription);

// Get subscription history
router.get("/history", subscriptionController.getSubscriptionHistory);

// Create new subscription
router.post("/", subscriptionController.createSubscription);

// Cancel subscription
router.delete("/:id/cancel", subscriptionController.cancelSubscription);

// Renew subscription
router.post("/:id/renew", subscriptionController.renewSubscription);

// Toggle auto-renew
router.put("/:id/auto-renew", subscriptionController.toggleAutoRenew);

// Get available plans
router.get("/plans", subscriptionController.getSubscriptionPlans);

// Check feature access
router.get("/features/:feature", subscriptionController.checkFeatureAccess);

// Admin-only plan management routes
router.use(requireAdminRole([UserRole.ADMIN]));
router.post("/plans", planController.createPlan);
router.put("/plans/:id", planController.updatePlan);
router.get("/plans", planController.getAllPlans);
router.get("/plans/:id", planController.getPlan);
router.delete("/plans/:id", planController.deletePlan);
router.put("/plans/:id/toggle-status", planController.togglePlanStatus);

// Activate subscription (admin-only)
router.put(
  "/:id/activate",
  requireAdminRole([UserRole.ADMIN]),
  subscriptionController.activateSubscription
);

// Inactivate subscription (admin-only)
router.put(
  "/:id/inactivate",
  requireAdminRole([UserRole.ADMIN]),
  subscriptionController.inactivateSubscription
);
export { router as subscriptionRoutes };
