import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { SubscriptionPlan } from "../models/SubscriptionPlan";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { Subscription } from "../models";

export class SubscriptionPlanService {
  private planRepository: Repository<SubscriptionPlan>;
  private syncService: SyncService;

  constructor() {
    this.planRepository = AppDataSource.getRepository(SubscriptionPlan);
    this.syncService = new SyncService();
  }

  async createPlan(
    planData: {
      name: string;
      code: string;
      description: string;
      price: number;
      maxUsers: number;
      maxTransactions: number;
      features: string[];
      isPopular?: boolean;
    },
    userId: string
  ) {
    // Check if code already exists
    const existingPlan = await this.planRepository.findOne({
      where: { code: planData.code },
    });
    if (existingPlan) {
      throw new ApiError(400, "Plan with this code already exists");
    }

    const plan = this.planRepository.create({
      ...planData,
      isActive: true,
    });

    await this.planRepository.save(plan);

    // Log for sync
    await this.syncService.logChange(
      "SubscriptionPlan",
      plan.id,
      SyncOperation.CREATE,
      plan,
      userId
    );

    return plan;
  }

  async updatePlan(
    userId: string,
    id: string,
    updateData: Partial<SubscriptionPlan>
  ) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    // Don't allow changing code if it's different
    if (updateData.code && updateData.code !== plan.code) {
      throw new ApiError(400, "Plan code cannot be changed");
    }

    // Filter out undefined values to prevent overwriting with undefined
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    Object.assign(plan, cleanUpdateData);
    await this.planRepository.save(plan);

    // Log for sync
    await this.syncService.logChange(
      "SubscriptionPlan",
      plan.id,
      SyncOperation.UPDATE,
      plan,
      userId,
      undefined
    );

    return plan;
  }

  async getTrialPlan(): Promise<SubscriptionPlan | null> {
    return this.planRepository.findOne({
      where: { isTrial: true, isActive: true },
      order: { durationDays: "DESC" }, // Get longest trial if multiple exist
    });
  }
  async getPlan(id: string) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }
    return plan;
  }

  async getAllPlans(activeOnly: boolean = true) {
    const where = activeOnly ? { isActive: true } : {};
    return this.planRepository.find({ where, order: { price: "ASC" } });
  }

  async getNonTrialPlans(
    activeOnly: boolean = true,
    excludeTrials: boolean = true
  ): Promise<SubscriptionPlan[]> {
    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (excludeTrials) {
      where.isTrial = false;
    }

    return this.planRepository.find({
      where,
      order: { price: "ASC" },
    });
  }

  async deletePlan(userId: string, id: string): Promise<{ message: string }> {
    // Check if any subscriptions use this plan
    const subscriptionRepo = AppDataSource.getRepository(Subscription);
    const subscriptionCount = await subscriptionRepo.count({
      where: { planId: id },
    });

    if (subscriptionCount > 0) {
      throw new ApiError(400, "Cannot delete plan with active subscriptions");
    }

    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new ApiError(404, "Plan not found");
    }

    // Log for sync
    await this.syncService.logChange(
      "SubscriptionPlan",
      id,
      SyncOperation.DELETE,
      { id },
      userId,
      undefined
    );

    return { message: "Subscription plan deleted successfully" };
  }
  async togglePlanStatus(userId: string, id: string) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    plan.isActive = !plan.isActive;
    await this.planRepository.save(plan);

    // Log for sync
    await this.syncService.logChange(
      "SubscriptionPlan",
      plan.id,
      SyncOperation.UPDATE,
      plan,
      userId,
      undefined
    );

    return plan;
  }
}
