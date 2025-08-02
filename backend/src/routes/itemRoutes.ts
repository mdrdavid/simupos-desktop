import { Router } from "express";
import { ItemController } from "../controllers/ItemController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const itemController = new ItemController(); // Create instance

router.use(authenticateToken as import("express").RequestHandler);

router.post("/", itemController.createItem); // Use instance methods
// router.get("/branch/:branchId", itemController.getItems);
router.get("/branch/:branchId", itemController.getItemsWithTotals);
router.get("/:id", itemController.getItem);
router.get("/barcode/:barcode", itemController.getItemByBarcode);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);
router.post("/:id/top-up", itemController.topUpStock);
router.get("/:id/movements", itemController.getStockMovements);
router.get(
  "/production-movements/:branchId",
  itemController.getProductionMovements
);
router.get("/stock-movements/:branchId", itemController.getAllStockMovements);
router.get("/analytics/:branchId", itemController.getInventoryAnalytics);

export { router as itemRoutes };
