import { Router } from "express";
import { SyncController } from "../controllers/SyncController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const syncController = new SyncController();

router.use(authenticateToken as import("express").RequestHandler);

router.get("/pending", syncController.getPendingSync);
router.post("/offline-changes", syncController.syncOfflineChanges);
router.post("/resolve-conflicts", syncController.resolveConflicts);
router.post("/mark-synced", syncController.markSynced);

export { router as syncRoutes };
