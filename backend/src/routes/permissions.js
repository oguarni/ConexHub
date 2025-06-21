import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { hasPermission, ROLE_PERMISSIONS } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get user's permissions
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
  
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        role: req.user.role,
        name: req.user.name,
        email: req.user.email
      },
      permissions: userPermissions,
      permissionCount: userPermissions.length
    }
  });
}));

// Check specific permission
router.post('/check', authMiddleware, asyncHandler(async (req, res) => {
  const { permission } = req.body;
  
  if (!permission) {
    return res.status(400).json({
      success: false,
      message: 'Permission parameter is required'
    });
  }
  
  const hasAccess = hasPermission(req.user, permission);
  
  res.json({
    success: true,
    data: {
      permission,
      hasAccess,
      userRole: req.user.role
    }
  });
}));

// Check multiple permissions
router.post('/check-multiple', authMiddleware, asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  
  if (!Array.isArray(permissions)) {
    return res.status(400).json({
      success: false,
      message: 'Permissions must be an array'
    });
  }
  
  const results = permissions.map(permission => ({
    permission,
    hasAccess: hasPermission(req.user, permission)
  }));
  
  res.json({
    success: true,
    data: {
      userRole: req.user.role,
      results,
      summary: {
        total: permissions.length,
        granted: results.filter(r => r.hasAccess).length,
        denied: results.filter(r => !r.hasAccess).length
      }
    }
  });
}));

export default router;