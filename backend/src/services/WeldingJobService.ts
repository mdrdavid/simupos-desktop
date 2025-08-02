import { In, Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  WeldingJob,
  WeldingMaterialNeeded,
  WeldingJobExpense,
  WeldingJobImage,
  User,
} from "../models";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { UserRole } from "../models/User";

export class WeldingJobService {
  private jobRepository: Repository<WeldingJob>;
  private materialNeededRepository: Repository<WeldingMaterialNeeded>;
  private expenseRepository: Repository<WeldingJobExpense>;
  private imageRepository: Repository<WeldingJobImage>;
  private syncService: SyncService;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(WeldingJob);
    this.materialNeededRepository = AppDataSource.getRepository(
      WeldingMaterialNeeded
    );
    this.expenseRepository = AppDataSource.getRepository(WeldingJobExpense);
    this.imageRepository = AppDataSource.getRepository(WeldingJobImage);
    this.syncService = new SyncService();
  }

  async createJob(
    jobData: Partial<WeldingJob>,
    materials: Partial<WeldingMaterialNeeded>[],
    userId: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify required fields
      if (
        !jobData.customerName ||
        !jobData.customerContact ||
        !jobData.jobType ||
        !jobData.description ||
        !jobData.estimatedCost ||
        !jobData.requiredDeliveryDate
      ) {
        throw new ApiError(400, "Missing required job fields");
      }
      // Validate artisans if provided
      if (jobData.assignedArtisans && jobData.assignedArtisans.length > 0) {
        const validArtisans = await queryRunner.manager.find(User, {
          where: {
            id: In(jobData.assignedArtisans),
            role: In([UserRole.ARTISAN, UserRole.OWNER]),
            branchId: jobData.branchId,
          },
        });

        if (validArtisans.length !== jobData.assignedArtisans.length) {
          throw new ApiError(
            400,
            "One or more assigned artisans are invalid or don't belong to this branch"
          );
        }
      }
      // Create the job with all required fields
      const job = this.jobRepository.create({
        ...jobData,
        //   status: WeldingJobStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await queryRunner.manager.save(job);

      // Add materials
      const materialEntities = materials.map((material) =>
        this.materialNeededRepository.create({
          ...material,
          weldingJob: job,
        })
      );
      await queryRunner.manager.save(materialEntities);

      await queryRunner.commitTransaction();

      await this.syncService.logChange(
        "WeldingJob",
        job.id,
        SyncOperation.CREATE,
        job,
        userId,
        job.branchId
      );

      return job;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateJob(
    jobId: string,
    updates: Partial<WeldingJob>,
    userId: string
  ): Promise<WeldingJob | any> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const job = await queryRunner.manager.findOne(WeldingJob, {
        where: { id: jobId },
        relations: ["branch"],
      });

      if (!job) {
        throw new ApiError(404, "Welding job not found");
      }

      // Validate assigned artisans exist
      if (updates.assignedArtisans) {
        const artisans = await queryRunner.manager.find(User, {
          where: {
            id: In(updates.assignedArtisans),
            role: In([UserRole.ARTISAN, UserRole.OWNER]),
          },
        });
        console.log("Artisans found:", artisans);
        if (artisans.length !== updates.assignedArtisans.length) {
          throw new ApiError(400, "One or more artisans not found");
        }
      }

      // Merge updates
      const updatedJob = queryRunner.manager.merge(WeldingJob, job, updates);

      await queryRunner.manager.save(updatedJob);
      await queryRunner.commitTransaction();

      // Log the change
      await this.syncService.logChange(
        "WeldingJob",
        job.id,
        SyncOperation.UPDATE,
        updates,
        userId,
        job.branchId
      );

      return updatedJob;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //   async updateJob(jobId: string, updates: Partial<WeldingJob>, userId: string) {
  //     const job = await this.jobRepository.findOne({ where: { id: jobId } });
  //     if (!job) {
  //       throw new ApiError(404, "Welding job not found");
  //     }

  //     const updatedJob = this.jobRepository.merge(job, updates);
  //     await this.jobRepository.save(updatedJob);

  //     await this.syncService.logChange(
  //       "WeldingJob",
  //       job.id,
  //       SyncOperation.UPDATE,
  //       updatedJob,
  //       userId,
  //       job.branchId
  //     );

  //     return updatedJob;
  //   }

  async deleteJob(jobId: string, userId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, "Welding job not found");
    }

    job.isDeleted = true;
    await this.jobRepository.save(job);

    await this.syncService.logChange(
      "WeldingJob",
      job.id,
      SyncOperation.DELETE,
      job,
      userId,
      job.branchId
    );

    return { message: "Job marked as deleted" };
  }

  async getJobById(jobId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, isDeleted: false },
      relations: ["materialsNeeded", "expenses", "imageUploads", "branch"],
    });

    if (!job) {
      throw new ApiError(404, "Welding job not found");
    }

    return job;
  }

  async getJobsByBranch(
    branchId: string,
    filters: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.materialsNeeded", "materials")
      .leftJoinAndSelect("job.expenses", "expenses")
      .where("job.branchId = :branchId", { branchId })
      .andWhere("job.isDeleted = false");

    if (filters.status) {
      queryBuilder.andWhere("job.status = :status", { status: filters.status });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(job.customerName ILIKE :search OR job.jobType ILIKE :search OR job.description ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("job.requiredDeliveryDate", "ASC");

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async addExpenseToJob(
    jobId: string,
    expenseData: Partial<WeldingJobExpense>,
    userId: string
  ) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, "Welding job not found");
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      weldingJob: job,
    });
    await this.expenseRepository.save(expense);

    await this.syncService.logChange(
      "WeldingJobExpense",
      expense.id,
      SyncOperation.CREATE,
      expense,
      userId,
      job.branchId
    );

    return expense;
  }

  async addImageToJob(
    jobId: string,
    imageData: Partial<WeldingJobImage>,
    userId: string
  ) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, "Welding job not found");
    }

    const image = this.imageRepository.create({
      ...imageData,
      weldingJob: job,
    });
    await this.imageRepository.save(image);

    await this.syncService.logChange(
      "WeldingJobImage",
      image.id,
      SyncOperation.CREATE,
      image,
      userId,
      job.branchId
    );

    return image;
  }
}
