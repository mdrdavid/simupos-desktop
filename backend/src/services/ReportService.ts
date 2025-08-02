import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { ReportType } from "../models/Reports";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { Business, Report, Branch } from "../models";

export class ReportService {
  private reportRepository: Repository<Report>;
  private syncService: SyncService;

  constructor() {
    this.reportRepository = AppDataSource.getRepository(Report);
    this.syncService = new SyncService();
  }

  async generateSalesReport(params: {
    businessId: string;
    branchId?: string;
    startDate?: Date;
    endDate?: Date;
    userId: string;
  }) {
    // Check business exists
    const business = await AppDataSource.getRepository(Business).findOne({
      where: { id: params.businessId, isDeleted: false },
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    // Check branch exists if specified
    if (params.branchId) {
      const branch = await AppDataSource.getRepository(Branch).findOne({
        where: {
          id: params.branchId,
          business: { id: params.businessId },
          isDeleted: false,
        },
      });

      if (!branch) {
        throw new ApiError(404, "Branch not found");
      }
    }

    // Generate report data (simplified - would query actual data in real implementation)
    const reportData = {
      totalSales: 0,
      totalRevenue: 0,
      averageSale: 0,
      paymentMethodBreakdown: {
        cash: 0,
        mtn_momo: 0,
        airtel_money: 0,
      },
      topItems: [],
      salesOverTime: [],
    };

    const report = this.reportRepository.create({
      name: `Sales Report - ${new Date().toLocaleDateString()}`,
      type: ReportType.SALES,
      filters: {
        branchId: params.branchId,
        startDate: params.startDate,
        endDate: params.endDate,
      },
      data: reportData,
      businessId: params.businessId,
      branchId: params.branchId,
      createdById: params.userId,
    });

    await this.reportRepository.save(report);

    // Log for sync
    await this.syncService.logChange(
      "Report",
      report.id,
      SyncOperation.CREATE,
      report,
      params.userId,
      params.branchId
    );

    return report;
  }

  async generateInventoryReport(params: {
    businessId: string;
    branchId?: string;
    userId: string;
  }) {
    // Similar validation as sales report...

    const reportData = {
      totalItems: 0,
      totalStockValue: 0,
      lowStockItems: [],
      outOfStockItems: [],
      stockMovements: [],
    };

    const report = this.reportRepository.create({
      name: `Inventory Report - ${new Date().toLocaleDateString()}`,
      type: ReportType.INVENTORY,
      filters: {
        branchId: params.branchId,
      },
      data: reportData,
      businessId: params.businessId,
      branchId: params.branchId,
      createdById: params.userId,
    });

    await this.reportRepository.save(report);

    // Log for sync
    await this.syncService.logChange(
      "Report",
      report.id,
      SyncOperation.CREATE,
      report,
      params.userId,
      params.branchId
    );

    return report;
  }

  async getReports(
    businessId: string,
    filters?: {
      type?: ReportType;
      branchId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.reportRepository
      .createQueryBuilder("report")
      .where("report.businessId = :businessId", { businessId })
      .andWhere("report.isDeleted = false");

    if (filters?.type) {
      queryBuilder.andWhere("report.type = :type", { type: filters.type });
    }

    if (filters?.branchId) {
      queryBuilder.andWhere("report.branchId = :branchId", {
        branchId: filters.branchId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("report.createdAt", "DESC");

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReportById(id: string) {
    const report = await this.reportRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["business", "branch", "createdBy"],
    });

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    return report;
  }

  async deleteReport(id: string, userId: string) {
    const report = await this.reportRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    report.isDeleted = true;
    await this.reportRepository.save(report);

    // Log for sync
    await this.syncService.logChange(
      "Report",
      report.id,
      SyncOperation.DELETE,
      report,
      userId,
      report.branchId
    );

    return { message: "Report deleted successfully" };
  }
}
