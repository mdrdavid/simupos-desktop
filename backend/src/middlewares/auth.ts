import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../models";
import { ApiError } from "../utils/ApiError";

interface AuthRequest extends Request {
  user: User;
}

export const authenticateToken = async (
  req: Request, // Use standard Request type here
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Access token required");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      relations: ["branch"],
    });

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    if (user.status !== "active") {
      throw new ApiError(401, "Account is not active");
    }

    // Type assertion here if needed
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid token"));
    } else {
      next(error);
    }
  }
};
// export const authenticateToken = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//       throw new ApiError(401, "Access token required");
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "your-secret-key",
//     ) as { userId: string };

//     const userRepository = AppDataSource.getRepository(User);
//     const user = await userRepository.findOne({
//       where: { id: decoded.userId },
//       relations: ["branch"],
//     });

//     if (!user) {
//       throw new ApiError(401, "Invalid token");
//     }

//     if (user.status !== "active") {
//       throw new ApiError(401, "Account is not active");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     if (error instanceof jwt.JsonWebTokenError) {
//       next(new ApiError(401, "Invalid token"));
//     } else {
//       next(error);
//     }
//   }
// };

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }
    next();
  };
};

export const requireAdminRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }

    next();
  };
};
