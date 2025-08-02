import { Router } from "express";
import { WeldingInvoiceController } from "../controllers/WeldingInvoiceController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const controller = new WeldingInvoiceController();

router.use(authenticateToken);

router.post("/from-quote/:quoteId", controller.createInvoiceFromQuote);
router.post("/standalone/job/:jobId", controller.createStandaloneInvoice);
router.post("/:invoiceId/payments", controller.recordPayment);
router.get("/branch/:branchId", controller.getInvoicesByBranch);
router.get("/:id", controller.getInvoiceById);
router.delete("/:id", controller.deleteInvoice);

export { router as weldingInvoiceRoutes };
