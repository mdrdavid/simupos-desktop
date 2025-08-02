
import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/CustomerService";
import { customerSchema } from "../utils/validationSchemas";



export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  public createCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = customerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const customer = await this.customerService.createCustomer({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  };

  public getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        search: req.query.search as string,
        customerType: req.query.customerType as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await this.customerService.getCustomers(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  public updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { error } = customerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const customer = await this.customerService.updateCustomer(
        id,
        req.body,
        req.user.id
      );
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  public deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.customerService.deleteCustomer(id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getCustomerAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const analytics = await this.customerService.getCustomerAnalytics(branchId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
}