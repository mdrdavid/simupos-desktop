import { Request, Response, NextFunction } from "express";
import { WeldingQuoteService } from "../services/WeldingQuoteService";
import { ApiError } from "../utils/ApiError";
import {
  weldingQuoteSchema,
  weldingQuoteLineItemSchema,
} from "../utils/validationSchemas";

export class WeldingQuoteController {
  private service: WeldingQuoteService;

  constructor() {
    this.service = new WeldingQuoteService();
  }

  createQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const { customerDetails, lineItems, notes, validUntil } = req.body;

      // Validate customer details
      const { error: customerError } = weldingQuoteSchema.validate({
        customerDetails,
      });
      if (customerError) {
        throw new ApiError(400, customerError.details[0].message);
      }

      // Validate each line item
      const lineItemErrors = lineItems
        .map((item: any) => weldingQuoteLineItemSchema.validate(item).error)
        .filter(Boolean);

      if (lineItemErrors.length > 0) {
        throw new ApiError(400, lineItemErrors[0].details[0].message);
      }

      const quote = await this.service.createQuote(
        jobId,
        customerDetails,
        lineItems,
        req.user.branchId,
        req.user.id,
        notes,
        validUntil ? validUntil : undefined
      );

      res.status(201).json(quote);
    } catch (error) {
      next(error);
    }
  };

  getQuoteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const quote = await this.service.getQuoteById(id);
      if (!quote) {
        throw new ApiError(404, "Quote not found");
      }
      res.json(quote);
    } catch (error) {
      next(error);
    }
  };

  updateQuoteStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !status ||
        !["Draft", "Sent", "Accepted", "Declined", "Invoiced"].includes(status)
      ) {
        throw new ApiError(400, "Invalid status value");
      }

      const quote = await this.service.updateQuoteStatus(
        id,
        status,
        req.user.id
      );
      res.json(quote);
    } catch (error) {
      next(error);
    }
  };
updateQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { lineItems, notes, validUntil, status } = req.body;

    // Only validate line items if they are provided
    if (lineItems) {
      const lineItemErrors = lineItems
        .map((item: any) => {
          const itemToValidate = item.materialDetails === undefined 
            ? { ...item, materialDetails: null }
            : item;
            
          const { error } = weldingQuoteLineItemSchema.validate(itemToValidate);
          return error;
        })
        .filter(Boolean);

      if (lineItemErrors.length > 0) {
        throw new ApiError(400, lineItemErrors[0].details[0].message);
      }
    }

    const quote = await this.service.updateQuote(
      id,
      req.user.id,
      lineItems, // This can be undefined
      notes,
      validUntil,
      status
    );

    res.json(quote);
  } catch (error) {
    next(error);
  }
}

getQuotesByBranch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        status: req.query.status as string,
        jobId: req.query.jobId as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.service.getQuotesByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteQuote(id, req.user.id);
      res.json({ message: "Quote deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
