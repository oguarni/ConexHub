import express from 'express';
import adminController from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.use(auth);
router.use(admin);

router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/suppliers', adminController.getSuppliers);
router.put('/suppliers/:id/verify', adminController.verifySupplier);
router.put('/suppliers/:id/status', adminController.updateSupplierStatus);

router.get('/products', adminController.getProductsForAdmin);
router.put('/products/:id/status', adminController.updateProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/reports', adminController.getReports);
router.get('/stats', adminController.getSystemStats);

export default router;