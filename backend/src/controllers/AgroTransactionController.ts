import { Request, Response, NextFunction } from "express";
import { AgroTransactionService } from "../services/AgroTransactionService";
import { ApiError } from "../utils/ApiError";
import Joi from "joi";

const saleSchema = Joi.object({
  saleDate: Joi.date().default(new Date()),
  items: Joi.array()
    .items(
      Joi.object({
        agroProductId: Joi.string().required(),
        quantity: Joi.number().min(0.01).required(),
        unitPrice: Joi.number().min(0).required(),
        productName: Joi.string().required(),
        unitOfMeasure: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  totalAmount: Joi.number().min(0).required(),
  currency: Joi.string().default("UGX"),
  isCreditSale: Joi.boolean().default(false),
  amountPaid: Joi.when("isCreditSale", {
    is: true,
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0).default(Joi.ref("totalAmount")),
  }),
  customerDetails: Joi.when("isCreditSale", {
    is: true,
    then: Joi.object({
      name: Joi.string().required(),
      phoneNumber: Joi.string().optional(),
      address: Joi.string().optional(),
    }).required(),
    otherwise: Joi.object().optional(),
  }),
  paymentMethod: Joi.string()
    .valid("cash", "mobile_money", "bank_transfer", "other")
    .default("cash"),
  branchId: Joi.string().required(),
});

export class AgroTransactionController {
  private service: AgroTransactionService;

  constructor() {
    this.service = new AgroTransactionService();
  }

  async createSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = saleSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const sale = await this.service.createSale({
        ...value,
        userId: req.user.id,
      });

      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  }

  async getSalesByBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.params;
      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        isCreditSale:
          req.query.isCreditSale === "true"
            ? true
            : req.query.isCreditSale === "false"
              ? false
              : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.service.getSalesByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSaleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sale = await this.service.getSaleById(id);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  }

  async getSalesByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const sales = await this.service.getSalesByProductId(productId);
      res.json(sales);
    } catch (error) {
      next(error);
    }
  }
}
