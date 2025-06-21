import { AppError } from './errorHandler.js';

// Define permissions for each role
const ROLE_PERMISSIONS = {
  admin: [
    // User management
    'users:read', 'users:write', 'users:delete',
    
    // Supplier management
    'suppliers:read', 'suppliers:write', 'suppliers:delete', 'suppliers:approve', 'suppliers:reject',
    
    // Product management
    'products:read', 'products:write', 'products:delete', 'products:approve',
    
    // Order management
    'orders:read', 'orders:write', 'orders:delete', 'orders:update_status',
    
    // Quote management
    'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:respond',
    
    // Analytics and reports
    'analytics:read', 'reports:read',
    
    // System management
    'system:read', 'system:write', 'config:read', 'config:write',
    
    // Constants and static data
    'constants:read', 'constants:write'
  ],
  
  supplier: [
    // Own profile management
    'profile:read', 'profile:write',
    
    // Product management (own products only)
    'products:read', 'products:write', 'products:delete_own',
    
    // Order management (own orders only)
    'orders:read_own', 'orders:update_status_own',
    
    // Quote management (can respond to quotes)
    'quotes:read_own', 'quotes:respond',
    
    // Constants (read-only)
    'constants:read'
  ],
  
  buyer: [
    // Own profile management
    'profile:read', 'profile:write',
    
    // Product browsing
    'products:read',
    
    // Order management (own orders only)
    'orders:read_own', 'orders:write',
    
    // Quote management (can create and manage own quotes)
    'quotes:read_own', 'quotes:write', 'quotes:accept', 'quotes:reject',
    
    // Constants (read-only)
    'constants:read'
  ]
};

// Resource-specific permission mappings
const RESOURCE_PERMISSIONS = {
  // User routes
  '/users': {
    GET: 'users:read',
    POST: 'users:write',
    PUT: 'users:write',
    DELETE: 'users:delete'
  },
  
  // Supplier routes
  '/suppliers': {
    GET: 'suppliers:read',
    POST: 'suppliers:write',
    PUT: 'suppliers:write',
    DELETE: 'suppliers:delete'
  },
  
  '/suppliers/:id/approve': {
    PUT: 'suppliers:approve'
  },
  
  '/suppliers/:id/reject': {
    PUT: 'suppliers:reject'
  },
  
  // Product routes
  '/products': {
    GET: 'products:read',
    POST: 'products:write',
    PUT: 'products:write',
    DELETE: 'products:delete'
  },
  
  // Order routes
  '/orders': {
    GET: 'orders:read',
    POST: 'orders:write'
  },
  
  '/orders/user': {
    GET: 'orders:read_own'
  },
  
  '/orders/supplier': {
    GET: 'orders:read_own'
  },
  
  '/orders/:id/status': {
    PUT: 'orders:update_status'
  },
  
  // Quote routes
  '/quotes': {
    GET: 'quotes:read',
    POST: 'quotes:write'
  },
  
  '/quotes/user': {
    GET: 'quotes:read_own'
  },
  
  '/quotes/supplier': {
    GET: 'quotes:read_own'
  },
  
  '/quotes/:id/respond': {
    PUT: 'quotes:respond'
  },
  
  // Constants routes
  '/constants': {
    GET: 'constants:read',
    POST: 'constants:write',
    PUT: 'constants:write',
    DELETE: 'constants:write'
  },
  
  // Analytics routes
  '/analytics': {
    GET: 'analytics:read'
  },
  
  // Admin routes
  '/admin': {
    GET: 'system:read',
    POST: 'system:write',
    PUT: 'system:write',
    DELETE: 'system:write'
  }
};

/**
 * Check if user has specific permission
 * @param {Object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get required permission for a route and method
 * @param {string} path - API path
 * @param {string} method - HTTP method
 * @returns {string|null}
 */
const getRequiredPermission = (path, method) => {
  // Clean the path and normalize
  const cleanPath = path.replace(/\/api/g, '').replace(/\/$/, '') || '/';
  
  // Try exact match first
  if (RESOURCE_PERMISSIONS[cleanPath] && RESOURCE_PERMISSIONS[cleanPath][method]) {
    return RESOURCE_PERMISSIONS[cleanPath][method];
  }
  
  // Try pattern matching for parameterized routes
  for (const pattern in RESOURCE_PERMISSIONS) {
    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
    if (regex.test(cleanPath) && RESOURCE_PERMISSIONS[pattern][method]) {
      return RESOURCE_PERMISSIONS[pattern][method];
    }
  }
  
  return null;
};

