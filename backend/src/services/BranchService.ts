import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Branch, Business, User } from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
export class BranchService {
  private branchRepository: Repository<Branch>;
  private userRepository: Repository<User>;
  private syncService: SyncService;

  constructor() {
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.userRepository = AppDataSource.getRepository(User);
    this.syncService = new SyncService();
  }

  async createBranch(
    branchData: Partial<Branch>,
    userId: string,
    businessId: string
  ) {
    // Check if business exists
    const business = await AppDataSource.getRepository(Business).findOne({
      where: { id: businessId, isDeleted: false },
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    // Check if branch name already exists in this business
    const existingBranch = await this.branchRepository.findOne({
      where: {
        name: branchData.name,
        business: { id: businessId },
        isDeleted: false,
      },
    });

    if (existingBranch) {
      throw new ApiError(
        400,
        "Branch with this name already exists in this business"
      );
    }

    // Check if this is the first branch (to set as main)
    const isFirstBranch =
      (await this.branchRepository.count({
        where: {
          business: { id: businessId },
          isDeleted: false,
        },
      })) === 0;

    const branch = this.branchRepository.create({
      ...branchData,
      isMain: isFirstBranch,
      business: business,
    });

    await this.branchRepository.save(branch);

    // Log for sync
    await this.syncService.logChange(
      "Branch",
      branch.id,
      SyncOperation.CREATE,
      branch,
      userId,
      branch.id
    );

    return branch;
  }

  async getBranchesByBusiness(
    businessId: string,
    filters?: {
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }
  ) {
    // Check if business exists
    const businessExists = await AppDataSource.getRepository(Business).count({
      where: { id: businessId, isDeleted: false },
    });

    if (!businessExists) {
      throw new ApiError(404, "Business not found");
    }

    const queryBuilder = this.branchRepository
      .createQueryBuilder("branch")
      .leftJoinAndSelect("branch.users", "users")
      .where("branch.businessId = :businessId", { businessId })
      .andWhere("branch.isDeleted = false");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(branch.name ILIKE :search OR branch.address ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("branch.isActive = :isActive", {
        isActive: filters.isActive,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("branch.isMain", "DESC");
    queryBuilder.addOrderBy("branch.name", "ASC");

    const [branches, total] = await queryBuilder.getManyAndCount();

    return {
      branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  async updateBranch(id: string, updateData: Partial<Branch>, userId: string) {
    const branch = await this.branchRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    // Prevent changing main branch status
    if (branch.isMain && updateData.isMain === false) {
      throw new ApiError(400, "Cannot remove main branch status");
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== branch.name) {
      const existingBranch = await this.branchRepository.findOne({
        where: { name: updateData.name, isDeleted: false },
      });

      if (existingBranch) {
        throw new ApiError(400, "Branch with this name already exists");
      }
    }

    Object.assign(branch, updateData);
    await this.branchRepository.save(branch);

    // Log for sync
    await this.syncService.logChange(
      "Branch",
      branch.id,
      SyncOperation.UPDATE,
      branch,
      userId,
      branch.id
    );

    return branch;
  }

  async getBranches(filters?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryBuilder = this.branchRepository
      .createQueryBuilder("branch")
      .leftJoinAndSelect("branch.users", "users")
      .where("branch.isDeleted = false");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(branch.name ILIKE :search OR branch.address ILIKE :search)",
        {
          search: `%${filters.search}%`,
        }
      );
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("branch.isActive = :isActive", {
        isActive: filters.isActive,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("branch.isMain", "DESC");
    queryBuilder.addOrderBy("branch.name", "ASC");

    const [branches, total] = await queryBuilder.getManyAndCount();

    return {
      branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBranchById(id: string) {
    const branch = await this.branchRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["users", "items", "sales", "expenses"],
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    return branch;
  }

  async deleteBranch(id: string, userId: string) {
    const branch = await this.branchRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    if (branch.isMain) {
      throw new ApiError(400, "Cannot delete main branch");
    }

    // Check if branch has active users
    const activeUsers = await this.userRepository.count({
      where: { branchId: id, isActive: true },
    });

    if (activeUsers > 0) {
      throw new ApiError(
        400,
        "Cannot delete branch with active users. Please reassign users first."
      );
    }

    branch.isDeleted = true;
    branch.isActive = false;
    await this.branchRepository.save(branch);

    // Log for sync
    await this.syncService.logChange(
      "Branch",
      branch.id,
      SyncOperation.DELETE,
      branch,
      userId,
      branch.id
    );

    return { message: "Branch deleted successfully" };
  }

  async getBranchStats(
    id: string,
    period?: { startDate?: Date; endDate?: Date }
  ) {
    const branch = await this.branchRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }

    // Get sales stats
    let salesQuery = AppDataSource.createQueryBuilder()
      .select([
        "COUNT(*) as total_sales",
        "COALESCE(SUM(total), 0) as total_revenue",
        "COALESCE(AVG(total), 0) as average_sale",
      ])
      .from("sales", "sale")
      .where("sale.branchId = :branchId", { branchId: id })
      .andWhere("sale.isDeleted = false")
      .andWhere("sale.status = 'completed'");

    if (period?.startDate) {
      salesQuery = salesQuery.andWhere("sale.createdAt >= :startDate", {
        startDate: period.startDate,
      });
    }

    if (period?.endDate) {
      salesQuery = salesQuery.andWhere("sale.createdAt <= :endDate", {
        endDate: period.endDate,
      });
    }

    const salesStats = await salesQuery.getRawOne();

    // Get expense stats
    let expenseQuery = AppDataSource.createQueryBuilder()
      .select([
        "COUNT(*) as total_expenses",
        "COALESCE(SUM(amount), 0) as total_amount",
      ])
      .from("expenses", "expense")
      .where("expense.branchId = :branchId", { branchId: id })
      .andWhere("expense.isDeleted = false");

    if (period?.startDate) {
      expenseQuery = expenseQuery.andWhere("expense.createdAt >= :startDate", {
        startDate: period.startDate,
      });
    }

    if (period?.endDate) {
      expenseQuery = expenseQuery.andWhere("expense.createdAt <= :endDate", {
        endDate: period.endDate,
      });
    }

    const expenseStats = await expenseQuery.getRawOne();

    // Get inventory stats
    const inventoryStats = await AppDataSource.createQueryBuilder()
      .select([
        "COUNT(*) as total_items",
        "COALESCE(SUM(stock), 0) as total_stock",
        "COALESCE(SUM(price * stock), 0) as inventory_value",
        "COUNT(CASE WHEN stock <= minStock THEN 1 END) as low_stock_items",
      ])
      .from("items", "item")
      .where("item.branchId = :branchId", { branchId: id })
      .andWhere("item.isDeleted = false")
      .getRawOne();

    // Calculate profit
    const totalRevenue = Number.parseFloat(salesStats.total_revenue) || 0;
    const totalExpenses = Number.parseFloat(expenseStats.total_amount) || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        isActive: branch.isActive,
        isMain: branch.isMain,
      },
      sales: {
        totalSales: Number.parseInt(salesStats.total_sales) || 0,
        totalRevenue,
        averageSale: Number.parseFloat(salesStats.average_sale) || 0,
      },
      expenses: {
        totalExpenses: Number.parseInt(expenseStats.total_expenses) || 0,
        totalAmount: totalExpenses,
      },
      inventory: {
        totalItems: Number.parseInt(inventoryStats.total_items) || 0,
        totalStock: Number.parseInt(inventoryStats.total_stock) || 0,
        inventoryValue: Number.parseFloat(inventoryStats.inventory_value) || 0,
        lowStockItems: Number.parseInt(inventoryStats.low_stock_items) || 0,
      },
      profitability: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
      },
    };
  }

  async switchBranch(userId: string, branchId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const branch = await this.branchRepository.findOne({
      where: { id: branchId, isDeleted: false, isActive: true },
    });

    if (!branch) {
      throw new ApiError(404, "Branch not found or inactive");
    }

    // Check if user has access to this branch
    if (user.role !== "owner" && user.branchId !== branchId) {
      throw new ApiError(403, "Access denied to this branch");
    }

    return {
      message: "Branch switched successfully",
      branch: {
        id: branch.id,
        name: branch.name,
        isMain: branch.isMain,
      },
    };
  }
}
