import { QueryClient } from '@tanstack/react-query';

// Create and configure the React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes  
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: (failureCount, error) => {
        // Don't retry for 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Background refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Mutation timeout
      timeout: 30000,
    },
  },
});

// Query key factory for consistent naming and easy invalidation
export const queryKeys = {
  // Products
  products: {
    all: () => ['products'],
    lists: () => ['products', 'list'],
    list: (filters) => ['products', 'list', filters],
    details: () => ['products', 'detail'],
    detail: (id) => ['products', 'detail', id],
    search: (query, filters) => ['products', 'search', query, filters],
    featured: () => ['products', 'featured'],
    categories: () => ['products', 'categories'],
    recommendations: (id) => ['products', 'recommendations', id],
    trending: () => ['products', 'trending'],
    facets: (filters) => ['products', 'facets', filters],
  },

  // Orders
  orders: {
    all: () => ['orders'],
    lists: () => ['orders', 'list'],
    list: (userId) => ['orders', 'list', userId],
    details: () => ['orders', 'detail'], 
    detail: (id) => ['orders', 'detail', id],
    byStatus: (status) => ['orders', 'status', status],
    history: (userId) => ['orders', 'history', userId],
    analytics: (period) => ['orders', 'analytics', period],
  },

  // Quotes
  quotes: {
    all: () => ['quotes'],
    lists: () => ['quotes', 'list'],
    buyer: () => ['quotes', 'buyer'],
    supplier: () => ['quotes', 'supplier'],
    detail: (id) => ['quotes', 'detail', id],
    byProduct: (productId) => ['quotes', 'product', productId],
    byStatus: (status) => ['quotes', 'status', status],
  },

  // Auth & User
  auth: {
    user: () => ['auth', 'user'],
    profile: () => ['auth', 'profile'],
    permissions: () => ['auth', 'permissions'],
    preferences: () => ['auth', 'preferences'],
  },

  // Suppliers
  suppliers: {
    all: () => ['suppliers'],
    list: () => ['suppliers', 'list'],
    detail: (id) => ['suppliers', 'detail', id],
    products: (id) => ['suppliers', 'products', id],
    reviews: (id) => ['suppliers', 'reviews', id],
    verified: () => ['suppliers', 'verified'],
  },

  // Categories
  categories: {
    all: () => ['categories'],
    list: () => ['categories', 'list'],
    detail: (id) => ['categories', 'detail', id],
    tree: () => ['categories', 'tree'],
  },

  // Analytics
  analytics: {
    dashboard: () => ['analytics', 'dashboard'],
    sales: (period) => ['analytics', 'sales', period],
    products: (period) => ['analytics', 'products', period],
    customers: (period) => ['analytics', 'customers', period],
  },

  // Notifications
  notifications: {
    all: () => ['notifications'],
    unread: () => ['notifications', 'unread'],
    count: () => ['notifications', 'count'],
  },

  // Settings
  settings: {
    all: () => ['settings'],
    app: () => ['settings', 'app'],
    user: () => ['settings', 'user'],
    company: () => ['settings', 'company'],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Products
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all() }),
  productLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }),
  productDetails: (id) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.details() });
    }
  },

  // Orders
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
  orderLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() }),
  orderDetails: (id) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.details() });
    }
  },

  // Quotes
  quotes: () => queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all() }),
  quoteLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() }),

  // Auth
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() }),
  
  // Suppliers
  suppliers: () => queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all() }),
  
  // Categories
  categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() }),

  // Analytics
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() }),

  // Clear all cache
  all: () => queryClient.clear(),
};

// Prefetch helpers for better UX
export const prefetchQueries = {
  productDetails: async (id) => {
    if (!id) return;
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => import('../services/api').then(api => api.getProduct(id)),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  featuredProducts: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.featured(),
      queryFn: () => import('../services/api').then(api => api.getFeaturedProducts()),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  userProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.profile(),
      queryFn: () => import('../services/api').then(api => api.getUserProfile()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  supplierProducts: async (supplierId) => {
    if (!supplierId) return;
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.suppliers.products(supplierId),
      queryFn: () => import('../services/api').then(api => api.getSupplierProducts(supplierId)),
      staleTime: 3 * 60 * 1000, // 3 minutes
    });
  },
};

