import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../services/ExpenseService";
import { expenseSchema, expenseUpdateSchema } from "../utils/validationSchemas";

export class ExpenseController {
  private expenseService: ExpenseService;

  constructor() {
    this.expenseService = new ExpenseService();
  }

  public createExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = expenseSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const expense = await this.expenseService.createExpense({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  };

  public getExpenses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        category: req.query.category as string,
        paymentMethod: req.query.paymentMethod as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await this.expenseService.getExpenses(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.getExpenseById(id);
      res.json(expense);
    } catch (error) {
      next(error);
    }
  };

  public updateExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { error } = expenseUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const expense = await this.expenseService.updateExpense(
        id,
        req.body,
        req.user.id
      );
      res.json(expense);
    } catch (error) {
      next(error);
    }
  };

  public deleteExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.expenseService.deleteExpense(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getExpenseAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const period = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const analytics = await this.expenseService.getExpenseAnalytics(
        branchId,
        period
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
    getExpensesByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params
      const { startDate, endDate, groupBy } = req.query

      if (!startDate || !endDate) {
         res.status(400).json({ error: "Start date and end date are required" })
         return
      }

      const result = await this.expenseService.getExpensesByDateRange(
        branchId,
        new Date(startDate as string),
        new Date(endDate as string),
        (groupBy as "day" | "week" | "month") || "day",
      )

      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}

