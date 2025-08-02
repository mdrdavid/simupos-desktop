import { Request, Response, NextFunction } from "express";
import { WeldingInvoiceService } from "../services/WeldingInvoiceService";
import { ApiError } from "../utils/ApiError";
import { 
  weldingInvoiceSchema, 
  weldingInvoiceLineItemSchema,
  weldingPaymentSchema
} from "../utils/validationSchemas";

export class WeldingInvoiceController {
  private service: WeldingInvoiceService;

  constructor() {
    this.service = new WeldingInvoiceService();
  }
//create invoice
  createInvoiceFromQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quoteId } = req.params;
      const { issueDate, dueDate,includeTax = true} = req.body;

      const invoice = await this.service.createInvoiceFromQuote(
        quoteId,
        req.user.branchId,
        req.user.id,
        issueDate ? new Date(issueDate) : undefined,
        dueDate ? new Date(dueDate) : undefined,
        includeTax
      );

      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  };

  createStandaloneInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const { customerDetails, lineItems, issueDate, dueDate, notes,includeTax = true } = req.body;

      // Validate customer details
      const { error: customerError } = weldingInvoiceSchema.validate({ customerDetails });
      if (customerError) {
        throw new ApiError(400, customerError.details[0].message);
      }

      // Validate each line item
      const lineItemErrors = lineItems.map((item: any) => 
        weldingInvoiceLineItemSchema.validate(item).error
      ).filter(Boolean);

      if (lineItemErrors.length > 0) {
        throw new ApiError(400, lineItemErrors[0].details[0].message);
      }

      const invoice = await this.service.createStandaloneInvoice(
        jobId,
        customerDetails,
        lineItems,
        req.user.branchId,
        req.user.id,
        issueDate ? new Date(issueDate) : undefined,
        dueDate ? new Date(dueDate) : undefined,
        notes,
        includeTax
      );

      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  };

  recordPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { invoiceId } = req.params;
      const { amount, method, date, reference, notes } = req.body;

      const { error } = weldingPaymentSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const result = await this.service.recordPayment(
        invoiceId,
        amount,
        method,
        new Date(date),
        reference,
        notes,
        req.user.id
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const invoice = await this.service.getInvoiceById(id);
      if (!invoice) {
        throw new ApiError(404, "Invoice not found");
      }
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  };

  getInvoicesByBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        status: req.query.status as string,
        jobId: req.query.jobId as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.service.getInvoicesByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteInvoice(id, req.user.id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}