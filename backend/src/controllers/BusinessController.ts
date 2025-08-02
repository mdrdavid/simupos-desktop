import type { Request, Response, NextFunction } from "express";
import { BusinessService } from "../services/BusinessService";
import {
  businessSchema,
  businessUpdateSchema,
} from "../utils/validationSchemas";

export class BusinessController {
  private businessService: BusinessService;

  constructor() {
    this.businessService = new BusinessService();
  }

  createBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = businessSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await this.businessService.createBusiness(
        req.body,
        req.user.id
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string,
        ownerId: req.query.ownerId as string,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.businessService.getBusinesses(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const business = await this.businessService.getBusinessById(id);
      res.json(business);
    } catch (error) {
      next(error);
    }
  };

  updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = businessUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { id } = req.params;
      const business = await this.businessService.updateBusiness(
        id,
        req.body,
        req.user.id
      );
      res.json(business);
    } catch (error) {
      next(error);
    }
  };

  deleteBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.businessService.deleteBusiness(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getBusinessStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const stats = await this.businessService.getBusinessStats(id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}
