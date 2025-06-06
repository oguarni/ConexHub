import { lazy, Suspense, memo } from 'react';
import React from 'react';

// ✅ Loading Components otimizados
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
));

const ModalLoadingSpinner = memo(() => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg p-8 shadow-xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  </div>
));

const PageLoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando página...</h2>
      <p className="text-gray-500">Aguarde um momento</p>
    </div>
  </div>
));

// ✅ Lazy loading para componentes administrativos
export const AdminPanel = lazy(() => 
  import('./admin/AdminPanel').then(module => ({
    default: module.default
  }))
);

export const UserManagement = lazy(() => 
  import('./admin/UserManagement')
);

export const SystemSettings = lazy(() => 
  import('./admin/SystemSettings')
);

// ✅ Lazy loading para componentes de cotações
export const QuoteComparisonModal = lazy(() => 
  import('./quotes/QuoteComparisonModal')
);

export const QuoteDetailModal = lazy(() => 
  import('./quotes/QuoteDetailModal')
);

export const QuoteHistoryModal = lazy(() => 
  import('./quotes/QuoteHistoryModal')
);

export const SupplierQuotesPanel = lazy(() => 
  import('./quotes/SupplierQuotesPanel')
);

// ✅ Lazy loading para componentes de pedidos
export const OrdersModal = lazy(() => 
  import('./orders/OrdersModal')
);

export const OrderDetailModal = lazy(() => 
  import('./orders/OrderDetailModal')
);

export const OrderTrackingModal = lazy(() => 
  import('./orders/OrderTrackingModal')
);

export const InvoiceModal = lazy(() => 
  import('./orders/InvoiceModal')
);

// ✅ Lazy loading para componentes de produtos
export const ProductDetailModal = lazy(() => 
  import('./products/ProductDetailModal')
);

export const ProductCatalogModal = lazy(() => 
  import('./products/ProductCatalogModal')
);

export const BulkProductImport = lazy(() => 
  import('./products/BulkProductImport')
);

// ✅ Lazy loading para relatórios e analytics
export const DashboardReports = lazy(() => 
  import('./reports/DashboardReports')
);

export const SalesAnalytics = lazy(() => 
  import('./reports/SalesAnalytics')
);

export const SupplierAnalytics = lazy(() => 
  import('./reports/SupplierAnalytics')
);

// ✅ Lazy loading para configurações
export const CompanySettings = lazy(() => 
  import('./settings/CompanySettings')
);

export const ProfileSettings = lazy(() => 
  import('./settings/ProfileSettings')
);

export const NotificationSettings = lazy(() => 
  import('./settings/NotificationSettings')
);

// ✅ Lazy Wrappers especializados
export const LazyWrapper = memo(({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
));

export const LazyModalWrapper = memo(({ children, fallback = <ModalLoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
));

export const LazyPageWrapper = memo(({ children, fallback = <PageLoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
));

// ✅ HOC para lazy loading automático
export const withLazyLoading = (importFunc, fallback = <LoadingSpinner />) => {
  const LazyComponent = lazy(importFunc);
  
  return memo((props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// ✅ Hook para preload de componentes
export const usePreloadComponent = () => {
  const preloadComponent = React.useCallback((importFunc) => {
    // Preload component for faster loading
    importFunc();
  }, []);

  const preloadMultiple = React.useCallback((importFuncs) => {
    importFuncs.forEach(importFunc => importFunc());
  }, []);

  return { preloadComponent, preloadMultiple };
};

// ✅ Preload strategies
export const PreloadStrategies = {
  // Preload on hover
  onHover: (importFunc) => ({
    onMouseEnter: () => importFunc(),
    onFocus: () => importFunc()
  }),

  // Preload on viewport
  onViewport: (importFunc) => {
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              importFunc();
            }
          });
        },
        { threshold: 0.1 }
      );

      return () => observer.disconnect();
    }, []);
  },

  // Preload after delay
  delayed: (importFunc, delay = 2000) => {
    React.useEffect(() => {
      const timer = setTimeout(importFunc, delay);
      return () => clearTimeout(timer);
    }, []);
  }
};

// ✅ Lazy Route Components
export const LazyRoutes = {
  AdminDashboard: lazy(() => import('../pages/AdminDashboard')),
  SupplierDashboard: lazy(() => import('../pages/SupplierDashboard')),
  BuyerDashboard: lazy(() => import('../pages/BuyerDashboard')),
  ProductCatalog: lazy(() => import('../pages/ProductCatalog')),
  QuoteManagement: lazy(() => import('../pages/QuoteManagement')),
  OrderManagement: lazy(() => import('../pages/OrderManagement')),
  Reports: lazy(() => import('../pages/Reports')),
  Settings: lazy(() => import('../pages/Settings'))
};