/**
 * Check if user owns a resource (for resource-specific permissions)
 * @param {Object} user - User object
 * @param {Object} resource - Resource object
 * @param {string} resourceType - Type of resource
 * @returns {boolean}
 */
const ownsResource = (user, resource, resourceType) => {
  if (!user || !resource) return false;
  
  switch (resourceType) {
    case 'order':
      return user.role === 'supplier' ? 
        resource.supplierId === user.id : 
        resource.userId === user.id;
        
    case 'quote':
      return user.role === 'supplier' ? 
        resource.supplierId === user.id : 
        resource.userId === user.id;
        
    case 'product':
      return resource.supplierId === user.id;
      
    default:
      return resource.userId === user.id;
  }
};

/**
 * Middleware factory for specific permission
 * @param {string} permission - Required permission
 * @returns {Function}
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação requerida', 401, 'AUTHENTICATION_REQUIRED'));
    }
    
    if (!hasPermission(req.user, permission)) {
      return next(new AppError(
        `Permissão negada. Requer: ${permission}`,
        403,
        'PERMISSION_DENIED',
        { required_permission: permission, user_role: req.user.role }
      ));
    }
    
    next();
  };
};

/**
 * Middleware factory for multiple permissions (ANY)
 * @param {string[]} permissions - Array of permissions (user needs ANY)
 * @returns {Function}
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação requerida', 401, 'AUTHENTICATION_REQUIRED'));
    }
    
    if (!hasAnyPermission(req.user, permissions)) {
      return next(new AppError(
        `Permissão negada. Requer uma das: ${permissions.join(', ')}`,
        403,
        'PERMISSION_DENIED',
        { required_permissions: permissions, user_role: req.user.role }
      ));
    }
    
    next();
  };
};

/**
 * Middleware factory for multiple permissions (ALL)
 * @param {string[]} permissions - Array of permissions (user needs ALL)
 * @returns {Function}
 */
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação requerida', 401, 'AUTHENTICATION_REQUIRED'));
    }
    
    if (!hasAllPermissions(req.user, permissions)) {
      return next(new AppError(
        `Permissão negada. Requer todas: ${permissions.join(', ')}`,
        403,
        'PERMISSION_DENIED',
        { required_permissions: permissions, user_role: req.user.role }
      ));
    }
    
    next();
  };
};

/**
 * Auto-RBAC middleware - automatically checks permissions based on route
 * @returns {Function}
 */
const autoRBAC = () => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação requerida', 401, 'AUTHENTICATION_REQUIRED'));
    }
    
    const requiredPermission = getRequiredPermission(req.path, req.method);
    
    // If no specific permission is required, allow access
    if (!requiredPermission) {
      return next();
    }
    
    if (!hasPermission(req.user, requiredPermission)) {
      return next(new AppError(
        `Permissão negada. Requer: ${requiredPermission}`,
        403,
        'PERMISSION_DENIED',
        { 
          required_permission: requiredPermission, 
          user_role: req.user.role,
          path: req.path,
          method: req.method
        }
      ));
    }
    
    next();
  };
};

/**
 * Resource ownership middleware - checks if user owns the resource
 * @param {string} resourceType - Type of resource to check
 * @param {Function} resourceLoader - Function to load resource
 * @returns {Function}
 */
const requireResourceOwnership = (resourceType, resourceLoader) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError('Autenticação requerida', 401, 'AUTHENTICATION_REQUIRED'));
      }
      
      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }
      
      const resource = await resourceLoader(req);
      
      if (!resource) {
        return next(new AppError('Recurso não encontrado', 404, 'RESOURCE_NOT_FOUND'));
      }
      
      if (!ownsResource(req.user, resource, resourceType)) {
        return next(new AppError(
          'Acesso negado. Você só pode acessar seus próprios recursos.',
          403,
          'RESOURCE_ACCESS_DENIED',
          { resource_type: resourceType }
        ));
      }
      
      // Attach resource to request for future use
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  autoRBAC,
  requireResourceOwnership,
  ownsResource,
  ROLE_PERMISSIONS
};