import { Router } from "express";
import { AgroTransactionController } from "../controllers/AgroTransactionController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const controller = new AgroTransactionController();

router.use(authenticateToken);

router.post("/", controller.createSale.bind(controller));
router.get("/branch/:branchId", controller.getSalesByBranch.bind(controller));
router.get("/:id", controller.getSaleById.bind(controller));
router.get(
  "/product/:productId",
  controller.getSalesByProductId.bind(controller)
);

export { router as agroTransactionRoutes };
