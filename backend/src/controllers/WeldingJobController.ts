import { Request, Response, NextFunction } from "express";
import { WeldingJobService } from "../services/WeldingJobService";
import { ApiError } from "../utils/ApiError";
import {
  weldingJobSchema,
  weldingMaterialSchema,
  weldingExpenseSchema,
  weldingImageSchema,
  weldingJobUpdateSchema,
} from "../utils/validationSchemas";

export class WeldingJobController {
  private service: WeldingJobService;

  constructor() {
    this.service = new WeldingJobService();
  }

  createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Incoming request body:", req.body);

      if (!req.body.job) {
        throw new ApiError(400, "Job data is required");
      }

      const { error } = weldingJobSchema.validate(req.body.job);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const materials = req.body.materials || [];
      const materialsErrors = materials
        .map((material: any) => weldingMaterialSchema.validate(material).error)
        .filter(Boolean);

      if (materialsErrors?.length) {
        throw new ApiError(400, materialsErrors[0].details[0].message);
      }

      console.log("Validated job data:", req.body.job);
      console.log("Validated materials:", materials);

      const job = await this.service.createJob(
        req.body.job,
        materials,
        req.user.id
      );

      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  };

  updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Clean the input data first
      //   if (req.body.assignedArtisan === "") {
      //     req.body.assignedArtisan = null;
      //   }

      const { error } = weldingJobUpdateSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const job = await this.service.updateJob(id, req.body, req.user.id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteJob(id, req.user.id);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const job = await this.service.getJobById(id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  };

  getJobsByBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        status: req.query.status as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.getJobsByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  addExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const { error } = weldingExpenseSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const expense = await this.service.addExpenseToJob(
        jobId,
        req.body,
        req.user.id
      );
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  };

  addImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      const { error } = weldingImageSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const image = await this.service.addImageToJob(
        jobId,
        req.body,
        req.user.id
      );
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  };
}
