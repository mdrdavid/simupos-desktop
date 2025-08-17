import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { isAdmin } from '../middlewares/roleAuth';

const router = Router();
const adminController = new AdminController();

// Business Management
router.get('/businesses', isAdmin, adminController.getAllBusinesses);
router.get('/businesses/:id', isAdmin, adminController.getBusinessById);
router.delete('/businesses/:id', isAdmin, adminController.deleteBusiness);

// User Management
router.get('/users/business/:businessId', isAdmin, adminController.getUsersByBusiness);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.delete('/users/:id/business', isAdmin, adminController.deleteUserAndBusiness);
router.put('/users/:id/deactivate', isAdmin, adminController.deactivateUser);

// Inventory and Transactions
router.get('/stock/branch/:branchId', isAdmin, adminController.getTotalStockByBranch);
router.get('/transactions/business/:businessId', isAdmin, adminController.getTotalTransactionsByBusiness);
router.get('/transactions/amount/business/:businessId', isAdmin, adminController.getTotalTransactionAmountByBusiness);

// Subscription Management
router.get('/subscriptions', isAdmin, adminController.getAllSubscriptions);
router.get('/subscriptions/status', isAdmin, adminController.getSubscriptionStatus);
router.put('/subscriptions/:id/status', isAdmin, adminController.updateSubscriptionStatus);
router.delete('/subscriptions/:id', isAdmin, adminController.deleteSubscription);

export { router as adminRoutes };
