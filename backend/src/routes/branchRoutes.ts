import { Router } from "express";
import { BranchController } from "../controllers/BranchController";
import { authenticateToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/roleAuth";

const router = Router();
const branchController = new BranchController();

// All routes require authentication
router.use(authenticateToken as import("express").RequestHandler);
// Create branch (owner/manager only)
router.post(
  "/:businessId",
  requireRole(["owner", "manager"]),
  branchController.createBranch
);

// Get all branches
router.get("/", branchController.getBranches);
router.get("/business/:businessId", branchController.getBranchesByBusiness);

// Get specific branch
router.get("/:id", branchController.getBranch);

// Update branch (owner/manager only)
router.put(
  "/:id",
  requireRole(["owner", "manager"]),
  branchController.updateBranch
);

// Delete branch (owner only)
router.delete("/:id", requireRole(["owner"]), branchController.deleteBranch);

// Get branch statistics
router.get("/:id/stats", branchController.getBranchStats);

// Switch current branch
router.post("/switch", branchController.switchBranch);

export { router as branchRoutes };
