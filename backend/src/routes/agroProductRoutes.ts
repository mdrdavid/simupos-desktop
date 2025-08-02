
import { Router } from 'express';
import { AgroProductController } from '../controllers/AgroProductController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const controller = new AgroProductController();

router.use(authenticateToken);

router.post('/', controller.createProduct);
router.post('/web', controller.createProductWeb);
router.get('/branch/:branchId', controller.getProductsByBranch);
router.get('/:id', controller.getProductById);
// Variant routes
router.post('/:id/variants', controller.createVariant);
// router.get('/:id/variants', controller.getVariants);
router.post('/:id/shipments', controller.addStockShipment);
router.post('/:id/shipments/web', controller.addStockShipmentWeb);
router.patch('/:id/stock', controller.updateProductStock);

export { router as agroProductRoutes };