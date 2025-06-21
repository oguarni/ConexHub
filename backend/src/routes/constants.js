import express from 'express';
import constantsController from '../controllers/constantsController.js';
import authMiddleware from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

// Apply authentication and permission checks to all constants routes
router.use(authMiddleware);
router.use(requirePermission('constants:read'));

// Use the constants controller for all routes
router.use('/', constantsController);

export default router;