import { Router } from "express";
import { BusinessController } from "../controllers/BusinessController";
import { authenticateToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/roleAuth";

const router = Router();
const businessController = new BusinessController();

// All routes require authentication
router.use(authenticateToken as import("express").RequestHandler);

// Create business (only for users without a business)
router.post("/", businessController.createBusiness);

// Get all businesses (owner/admin only)
router.get(
  "/",
  requireRole(["owner", "admin"]),
  businessController.getBusinesses
);

// Get specific business (must be owner or have access)
router.get("/:id", businessController.getBusiness);

// Update business (owner only)
router.put("/:id", requireRole(["owner"]), businessController.updateBusiness);

// Delete business (owner only)
router.delete(
  "/:id",
  requireRole(["owner"]),
  businessController.deleteBusiness
);

// Get business statistics (owner/manager only)
router.get(
  "/:id/stats",
  requireRole(["owner", "manager"]),
  businessController.getBusinessStats
);

export { router as businessRoutes };
