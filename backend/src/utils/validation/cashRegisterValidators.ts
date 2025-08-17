import Joi from "joi";

export const openRegisterSchema = Joi.object({
  openingFloat: Joi.number().positive().required().messages({
    "number.positive": "Opening float must be a positive number",
    "any.required": "Opening float is required",
  }),
  branchId: Joi.string().uuid().required().messages({
    "string.uuid": "Branch ID must be a valid UUID",
    "any.required": "Branch ID is required",
  }),
});

export const closeRegisterSchema = Joi.object({
  sessionId: Joi.string().uuid().required().messages({
    "string.uuid": "Session ID must be a valid UUID",
    "any.required": "Session ID is required",
  }),
  closingBalance: Joi.number().min(0).required().messages({
    "number.min": "Closing balance cannot be negative",
    "any.required": "Closing balance is required",
  }),
  notes: Joi.string().max(500).optional().messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

export const cashInOutSchema = Joi.object({
  sessionId: Joi.string().uuid().required().messages({
    "string.uuid": "Session ID must be a valid UUID",
    "any.required": "Session ID is required",
  }),
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),
  reason: Joi.string().min(3).max(200).required().messages({
    "string.min": "Reason must be at least 3 characters",
    "string.max": "Reason cannot exceed 200 characters",
    "any.required": "Reason is required",
  }),
});

export const getSessionsSchema = Joi.object({
  branchId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid("OPEN", "CLOSED").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
