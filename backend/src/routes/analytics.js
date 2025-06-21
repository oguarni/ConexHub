import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/basic-stats', analyticsController.getBasicStats);

router.get('/dashboard', auth, analyticsController.getDashboard);
router.get('/sales', auth, analyticsController.getSalesAnalytics);
router.get('/products', auth, analyticsController.getProductAnalytics);
router.get('/customers', auth, analyticsController.getCustomerAnalytics);

router.get('/admin/dashboard', auth, admin, analyticsController.getAdminDashboardStats);
router.get('/admin/orders', auth, admin, analyticsController.getOrderStats);
router.get('/admin/users', auth, admin, analyticsController.getUserRegistrationStats);
router.get('/admin/quotes', auth, admin, analyticsController.getQuoteStats);
router.get('/admin/categories', auth, admin, analyticsController.getCategoryAnalytics);

router.get('/supplier/dashboard', auth, analyticsController.getSupplierDashboardStats);

export default router;