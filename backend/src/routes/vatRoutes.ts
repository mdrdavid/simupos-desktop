import { Router } from "express";
import { VatController } from "../controllers/VatController";
import { authenticateToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/roleAuth";

const router = Router();
const vatController = new VatController();

router.put(
  "/:businessId",
  authenticateToken as import("express").RequestHandler,
  requireRole(["owner"]),
  vatController.updateVatSettings
);

export { router as vatRoutes };
