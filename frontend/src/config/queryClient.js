import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Enable background refetch for better UX
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry mutations only once
      retry: 1,
      // Show error for 5 seconds
      errorTime: 5000,
    },
  },
});

// Query key factory for consistent naming
export const queryKeys = {
  // Products
  products: {
    all: () => ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
    search: (query) => ['products', 'search', query],
    categories: () => ['products', 'categories'],
    featured: () => ['products', 'featured'],
  },
  
  // Orders
  orders: {
    all: () => ['orders'],
    list: (userId) => ['orders', 'list', userId],
    detail: (id) => ['orders', 'detail', id],
    byStatus: (status) => ['orders', 'status', status],
  },
  
  // Quotes
  quotes: {
    all: () => ['quotes'],
    list: (type) => ['quotes', 'list', type], // 'buyer' or 'supplier'
    detail: (id) => ['quotes', 'detail', id],
    byProduct: (productId) => ['quotes', 'product', productId],
  },
  
  // Auth & Users
  auth: {
    profile: () => ['auth', 'profile'],
    permissions: () => ['auth', 'permissions'],
  },
  
  // Analytics
  analytics: {
    dashboard: () => ['analytics', 'dashboard'],
    sales: (period) => ['analytics', 'sales', period],
    products: (period) => ['analytics', 'products', period],
  },
  
  // Suppliers
  suppliers: {
    all: () => ['suppliers'],
    list: () => ['suppliers', 'list'],
    detail: (id) => ['suppliers', 'detail', id],
    products: (id) => ['suppliers', 'products', id],
    reviews: (id) => ['suppliers', 'reviews', id],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all() }),
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
  quotes: () => queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all() }),
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() }),
  all: () => queryClient.invalidateQueries(),
};

// Prefetch helpers for better UX
export const prefetchQueries = {
  productDetails: async (id) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => import('../services/api').then(api => api.apiService.getProduct(id)),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },
  
  featuredProducts: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.featured(),
      queryFn: () => import('../services/api').then(api => api.apiService.getFeaturedProducts()),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
};

export default queryClient;