// ✅ Bundle splitting por funcionalidade
export const FeatureBundles = {
  Admin: {
    Panel: lazy(() => import('./admin/AdminPanel')),
    Users: lazy(() => import('./admin/UserManagement')),
    Settings: lazy(() => import('./admin/SystemSettings')),
    Reports: lazy(() => import('./admin/AdminReports'))
  },

  Quotes: {
    Comparison: lazy(() => import('./quotes/QuoteComparisonModal')),
    Detail: lazy(() => import('./quotes/QuoteDetailModal')),
    History: lazy(() => import('./quotes/QuoteHistoryModal')),
    Supplier: lazy(() => import('./quotes/SupplierQuotesPanel'))
  },

  Orders: {
    Modal: lazy(() => import('./orders/OrdersModal')),
    Detail: lazy(() => import('./orders/OrderDetailModal')),
    Tracking: lazy(() => import('./orders/OrderTrackingModal')),
    Invoice: lazy(() => import('./orders/InvoiceModal'))
  },

  Products: {
    Detail: lazy(() => import('./products/ProductDetailModal')),
    Catalog: lazy(() => import('./products/ProductCatalogModal')),
    BulkImport: lazy(() => import('./products/BulkProductImport')),
    Management: lazy(() => import('./products/ProductManagement'))
  }
};

// ✅ Error Boundary para lazy components
export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">
            Erro ao carregar componente
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ Safe Lazy Wrapper com Error Boundary
export const SafeLazyWrapper = memo(({ children, fallback = <LoadingSpinner /> }) => (
  <LazyErrorBoundary>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </LazyErrorBoundary>
));

// ✅ Prefetch manager
export class PrefetchManager {
  static prefetchedComponents = new Set();

  static async prefetch(importFunc, componentName) {
    if (this.prefetchedComponents.has(componentName)) {
      return;
    }

    try {
      await importFunc();
      this.prefetchedComponents.add(componentName);
      console.log(`✅ Prefetched: ${componentName}`);
    } catch (error) {
      console.warn(`❌ Failed to prefetch: ${componentName}`, error);
    }
  }

  static prefetchAll(components) {
    Object.entries(components).forEach(([name, importFunc]) => {
      this.prefetch(importFunc, name);
    });
  }

  static isPrefetched(componentName) {
    return this.prefetchedComponents.has(componentName);
  }
}

// ✅ Progressive loading strategy
export const ProgressiveLoader = memo(({ 
  priority = 'low', 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  const [shouldLoad, setShouldLoad] = React.useState(priority === 'high');

  React.useEffect(() => {
    if (priority === 'low') {
      // Load after other high priority components
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    } else if (priority === 'medium') {
      // Load immediately but with lower priority
      setTimeout(() => setShouldLoad(true), 0);
    }
  }, [priority]);

  if (!shouldLoad) {
    return fallback;
  }

  return (
    <SafeLazyWrapper fallback={fallback}>
      {children}
    </SafeLazyWrapper>
  );
});

// ✅ Smart preloading hook
export const useSmartPreload = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [preloadedFeatures, setPreloadedFeatures] = React.useState(new Set());

  const preloadByRole = React.useCallback(async (role) => {
    setUserRole(role);
    
    // Preload components based on user role
    const roleBasedPreloads = {
      admin: [
        () => import('./admin/AdminPanel'),
        () => import('./admin/UserManagement'),
        () => import('./reports/DashboardReports')
      ],
      supplier: [
        () => import('./quotes/SupplierQuotesPanel'),
        () => import('./products/ProductManagement'),
        () => import('./orders/OrderManagement')
      ],
      buyer: [
        () => import('./quotes/QuoteComparisonModal'),
        () => import('./orders/OrdersModal'),
        () => import('./products/ProductCatalogModal')
      ]
    };

    const preloads = roleBasedPreloads[role] || [];
    
    for (const preload of preloads) {
      try {
        await preload();
        setPreloadedFeatures(prev => new Set([...prev, preload.name]));
      } catch (error) {
        console.warn('Preload failed:', error);
      }
    }
  }, []);

  const preloadOnInteraction = React.useCallback((feature, importFunc) => {
    return {
      onMouseEnter: () => {
        if (!preloadedFeatures.has(feature)) {
          importFunc().then(() => {
            setPreloadedFeatures(prev => new Set([...prev, feature]));
          });
        }
      }
    };
  }, [preloadedFeatures]);

  return { preloadByRole, preloadOnInteraction, preloadedFeatures };
};

// ✅ Export default for main components
export default {
  AdminPanel,
  QuoteComparisonModal,
  OrdersModal,
  LazyWrapper,
  LazyModalWrapper,
  LazyPageWrapper,
  SafeLazyWrapper,
  ProgressiveLoader,
  PrefetchManager,
  FeatureBundles,
  LazyRoutes
};