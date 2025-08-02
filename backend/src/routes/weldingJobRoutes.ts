import { Router } from "express";
import { WeldingJobController } from "../controllers/WeldingJobController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const controller = new WeldingJobController();

router.use(authenticateToken);

router.post("/", controller.createJob);
router.get("/branch/:branchId", controller.getJobsByBranch);
router.get("/:id", controller.getJobById);
router.put("/:id", controller.updateJob);
router.delete("/:id", controller.deleteJob);
router.post("/:jobId/expenses", controller.addExpense);
router.post("/:jobId/images", controller.addImage);

export { router as weldingJobRoutes };
