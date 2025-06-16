import { lazy } from 'react';
import { withLazyLoading } from '../components/common/LazyLoader';

/**
 * Centralized lazy imports for better code splitting
 * Each route/component is loaded only when needed
 */

// Auth Components
export const LazyLogin = withLazyLoading(
  lazy(() => import('../pages/Login')),
  { message: 'Carregando página de login...', size: 'large' }
);

export const LazyRegister = withLazyLoading(
  lazy(() => import('../pages/Register')),
  { message: 'Carregando página de cadastro...', size: 'large' }
);

// Main App Components
export const LazyHome = withLazyLoading(
  lazy(() => import('../pages/Home')),
  { message: 'Carregando página inicial...', size: 'large' }
);

export const LazyProducts = withLazyLoading(
  lazy(() => import('../pages/Products')),
  { message: 'Carregando catálogo de produtos...', size: 'large' }
);

export const LazyQuotations = withLazyLoading(
  lazy(() => import('../pages/Quotations')),
  { message: 'Carregando cotações...', size: 'large' }
);

// Dashboard Components
export const LazyDashboard = withLazyLoading(
  lazy(() => import('../pages/Dashboard')),
  { message: 'Carregando dashboard...', size: 'large' }
);

export const LazyProfile = withLazyLoading(
  lazy(() => import('../pages/Profile')),
  { message: 'Carregando perfil...', size: 'large' }
);

// Supplier Components
export const LazySupplierDashboard = withLazyLoading(
  lazy(() => import('../pages/supplier/Dashboard')),
  { message: 'Carregando painel do fornecedor...', size: 'large' }
);

export const LazyProductManagement = withLazyLoading(
  lazy(() => import('../pages/supplier/ProductManagement')),
  { message: 'Carregando gerenciamento de produtos...', size: 'large' }
);

// Admin Components
export const LazyAdminDashboard = withLazyLoading(
  lazy(() => import('../pages/admin/Dashboard')),
  { message: 'Carregando painel administrativo...', size: 'large' }
);

export const LazyUserManagement = withLazyLoading(
  lazy(() => import('../pages/admin/UserManagement')),
  { message: 'Carregando gerenciamento de usuários...', size: 'large' }
);

// Complex Feature Components
export const LazyReports = withLazyLoading(
  lazy(() => import('../components/reports/ReportsManager')),
  { message: 'Carregando sistema de relatórios...', size: 'large' }
);

export const LazyAnalytics = withLazyLoading(
  lazy(() => import('../components/analytics/AnalyticsDashboard')),
  { message: 'Carregando analytics...', size: 'large' }
);

export const LazyNotifications = withLazyLoading(
  lazy(() => import('../components/notifications/NotificationCenter')),
  { message: 'Carregando central de notificações...', size: 'medium' }
);

// Utility Components
export const LazySettings = withLazyLoading(
  lazy(() => import('../pages/Settings')),
  { message: 'Carregando configurações...', size: 'medium' }
);

export const LazyHelp = withLazyLoading(
  lazy(() => import('../pages/Help')),
  { message: 'Carregando ajuda...', size: 'medium' }
);

/**
 * Function to preload critical components
 * Call this on user interactions that are likely to trigger navigation
 */
export const preloadCriticalComponents = () => {
  // Preload most commonly used components
  import('../pages/Products');
  import('../pages/Dashboard');
  import('../pages/Quotations');
};

/**
 * Function to preload components based on user role
 */
export const preloadByRole = (userRole) => {
  switch (userRole) {
    case 'supplier':
      import('../pages/supplier/Dashboard');
      import('../pages/supplier/ProductManagement');
      break;
    case 'admin':
      import('../pages/admin/Dashboard');
      import('../pages/admin/UserManagement');
      break;
    case 'buyer':
      import('../pages/Products');
      import('../pages/Quotations');
      break;
    default:
      preloadCriticalComponents();
  }
};

/**
 * Bundle analysis helper for development
 */
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Lazy Loading Bundle Info');
    console.log('Auth Components: Login, Register');
    console.log('Main Components: Home, Products, Quotations, Dashboard');
    console.log('Role-specific: Supplier Dashboard, Admin Dashboard');
    console.log('Feature Components: Reports, Analytics, Notifications');
    console.log('Utility Components: Settings, Help');
    console.groupEnd();
  }
};