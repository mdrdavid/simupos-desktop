import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { UserRole, UserStatus } from "../models/User";
import { userSchema, updateUserSchema } from "../utils/validationSchemas";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = userSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const user = await this.userService.createUser(req.body, req.user.id);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const filters = {
        search: req.query.search as string,
        role: req.query.role as UserRole,
        status: req.query.status as UserStatus,
        page: Number.parseInt(req.query.page as string) || 1,
        limit: Number.parseInt(req.query.limit as string) || 20,
      };

      const result = await this.userService.getUsers(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const user = await this.userService.updateUser(id, req.body, req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  public softdeleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.userService.softdeleteUser(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  public setupPIN = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;

      if (!pin || pin.length !== 4) {
        res.status(400).json({ error: "PIN must be 4 digits" });
        return;
      }

      const user = await this.userService.updateUser(
        id,
        { pinHash: pin },
        req.user.id
      );
      res.json({ message: "PIN setup successfully" });
    } catch (error) {
      next(error);
    }
  };

  public verifyPIN = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;

      if (!pin || pin.length !== 4) {
        res.status(400).json({ error: "PIN must be 4 digits" });
        return;
      }

      await this.userService.verifyPIN(id, pin);
      res.json({ message: "PIN verified successfully" });
    } catch (error) {
      next(error);
    }
  };
}
