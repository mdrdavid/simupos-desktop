import Joi from "joi";
import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services";
import {
  registerSchema,
  loginSchema,
  otpSchema,
  pinSchema,
  loginSchemaWithPin,
} from "../utils/validationSchemas";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = loginSchemaWithPin.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { phone, pin } = req.body;
      const result = await this.authService.login(phone, pin);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get userId from authenticated request (added by your auth middleware)
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      await this.authService.logout(userId);

      // Clear client-side token (this is just a convention - actual invalidation happens server-side)
      res.clearCookie("token");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };
  public loginWithEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { email, password } = req.body;
      const result = await this.authService.loginWithEmail(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = Joi.object({
        userId: Joi.string().required(),
        otp: Joi.string().required().length(6).pattern(/^\d+$/),
      }).validate(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { userId, otp } = req.body;
      const result = await this.authService.verifyOTP(userId, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = Joi.object({
        userId: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { userId } = req.body;
      const result = await this.authService.resendOTP(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  public setupPIN = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = pinSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { userId, pin } = req.body;
      const result = await this.authService.setupPIN(userId, pin);
      res.json(result);
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
      const { error } = pinSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { userId, pin } = req.body;
      const result = await this.authService.verifyPIN(userId, pin);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
