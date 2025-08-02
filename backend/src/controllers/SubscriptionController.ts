import type { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services/SubscriptionService";
import { subscriptionSchema } from "../utils/validationSchemas";
import { ApiError } from "../utils/ApiError";
import { SubscriptionPlanService } from "../services";

export class SubscriptionController {
  private subscriptionService: SubscriptionService;
  private subscriptionPlanService: SubscriptionPlanService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
    this.subscriptionPlanService = new SubscriptionPlanService();
  }

  public getCurrentSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subscription =
        await this.subscriptionService.getCurrentSubscription(req.user.id);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const history = await this.subscriptionService.getSubscriptionHistory(
        req.user.id
      );
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  public createSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = subscriptionSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const { planId, paymentMethod, transactionId } = req.body;
      const subscription = await this.subscriptionService.createSubscription(
        req.user.id,
        planId,
        paymentMethod
        // transactionId
      );
      res.status(201).json(subscription);
    } catch (error) {
      next(error);
    }
  };

  public cancelSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.subscriptionService.cancelSubscription(
        req.user.id,
        id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public renewSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.renewSubscription(
        req.user.id,
        id
      );
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  };

  public toggleAutoRenew = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.toggleAutoRenew(
        req.user.id,
        id
      );
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionPlans = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { activeOnly } = req.query;
      const plans = await this.subscriptionPlanService.getNonTrialPlans(
        activeOnly === "true"
      );
      res.json(plans);
    } catch (error) {
      next(error);
    }
  };
  public checkFeatureAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { feature } = req.params;
      const hasAccess = await this.subscriptionService.checkFeatureAccess(
        req.user.id,
        feature
      );
      res.json({ hasAccess });
    } catch (error) {
      next(error);
    }
  };
  public activateSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.activateSubscription(
        id,
        req.user.id
      );
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  };

  public inactivateSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const subscription =
        await this.subscriptionService.inactivateSubscription(id, req.user.id);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  };
}
