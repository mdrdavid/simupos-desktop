import { Router } from "express";
import { SaleController } from "../controllers/SaleController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const saleController = new SaleController();

router.use(authenticateToken as import("express").RequestHandler);

router.post("/", saleController.createSale);
router.get("/branch/:branchId", saleController.getSales);
router.get("/:id", saleController.getSale);
router.get("/analytics/:branchId", saleController.getSalesAnalytics);

export { router as saleRoutes };
