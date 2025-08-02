import { In, type Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Subscription, SubscriptionStatus } from "../models/Subscription";
import { User, UserRole, UserStatus } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { SubscriptionPlan } from "../models";

export class SubscriptionService {
  private subscriptionRepository: Repository<Subscription>;
  private userRepository: Repository<User>;
  private syncService: SyncService;

  constructor() {
    this.subscriptionRepository = AppDataSource.getRepository(Subscription);
    this.userRepository = AppDataSource.getRepository(User);
    this.syncService = new SyncService();
  }
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    transactionId?: string
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["branch", "createdUsers"],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const plan = await AppDataSource.getRepository(SubscriptionPlan).findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found or inactive");
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Always set to PENDING initially, regardless of payment method
    const status = SubscriptionStatus.PENDING;

    // Find the most recent subscription regardless of status
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    let subscription: Subscription;

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.plan = plan;
      existingSubscription.planId = plan.id;
      existingSubscription.amount = plan.price;
      existingSubscription.startDate = startDate;
      existingSubscription.endDate = endDate;
      existingSubscription.paymentMethod = paymentMethod;
      existingSubscription.status = status; // Set to PENDING
      existingSubscription.features = plan.features;
      existingSubscription.isDeleted = false;

      subscription =
        await this.subscriptionRepository.save(existingSubscription);
    } else {
      // Create new subscription
      subscription = this.subscriptionRepository.create({
        user,
        userId: user.id,
        plan,
        planId: plan.id,
        amount: plan.price,
        startDate,
        endDate,
        paymentMethod,
        status, // Set to PENDING
        features: plan.features,
      });
      await this.subscriptionRepository.save(subscription);
    }

    user.lastSubscriptionId = subscription.id;
    await this.userRepository.save(user);

    // Always sync for OWNER role, check for ADMIN if needed
    if (user.role === UserRole.OWNER) {
      await this.syncCreatedUsersSubscriptions(userId, subscription);
    }

    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.CREATE,
      subscription,
      userId,
      user.branch?.id
    );

    return subscription;
  }

  private async syncCreatedUsersSubscriptions(
    ownerId: string,
    ownerSubscription: Subscription
  ) {
    console.log(`Starting sync for owner ${ownerId}`);

    // Find users where createdBy.id matches ownerId
    const usersCreatedByOwner = await this.userRepository.find({
      where: {
        createdBy: { id: ownerId } as any,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      relations: ["subscriptions"],
    });

    console.log(`Found ${usersCreatedByOwner.length} users to update`);

    const updatePromises = usersCreatedByOwner.map(async (user) => {
      console.log(`Processing user ${user.id}`);

      // Find any existing subscription (regardless of status)
      const existingSubscription = user.subscriptions?.[0] || null;

      if (existingSubscription) {
        console.log(
          `Updating existing subscription ${existingSubscription.id}`
        );

        // Update existing subscription to match owner's
        existingSubscription.plan = ownerSubscription.plan;
        existingSubscription.planId = ownerSubscription.plan.id;
        existingSubscription.amount = ownerSubscription.amount;
        existingSubscription.startDate = new Date();
        existingSubscription.endDate = ownerSubscription.endDate;
        existingSubscription.status = ownerSubscription.status;
        existingSubscription.features = ownerSubscription.features;
        existingSubscription.isDeleted = false;

        await this.subscriptionRepository.save(existingSubscription);
        user.lastSubscriptionId = existingSubscription.id;
      } else {
        console.log(`Creating new subscription for user ${user.id}`);

        // Create new subscription matching owner's
        const newSubscription = this.subscriptionRepository.create({
          user: { id: user.id },
          userId: user.id,
          plan: ownerSubscription.plan,
          status: ownerSubscription.status,
          startDate: new Date(),
          endDate: ownerSubscription.endDate,
          autoRenew: false,
          amount: ownerSubscription.amount,
          features: ownerSubscription.features,
        });

        const savedSubscription =
          await this.subscriptionRepository.save(newSubscription);
        user.lastSubscriptionId = savedSubscription.id;
      }

      await this.userRepository.save(user);
    });

    await Promise.all(updatePromises);
    console.log(`Sync completed for owner ${ownerId}`);
  }

async renewSubscription(userId: string, subscriptionId: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ["branch"],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Find the existing subscription with plan relation
  const existingSubscription = await this.subscriptionRepository.findOne({
    where: { id: subscriptionId, userId },
    relations: ["plan"],
  });

  if (!existingSubscription) {
    throw new ApiError(404, "Subscription not found");
  }

  // Validate subscription can be renewed
  if (existingSubscription.status === SubscriptionStatus.ACTIVE && 
      new Date(existingSubscription.endDate) > new Date()) {
    throw new ApiError(400, "Subscription is already active and not expired");
  }

  // Calculate new dates - extend from current date or existing end date (whichever is later)
  const referenceDate = new Date(Math.max(
    new Date().getTime(),
    existingSubscription.endDate ? new Date(existingSubscription.endDate).getTime() : 0
  ));
  
  const startDate = new Date(referenceDate);
  const endDate = new Date(referenceDate);
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

  // Update existing subscription instead of creating new one
  existingSubscription.startDate = startDate;
  existingSubscription.endDate = endDate;
  existingSubscription.status = SubscriptionStatus.PENDING;
  existingSubscription.isDeleted = false;
  existingSubscription.cancelledAt = null;
  existingSubscription.expiredAt = null;

  const renewedSubscription = await this.subscriptionRepository.save(existingSubscription);

  // Update user's subscription reference
  user.lastSubscriptionId = renewedSubscription.id;
  await this.userRepository.save(user);

  // If this is an owner, sync to all created users
  if (user.role === UserRole.OWNER) {
    await this.syncCreatedUsersSubscriptions(userId, renewedSubscription);
  }

  // Log the renewal
  await this.syncService.logChange(
    "Subscription",
    renewedSubscription.id,
    SyncOperation.UPDATE,
    renewedSubscription,
    userId,
    user.branch?.id
  );

  return renewedSubscription;
}

  // async createSubscription(
  //   userId: string,
  //   planId: string,
  //   paymentMethod: "cash" | "mtn_momo" | "airtel_money",
  //   transactionId?: string
  // ) {
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new ApiError(404, "User not found");
  //   }

  //   // Get the plan from database
  //   const plan = await AppDataSource.getRepository(SubscriptionPlan).findOne({
  //     where: { id: planId, isActive: true },
  //   });

  //   if (!plan) {
  //     throw new ApiError(404, "Subscription plan not found or inactive");
  //   }

  //   // Calculate dates
  //   const startDate = new Date();
  //   const endDate = new Date();
  //   endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

  //   // Cancel any existing active subscription
  //   await this.subscriptionRepository.update(
  //     { userId, status: SubscriptionStatus.ACTIVE },
  //     { status: SubscriptionStatus.CANCELLED }
  //   );

  // // For non-trial subscriptions, set status to PENDING initially
  // const status = plan.isTrial
  //   ? SubscriptionStatus.ACTIVE
  //   : SubscriptionStatus.PENDING;
  //   const subscription = this.subscriptionRepository.create({
  //     user,
  //     plan,
  //     planId: plan.id,
  //     amount: plan.price, // Use the price from the plan
  //     startDate,
  //     endDate,
  //     paymentMethod,
  //     status, // Set status based on plan type
  //     features: plan.features, // Get features directly from plan
  //   });

  //   await this.subscriptionRepository.save(subscription);

  //   // Update user's subscription status
  //   user.lastSubscriptionId = subscription.id;
  //   await this.userRepository.save(user);

  //   // Log for sync
  //   await this.syncService.logChange(
  //     "Subscription",
  //     subscription.id,
  //     SyncOperation.CREATE,
  //     subscription,
  //     userId,
  //     user.branchId
  //   );

  //   return subscription;
  // }

  async createSubscriptionForTrailPeriod(
    userId: string,
    planId: string,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    transactionId?: string
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["branch"],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get the plan with all details including duration
    const plan = await AppDataSource.getRepository(SubscriptionPlan).findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found or inactive");
    }

    // Validate trial plan configuration
    if (plan.isTrial && (!plan.durationDays || plan.durationDays <= 0)) {
      throw new ApiError(
        400,
        "Trial plans must have a positive durationDays value"
      );
    }

    // Calculate dates based on plan type
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (plan.isTrial) {
      // For trials, use durationDays
      endDate.setDate(endDate.getDate() + plan.durationDays);
    } else {
      // For regular subscriptions, use the durationUnit
      switch (plan.durationUnit) {
        case "days":
          endDate.setDate(endDate.getDate() + (plan.durationDays || 30));
          break;
        case "months":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "years":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month
      }
    }

    // Ensure end date is at end of day (23:59:59)
    endDate.setHours(23, 59, 59, 999);

    // Cancel any existing active subscription
    await this.subscriptionRepository.update(
      { userId, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELLED }
    );

    const subscription = this.subscriptionRepository.create({
      user,
      plan,
      planId: plan.id,
      amount: plan.price,
      startDate,
      endDate,
      paymentMethod: plan.isTrial ? undefined : paymentMethod, // No payment for trials
      status: SubscriptionStatus.ACTIVE,
      features: plan.features,
      isTrial: plan.isTrial,
    });

    await this.subscriptionRepository.save(subscription);

    // Update user's subscription status
    user.lastSubscriptionId = subscription.id;
    await this.userRepository.save(user);

    // Log for sync
    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.CREATE,
      subscription,
      userId,
      user.branch?.id
    );

    return subscription;
  }

  async getCurrentSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE },
        { userId, status: SubscriptionStatus.PENDING },
      ],
      order: { createdAt: "DESC" },
    });

    if (!subscription) {
      throw new ApiError(404, "No active or pending subscription found");
    }

    return subscription;
  }

  async getCurrentActiveSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: "DESC" },
    });

    if (!subscription) {
      throw new ApiError(404, "No active subscription found");
    }

    return subscription;
  }

  async getSubscriptionHistory(userId: string) {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
      relations: ["user"],
    });

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ApiError(400, "Only active subscriptions can be cancelled");
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionRepository.save(subscription);

    // Log for sync
    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.UPDATE,
      subscription,
      userId,
      subscription.user?.branchId
    );

    return { message: "Subscription cancelled successfully" };
  }


  async toggleAutoRenew(userId: string, subscriptionId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ApiError(400, "Only active subscriptions can be auto-renewed");
    }

    subscription.autoRenew = !subscription.autoRenew;
    await this.subscriptionRepository.save(subscription);

    // Log for sync
    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.UPDATE,
      subscription,
      userId,
      subscription.user.branchId
    );

    return subscription;
  }

  async getSubscriptionPlans() {
    return [
      {
        id: "basic",
        name: "Basic",
        price: 50000,
        maxUsers: 1,
        maxTransactions: 100,
        features: ["Basic POS", "Inventory Management"],
        isPopular: false,
      },
      {
        id: "premium",
        name: "Premium",
        price: 150000,
        maxUsers: 3,
        maxTransactions: 500,
        features: [
          "Basic POS",
          "Inventory Management",
          "Advanced Reports",
          "Customer Management",
        ],
        isPopular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 300000,
        maxUsers: 10,
        maxTransactions: 0, // Unlimited
        features: [
          "Basic POS",
          "Inventory Management",
          "Advanced Reports",
          "Multi-Location",
          "Customer Management",
          "Priority Support",
        ],
        isPopular: false,
      },
    ];
  }

  async checkFeatureAccess(userId: string, feature: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) {
      return false; // No subscription = no access
    }

    return subscription.features?.includes(feature) || false;
  }

  async activateSubscription(subscriptionId: string, activatedById: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ["user", "user.branch", "plan"],
    });

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new ApiError(400, "Only pending subscriptions can be activated");
    }

    // Update status to ACTIVE
    subscription.status = SubscriptionStatus.ACTIVE;
    await this.subscriptionRepository.save(subscription);

    // If this is an owner/admin activating their subscription, update all their created users
    if (
      subscription.user.role === UserRole.OWNER ||
      subscription.user.role === UserRole.ADMIN
    ) {
      await this.activateCreatedUsersSubscriptions(
        subscription.user.id,
        subscription
      );
    }

    // Log for sync
    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.UPDATE,
      subscription,
      activatedById,
      subscription.user?.branch?.id
    );

    return subscription;
  }

  private async activateCreatedUsersSubscriptions(
    ownerId: string,
    ownerSubscription: Subscription
  ) {
    // Find all active users created by this owner
    const usersCreatedByOwner = await this.userRepository.find({
      where: {
        createdBy: { id: ownerId } as any,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      relations: ["subscriptions"],
    });

    const activationPromises = usersCreatedByOwner.map(async (user) => {
      // Find the user's pending subscription (if any)
      const pendingSubscription = user.subscriptions?.find(
        (sub) => sub.status === SubscriptionStatus.PENDING
      );

      if (pendingSubscription) {
        // Activate the pending subscription
        pendingSubscription.status = SubscriptionStatus.ACTIVE;
        pendingSubscription.startDate = new Date();
        pendingSubscription.endDate = ownerSubscription.endDate;
        await this.subscriptionRepository.save(pendingSubscription);

        // Log for sync
        await this.syncService.logChange(
          "Subscription",
          pendingSubscription.id,
          SyncOperation.UPDATE,
          pendingSubscription,
          ownerId,
          user.branchId
        );
      } else {
        // Create new active subscription matching owner's
        const newSubscription = this.subscriptionRepository.create({
          user: { id: user.id },
          plan: ownerSubscription.plan,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: ownerSubscription.endDate,
          autoRenew: false,
          amount: ownerSubscription.amount,
          features: ownerSubscription.features,
        });
        await this.subscriptionRepository.save(newSubscription);

        // Log for sync
        await this.syncService.logChange(
          "Subscription",
          newSubscription.id,
          SyncOperation.CREATE,
          newSubscription,
          ownerId,
          user.branchId
        );
      }
    });

    await Promise.all(activationPromises);
  }

  // async activateSubscription(subscriptionId: string, activatedById: string) {
  //   const subscription = await this.subscriptionRepository.findOne({
  //     where: { id: subscriptionId },
  //     relations: ["user", "user.branch"],
  //   });

  //   if (!subscription) {
  //     throw new ApiError(404, "Subscription not found");
  //   }

  //   if (subscription.status !== SubscriptionStatus.PENDING) {
  //     throw new ApiError(400, "Only pending subscriptions can be activated");
  //   }

  //   // Update status to ACTIVE
  //   subscription.status = SubscriptionStatus.ACTIVE;
  //   await this.subscriptionRepository.save(subscription);

  //   // Log for sync
  //   await this.syncService.logChange(
  //     "Subscription",
  //     subscription.id,
  //     SyncOperation.UPDATE,
  //     subscription,
  //     activatedById,
  //     subscription.user?.branch?.id
  //   );

  //   return subscription;
  // }

  async inactivateSubscription(
    subscriptionId: string,
    inactivatedById: string
  ) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ["user", "user.branch"],
    });

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ApiError(400, "Only active subscriptions can be inactivated");
    }

    // Update status to INACTIVE
    subscription.status = SubscriptionStatus.INACTIVE;
    await this.subscriptionRepository.save(subscription);

    // If this is an owner/admin inactivating their subscription, inactivate all their created users' subscriptions
    if (
      subscription.user.role === UserRole.OWNER ||
      subscription.user.role === UserRole.ADMIN
    ) {
      await this.inactivateCreatedUsersSubscriptions(
        subscription.user.id,
        inactivatedById
      );
    }

    // Log for sync
    await this.syncService.logChange(
      "Subscription",
      subscription.id,
      SyncOperation.UPDATE,
      subscription,
      inactivatedById,
      subscription.user?.branch?.id
    );

    return subscription;
  }

  private async inactivateCreatedUsersSubscriptions(
    ownerId: string,
    inactivatedById: string
  ) {
    // Find all active users created by this owner
    const usersCreatedByOwner = await this.userRepository.find({
      where: {
        createdBy: { id: ownerId } as any,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      relations: ["subscriptions", "branch"],
    });

    const inactivationPromises = usersCreatedByOwner.map(async (user) => {
      // Find the user's active subscription (if any)
      const activeSubscription = user.subscriptions?.find(
        (sub) => sub.status === SubscriptionStatus.ACTIVE
      );

      if (activeSubscription) {
        // Inactivate the active subscription
        activeSubscription.status = SubscriptionStatus.INACTIVE;
        await this.subscriptionRepository.save(activeSubscription);

        // Log for sync
        await this.syncService.logChange(
          "Subscription",
          activeSubscription.id,
          SyncOperation.UPDATE,
          activeSubscription,
          inactivatedById,
          user.branch?.id
        );
      }
    });

    await Promise.all(inactivationPromises);
  }

  // async inactivateSubscription(
  //   subscriptionId: string,
  //   inactivatedById: string
  // ) {
  //   const subscription = await this.subscriptionRepository.findOne({
  //     where: { id: subscriptionId },
  //     relations: ["user", "user.branch"],
  //   });

  //   if (!subscription) {
  //     throw new ApiError(404, "Subscription not found");
  //   }

  //   if (subscription.status !== SubscriptionStatus.ACTIVE) {
  //     throw new ApiError(400, "Only active subscriptions can be inactivated");
  //   }

  //   // Update status to INACTIVE
  //   subscription.status = SubscriptionStatus.INACTIVE;
  //   await this.subscriptionRepository.save(subscription);

  //   // Log for sync
  //   await this.syncService.logChange(
  //     "Subscription",
  //     subscription.id,
  //     SyncOperation.UPDATE,
  //     subscription,
  //     inactivatedById,
  //     subscription.user?.branch?.id
  //   );

  //   return subscription;
  // }
}
