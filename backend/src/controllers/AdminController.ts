import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';

export class AdminController {
  private adminService = new AdminService();

  // Business Management
  getAllBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businesses = await this.adminService.getAllBusinesses();
      res.status(200).json(businesses);
    } catch (error) {
      next(error);
    }
  };

  getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const business = await this.adminService.getBusinessById(id);
      res.status(200).json(business);
    } catch (error) {
      next(error);
    }
  };

  deleteBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteBusiness(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // User Management
   deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deactivateUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  getUsersByBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.params;
      const users = await this.adminService.getUsersByBusiness(businessId);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  deleteUserAndBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteUserAndBusiness(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Inventory and Transactions
  getTotalStockByBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { branchId } = req.params;
      const totalStock = await this.adminService.getTotalStockByBranch(branchId);
      res.status(200).json({ totalStock });
    } catch (error) {
      next(error);
    }
  };

  getTotalTransactionsByBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.params;
      const totalTransactions = await this.adminService.getTotalTransactionsByBusiness(businessId);
      res.status(200).json({ totalTransactions });
    } catch (error) {
      next(error);
    }
  };

  getTotalTransactionAmountByBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.params;
      const totalAmount = await this.adminService.getTotalTransactionAmountByBusiness(businessId);
      res.status(200).json({ totalAmount });
    } catch (error) {
      next(error);
    }
  };

  // Subscription Management
  getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriptions = await this.adminService.getAllSubscriptions();
      res.status(200).json(subscriptions);
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, userId } = req.query;
      const subscriptionStatus = await this.adminService.getSubscriptionStatus(businessId as string, userId as string);
      res.status(200).json(subscriptionStatus);
    } catch (error) {
      next(error);
    }
  };

  updateSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const subscription = await this.adminService.updateSubscriptionStatus(id, status);
      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  };

  deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
