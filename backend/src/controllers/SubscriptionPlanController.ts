import { Request, Response, NextFunction } from "express";
import { SubscriptionPlanService } from "../services/SubscriptionPlanService";
import {
  subscriptionPlanSchema,
  subscriptionPlanUpdateSchema,
} from "../utils/validationSchemas";
import { ApiError } from "../utils/ApiError";

export class SubscriptionPlanController {
  private subscriptionPlanService: SubscriptionPlanService;

  constructor() {
    this.subscriptionPlanService = new SubscriptionPlanService();
  }

  public createPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = subscriptionPlanSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const plan = await this.subscriptionPlanService.createPlan(
        req.body,
        req.user.id
      );
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  };

  public updatePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { error } = subscriptionPlanUpdateSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const plan = await this.subscriptionPlanService.updatePlan(
        req.user.id,
        id,
        req.body
      );
      res.json(plan);
    } catch (error) {
      next(error);
    }
  };

  public getPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.getPlan(id);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  };

  public getAllPlans = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { activeOnly } = req.query;
      const plans = await this.subscriptionPlanService.getAllPlans(
        activeOnly === "true"
      );
      res.json(plans);
    } catch (error) {
      next(error);
    }
  };

  public deletePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.subscriptionPlanService.deletePlan(
        req.user.id,
        id
      );
      res.status(200).json(result); // Return success message with 200 status
    } catch (error) {
      next(error);
    }
  };

  public togglePlanStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.togglePlanStatus(
        req.user.id,
        id
      );
      res.json(plan);
    } catch (error) {
      next(error);
    }
  };
}
