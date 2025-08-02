import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req,
  res,
  next
) => {
  console.error("Error:", error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
    return;
  }

  // Database errors
  if (error.name === "QueryFailedError") {
    res.status(400).json({
      error: "Database query failed",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
    return;
  }

  // Validation errors
  if (error.name === "ValidationError") {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};