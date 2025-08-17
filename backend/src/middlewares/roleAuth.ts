import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/ApiError"

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required")
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions")
    }

    next()
  }
}

export const requireBranchAccess = (req: Request, res: Response, next: NextFunction) => {
  const { branchId } = req.params

  if (!req.user) {
    throw new ApiError(401, "Authentication required")
  }

  // Owners can access all branches
  if (req.user.role === "owner") {
    return next()
  }

  // Other roles can only access their assigned branch
  if (req.user.branchId !== branchId) {
    throw new ApiError(403, "Access denied to this branch")
  }

  next()
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required")
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Insufficient permissions")
  }

  next()
}
