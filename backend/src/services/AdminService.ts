import { AppDataSource } from "../config/database";
import { Business } from "../models/Business";
import { User, UserStatus } from "../models/User";
import { Item } from "../models/Item";
import { Transaction } from "../models/Transaction";
import { Subscription, SubscriptionStatus } from "../models/Subscription";
import { Brackets } from "typeorm";

export class AdminService {
  private businessRepository = AppDataSource.getRepository(Business);
  private userRepository = AppDataSource.getRepository(User);
  private itemRepository = AppDataSource.getRepository(Item);
  private transactionRepository = AppDataSource.getRepository(Transaction);
  private subscriptionRepository = AppDataSource.getRepository(Subscription);

  // Business Management
  async getAllBusinesses(): Promise<Business[]> {
    return this.businessRepository.find({ relations: ["owner"] });
  }

  async getBusinessById(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ["owner"],
    });
    if (!business) {
      throw new Error("Business not found");
    }
    return business;
  }

  async deleteBusiness(id: string): Promise<void> {
    await this.businessRepository.delete(id);
  }

  // User Management
  async deactivateUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);

    if (user.role === "owner") {
      const usersToDeactivate = await this.userRepository.find({
        where: { createdById: id },
      });
      for (const userToDeactivate of usersToDeactivate) {
        userToDeactivate.status = UserStatus.INACTIVE;
        await this.userRepository.save(userToDeactivate);
      }
    }
  }
  async getUsersByBusiness(businessId: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder("user")
      .innerJoin("user.ownedBusinesses", "business")
      .where("business.id = :businessId", { businessId })
      .getMany();
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async deleteUserAndBusiness(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["ownedBusinesses"],
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.ownedBusinesses) {
      for (const business of user.ownedBusinesses) {
        await this.businessRepository.delete(business.id);
      }
    }
    await this.userRepository.delete(id);
  }

  // Inventory and Transactions
  async getTotalStockByBranch(branchId: string): Promise<number> {
    const { sum } = await this.itemRepository
      .createQueryBuilder("item")
      .select("SUM(item.quantity)", "sum")
      .where("item.branchId = :branchId", { branchId })
      .getRawOne();
    return sum || 0;
  }

  async getTotalTransactionsByBusiness(businessId: string): Promise<number> {
    return this.transactionRepository
      .createQueryBuilder("transaction")
      .innerJoin("transaction.branch", "branch")
      .where("branch.businessId = :businessId", { businessId })
      .getCount();
  }

  async getTotalTransactionAmountByBusiness(
    businessId: string
  ): Promise<number> {
    const { sum } = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "sum")
      .innerJoin("transaction.branch", "branch")
      .where("branch.businessId = :businessId", { businessId })
      .getRawOne();
    return sum || 0;
  }

  // Subscription Management
  async getAllSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ["business", "user"],
    });
  }

  async getSubscriptionStatus(
    businessId?: string,
    userId?: string
  ): Promise<Subscription[]> {
    const query =
      this.subscriptionRepository.createQueryBuilder("subscription");

    if (businessId) {
      query.where("subscription.businessId = :businessId", { businessId });
    } else if (userId) {
      query.where("subscription.userId = :userId", { userId });
    } else {
      throw new Error("Either businessId or userId must be provided");
    }

    return query.getMany();
  }

  async updateSubscriptionStatus(
    id: string,
    status: SubscriptionStatus
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    subscription.status = status;
    return this.subscriptionRepository.save(subscription);
  }

  async deleteSubscription(id: string): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}