// Cache update helpers for optimistic updates
export const updateQueryData = {
  // Add product to lists
  addProductToLists: (newProduct) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.products.lists() },
      (oldData) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return [newProduct, ...oldData];
        }
        
        if (oldData.products && Array.isArray(oldData.products)) {
          return {
            ...oldData,
            products: [newProduct, ...oldData.products],
            pagination: oldData.pagination ? {
              ...oldData.pagination,
              total: (oldData.pagination.total || 0) + 1
            } : undefined
          };
        }
        
        return oldData;
      }
    );
  },

  // Update product in lists and details
  updateProduct: (productId, updates) => {
    // Update in lists
    queryClient.setQueriesData(
      { queryKey: queryKeys.products.lists() },
      (oldData) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map(product => 
            product.id === productId ? { ...product, ...updates } : product
          );
        }
        
        if (oldData.products && Array.isArray(oldData.products)) {
          return {
            ...oldData,
            products: oldData.products.map(product =>
              product.id === productId ? { ...product, ...updates } : product
            )
          };
        }
        
        return oldData;
      }
    );

    // Update in details
    queryClient.setQueryData(
      queryKeys.products.detail(productId),
      (oldData) => oldData ? { ...oldData, ...updates } : oldData
    );
  },

  // Remove product from lists
  removeProductFromLists: (productId) => {
    queryClient.setQueriesData(
      { queryKey: queryKeys.products.lists() },
      (oldData) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.filter(product => product.id !== productId);
        }
        
        if (oldData.products && Array.isArray(oldData.products)) {
          return {
            ...oldData,
            products: oldData.products.filter(product => product.id !== productId),
            pagination: oldData.pagination ? {
              ...oldData.pagination,
              total: Math.max(0, (oldData.pagination.total || 0) - 1)
            } : undefined
          };
        }
        
        return oldData;
      }
    );

    // Remove from cache
    queryClient.removeQueries({ queryKey: queryKeys.products.detail(productId) });
  },

  // Update order status
  updateOrderStatus: (orderId, newStatus) => {
    // Update in lists
    queryClient.setQueriesData(
      { queryKey: queryKeys.orders.lists() },
      (oldData) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
          );
        }
        
        if (oldData.orders && Array.isArray(oldData.orders)) {
          return {
            ...oldData,
            orders: oldData.orders.map(order =>
              order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
            )
          };
        }
        
        return oldData;
      }
    );

    // Update in details
    queryClient.setQueryData(
      queryKeys.orders.detail(orderId),
      (oldData) => oldData ? { 
        ...oldData, 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      } : oldData
    );
  },
};

// Error handling utilities
export const handleQueryError = (error, context = '') => {
  console.error(`Query error ${context}:`, error);
  
  // Handle authentication errors
  if (error?.response?.status === 401) {
    // Clear auth-related cache
    invalidateQueries.auth();
    // Redirect to login or show auth modal
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  
  // Handle network errors
  if (!error?.response) {
    // Show network error message
    window.dispatchEvent(new CustomEvent('network:error', { 
      detail: { message: 'Erro de conexão. Verifique sua internet.' }
    }));
  }
  
  return error;
};

// Performance monitoring
export const queryMetrics = {
  getQueryStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  },
  
  getCacheSize: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Estimate cache size (approximate)
    const totalSize = queries.reduce((size, query) => {
      const dataSize = JSON.stringify(query.state.data || {}).length;
      return size + dataSize;
    }, 0);
    
    return {
      queries: queries.length,
      estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
      sizeBytes: totalSize,
    };
  },
};

export default queryClient;