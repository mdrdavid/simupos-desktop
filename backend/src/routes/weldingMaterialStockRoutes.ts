import { Router } from "express";
import { WeldingMaterialStockController } from "../controllers/WeldingMaterialStockController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const controller = new WeldingMaterialStockController();

router.use(authenticateToken);

router.post("/", controller.createStockItem);
router.get("/branch/:branchId", controller.getStockByBranch);
router.get("/:id", controller.getStockItemById);
router.put("/:id", controller.updateStockItem);
router.delete("/:id", controller.deleteStockItem);
router.post("/:id/consume", controller.consumeMaterial);
router.post("/:id/restock", controller.restockMaterial);

export { router as weldingMaterialStockRoutes };
