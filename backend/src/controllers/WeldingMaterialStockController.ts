import { Request, Response, NextFunction } from "express";
import { WeldingMaterialStockService } from "../services/WeldingMaterialStockService";
import { ApiError } from "../utils/ApiError";
import { weldingMaterialStockSchema } from "../utils/validationSchemas";

export class WeldingMaterialStockController {
  private service: WeldingMaterialStockService;

  constructor() {
    this.service = new WeldingMaterialStockService();
  }

  createStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = weldingMaterialStockSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const stockItem = await this.service.createStockItem(req.body, req.user.id);
      res.status(201).json(stockItem);
    } catch (error) {
      next(error);
    }
  };

  updateStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { error } = weldingMaterialStockSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const stockItem = await this.service.updateStockItem(id, req.body, req.user.id);
      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  };

  deleteStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteStockItem(id, req.user.id);
      res.json({ message: "Stock item deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  getStockItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const stockItem = await this.service.getStockItemById(id);
      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  };

  getStockByBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        lowStock: req.query.lowStock === "true",
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.getStockByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  consumeMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Valid quantity is required");
      }

      const stockItem = await this.service.consumeMaterialFromStock(
        id,
        quantity,
        req.user.id
      );
      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  };

  restockMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { quantity, supplierInfo } = req.body;

      if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Valid quantity is required");
      }

      const stockItem = await this.service.restockMaterial(
        id,
        quantity,
        supplierInfo,
        req.user.id
      );
      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  };
}