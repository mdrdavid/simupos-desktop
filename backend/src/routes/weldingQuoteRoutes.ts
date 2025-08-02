import { Router } from "express";
import { WeldingQuoteController } from "../controllers/WeldingQuoteController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const controller = new WeldingQuoteController();

router.use(authenticateToken);

router.post("/job/:jobId", controller.createQuote);
router.get("/branch/:branchId", controller.getQuotesByBranch);
router.get("/:id", controller.getQuoteById);
router.patch("/:id/status", controller.updateQuoteStatus);
router.put("/:id", controller.updateQuote);
router.delete("/:id", controller.deleteQuote);

export { router as weldingQuoteRoutes };
