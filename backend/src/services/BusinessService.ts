import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Business, Branch, User } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { UserRole } from "../models/User";

export class BusinessService {
  private businessRepository: Repository<Business>;
  private branchRepository: Repository<Branch>;
  private userRepository: Repository<User>;
  private syncService: SyncService;

  constructor() {
    this.businessRepository = AppDataSource.getRepository(Business);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.userRepository = AppDataSource.getRepository(User);
    this.syncService = new SyncService();
  }

  async createBusiness(businessData: Partial<Business>, userId: string) {
    // Check if business name already exists
    const existingBusiness = await this.businessRepository.findOne({
      where: { name: businessData.name, isDeleted: false },
    });

    if (existingBusiness) {
      throw new ApiError(400, "Business with this name already exists");
    }

    // Get the user who will be the owner
    const owner = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!owner) {
      throw new ApiError(404, "User not found");
    }

    // Create the business
    const business = this.businessRepository.create({
      ...businessData,
      owner,
    });

    await this.businessRepository.save(business);

    // Create the main branch automatically
    const mainBranch = this.branchRepository.create({
      name: "Main Branch",
      isMain: true,
      business,
    });

    await this.branchRepository.save(mainBranch);

    // Update the owner's branch to the main branch
    owner.branch = mainBranch;
    owner.role = UserRole.OWNER; // Ensure owner role is set
    await this.userRepository.save(owner);

    // Log for sync
    await this.syncService.logChange(
      "Business",
      business.id,
      SyncOperation.CREATE,
      business,
      userId,
      business.id
    );

    await this.syncService.logChange(
      "Branch",
      mainBranch.id,
      SyncOperation.CREATE,
      mainBranch,
      userId,
      mainBranch.id
    );

    return {
      business,
      mainBranch,
    };
  }

  async updateBusiness(
    id: string,
    updateData: Partial<Business>,
    userId: string
  ) {
    const business = await this.businessRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["owner"],
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== business.name) {
      const existingBusiness = await this.businessRepository.findOne({
        where: { name: updateData.name, isDeleted: false },
      });

      if (existingBusiness) {
        throw new ApiError(400, "Business with this name already exists");
      }
    }

    Object.assign(business, updateData);
    await this.businessRepository.save(business);

    // Log for sync
    await this.syncService.logChange(
      "Business",
      business.id,
      SyncOperation.UPDATE,
      business,
      userId,
      business.id
    );

    return business;
  }

  async getBusinesses(filters?: {
    search?: string;
    ownerId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryBuilder = this.businessRepository
      .createQueryBuilder("business")
      .leftJoinAndSelect("business.owner", "owner")
      .leftJoinAndSelect("business.branches", "branches")
      .where("business.isDeleted = false");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(business.name ILIKE :search OR business.address ILIKE :search)",
        {
          search: `%${filters.search}%`,
        }
      );
    }

    if (filters?.ownerId) {
      queryBuilder.andWhere("owner.id = :ownerId", {
        ownerId: filters.ownerId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("business.name", "ASC");

    const [businesses, total] = await queryBuilder.getManyAndCount();

    return {
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBusinessById(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["owner", "branches"],
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    return business;
  }

  async deleteBusiness(id: string, userId: string) {
    const business = await this.businessRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["branches"],
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    // Check if business has branches with active users
    for (const branch of business.branches) {
      const activeUsers = await this.userRepository.count({
        where: { branchId: branch.id, isActive: true },
      });

      if (activeUsers > 0) {
        throw new ApiError(
          400,
          "Cannot delete business with active users in its branches. Please delete branches first."
        );
      }
    }

    business.isDeleted = true;
    await this.businessRepository.save(business);

    // Also mark all branches as deleted
    await this.branchRepository.update(
      { business: { id: business.id } },
      { isDeleted: true, isActive: false }
    );

    // Log for sync
    await this.syncService.logChange(
      "Business",
      business.id,
      SyncOperation.DELETE,
      business,
      userId,
      business.id
    );

    return { message: "Business deleted successfully" };
  }

  async getBusinessStats(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["branches"],
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    // Get stats for all branches
    const branchStats = await Promise.all(
      business.branches.map(async (branch) => {
        const stats = await AppDataSource.createQueryBuilder()
          .select([
            "COUNT(DISTINCT sale.id) as total_sales",
            "COALESCE(SUM(sale.total), 0) as total_revenue",
            "COUNT(DISTINCT expense.id) as total_expenses",
            "COALESCE(SUM(expense.amount), 0) as total_expense_amount",
            "COUNT(DISTINCT item.id) as total_items",
            "COUNT(DISTINCT user.id) as total_users",
          ])
          .from("branches", "branch")
          .leftJoin("branch.sales", "sale")
          .leftJoin("branch.expenses", "expense")
          .leftJoin("branch.items", "item")
          .leftJoin("branch.users", "user")
          .where("branch.id = :branchId", { branchId: branch.id })
          .andWhere("branch.isDeleted = false")
          .andWhere("sale.isDeleted = false")
          .andWhere("expense.isDeleted = false")
          .andWhere("item.isDeleted = false")
          .andWhere("user.isDeleted = false")
          .getRawOne();

        return {
          branchId: branch.id,
          branchName: branch.name,
          ...stats,
        };
      })
    );

    // Calculate totals
    const totals = branchStats.reduce(
      (acc, stats) => ({
        totalSales: acc.totalSales + Number.parseInt(stats.total_sales) || 0,
        totalRevenue:
          acc.totalRevenue + Number.parseFloat(stats.total_revenue) || 0,
        totalExpenses:
          acc.totalExpenses + Number.parseInt(stats.total_expenses) || 0,
        totalExpenseAmount:
          acc.totalExpenseAmount +
            Number.parseFloat(stats.total_expense_amount) || 0,
        totalItems: acc.totalItems + Number.parseInt(stats.total_items) || 0,
        totalUsers: acc.totalUsers + Number.parseInt(stats.total_users) || 0,
      }),
      {
        totalSales: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalExpenseAmount: 0,
        totalItems: 0,
        totalUsers: 0,
      }
    );

    // Calculate profit
    const netProfit = totals.totalRevenue - totals.totalExpenseAmount;
    const profitMargin =
      totals.totalRevenue > 0 ? (netProfit / totals.totalRevenue) * 100 : 0;

    return {
      business: {
        id: business.id,
        name: business.name,
        totalBranches: business.branches.length,
      },
      totals,
      profitability: {
        netProfit,
        profitMargin,
      },
      branches: branchStats.map((stats) => ({
        branchId: stats.branchId,
        branchName: stats.branchName,
        totalSales: Number.parseInt(stats.total_sales) || 0,
        totalRevenue: Number.parseFloat(stats.total_revenue) || 0,
        totalExpenses: Number.parseInt(stats.total_expenses) || 0,
        totalExpenseAmount: Number.parseFloat(stats.total_expense_amount) || 0,
        totalItems: Number.parseInt(stats.total_items) || 0,
        totalUsers: Number.parseInt(stats.total_users) || 0,
      })),
    };
  }
}
