import type { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/ItemService";
import { itemSchema } from "../utils/validationSchemas";
import { MovementType } from "../models/StockMovement";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user: User;
    }
  }
}

export class ItemController {
  private itemService: ItemService;
  private defaultPageLimit = 200;
  constructor() {
    this.itemService = new ItemService();
  }

  public createItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = itemSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const item = await this.itemService.createItem(req.body, req.user.id);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  };

  public getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        lowStock: req.query.lowStock === "true",
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };
      const result = await this.itemService.getItems(branchId, filters);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getItemsWithTotals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        lowStock: req.query.lowStock === "true",
        outOfStock: req.query.outOfStock === "true",
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };

      const { items, pagination, stockSummary } =
        await this.itemService.getItemsWithTotals(branchId, filters);

      res.json({
        success: true,
        items,
        pagination,
        stockSummary,
      });
    } catch (error) {
      next(error);
    }
  };

  public getItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.itemService.getItemById(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  public getItemByBarcode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { barcode } = req.params;
      const { branchId } = req.query;

      if (!branchId) {
        res.status(400).json({ error: "Branch ID is required" });
        return;
      }

      const item = await this.itemService.getItemByBarcode(
        barcode,
        branchId as string
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  };
  public updateItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const item = await this.itemService.updateItem(id, req.body, req.user.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  public deleteItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.itemService.deleteItem(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public topUpStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body;

      if (!quantity || quantity <= 0) {
        res.status(400).json({ error: "Valid quantity is required" });
        return;
      }

      const item = await this.itemService.topUpStock(
        id,
        quantity,
        req.user.id,
        notes
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  public getProductionMovements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        type: req.query.movementType as MovementType,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const result = await this.itemService.getProductionMovements(
        branchId,
        filters
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getStockMovements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const filters = {
        type: req.query.type as any,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };

      const result = await this.itemService.getStockMovements(id, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getAllStockMovements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        type: req.query.type as MovementType,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: Number.parseInt(req.query.page as string) || 1,
        limit:
          Number.parseInt(req.query.limit as string) || this.defaultPageLimit,
      };

      const result = await this.itemService.getAllStockMovements(
        branchId,
        filters
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  public getInventoryAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const period = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const analytics = await this.itemService.getInventoryAnalytics(
        branchId,
        period
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
}
