import type { Request, Response, NextFunction } from "express";
import { BranchService } from "../services/BranchService";
import { branchSchema, branchUpdateSchema } from "../utils/validationSchemas";

export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }


  createBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = branchSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { businessId } = req.params;
      const branch = await this.branchService.createBranch(
        req.body,
        req.user.id,
        businessId
      );
      res.status(201).json(branch);
    } catch (error) {
      next(error);
    }
  };

  getBranchesByBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { businessId } = req.params;
      const filters = {
        search: req.query.search as string,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.branchService.getBranchesByBusiness(
        businessId,
        filters
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getBranches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.branchService.getBranches(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const branch = await this.branchService.getBranchById(id);
      res.json(branch);
    } catch (error) {
      next(error);
    }
  };

  updateBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = branchUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { id } = req.params;
      const branch = await this.branchService.updateBranch(
        id,
        req.body,
        req.user.id
      );
      res.json(branch);
    } catch (error) {
      next(error);
    }
  };

  deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.branchService.deleteBranch(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getBranchStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const period = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const stats = await this.branchService.getBranchStats(id, period);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  switchBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.body;
      const result = await this.branchService.switchBranch(
        req.user.id,
        branchId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
