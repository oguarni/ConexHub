import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GeneralStateProvider } from './AppContext';
import { UIProvider } from './UIContext';
import { CartProvider } from './CartContext';
import { QuotationProvider } from './QuotationContext';
import { QuotesProvider } from './QuotesContext';
import { LanguageProvider } from './LanguageContext';
import NotificationSystem from '../components/notifications/NotificationSystem';
import EnhancedErrorBoundary from '../components/common/EnhancedErrorBoundary';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create a simplified App context for any remaining shared functionality
const AppContext = createContext(null);

// Create a simplified NotificationProvider wrapper
const NotificationProvider = ({ children }) => {
  return (
    <>
      {children}
      <NotificationSystem />
    </>
  );
};

// Sample products moved here for backwards compatibility
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Furadeira Industrial HD-2000",
    description: "Furadeira de alta precisão para uso industrial, com motor de 2000W",
    price: 1299.99,
    category: "Tools",
    unit: "un",
    image: "🔧",
    supplier: "Industrial Tools Ltda",
    minOrder: 1,
    stock: 50,
    Supplier: { companyName: "Industrial Tools Ltda" }
  },
  {
    id: 2,
    name: "Chapa de Aço Inox 304",
    description: "Chapa de aço inoxidável 304, espessura 2mm, ideal para equipamentos alimentícios",
    price: 89.50,
    category: "Raw Materials",
    unit: "m²",
    image: "⚒️",
    supplier: "Metalúrgica São Paulo",
    minOrder: 10,
    stock: 200,
    Supplier: { companyName: "Metalúrgica São Paulo" }
  },
  {
    id: 3,
    name: "Motor Elétrico Trifásico 5CV",
    description: "Motor elétrico trifásico de 5CV, 220/380V, para uso industrial",
    price: 2450.00,
    category: "Components",
    unit: "un",
    image: "⚡",
    supplier: "Eletro Motores Brasil",
    minOrder: 1,
    stock: 25,
    Supplier: { companyName: "Eletro Motores Brasil" }
  },
  {
    id: 4,
    name: "Válvula Pneumática 1/2\"",
    description: "Válvula pneumática de 1/2 polegada, pressão máxima 10 bar",
    price: 156.75,
    category: "Components",
    unit: "un",
    image: "🔧",
    supplier: "Pneumática Industrial",
    minOrder: 5,
    stock: 100,
    Supplier: { companyName: "Pneumática Industrial" }
  },
  {
    id: 5,
    name: "Torno CNC Compacto",
    description: "Torno CNC compacto para pequenas peças de precisão",
    price: 45000.00,
    category: "Machinery",
    unit: "un",
    image: "🏭",
    supplier: "CNC Brasil Máquinas",
    minOrder: 1,
    stock: 3,
    Supplier: { companyName: "CNC Brasil Máquinas" }
  },
  {
    id: 6,
    name: "Compressor de Ar 50L",
    description: "Compressor de ar de 50 litros, 2HP, ideal para oficinas",
    price: 1850.00,
    category: "Equipment",
    unit: "un",
    image: "💨",
    supplier: "Compressores Sul",
    minOrder: 1,
    stock: 15,
    Supplier: { companyName: "Compressores Sul" }
  }
];

export const AppProvider = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const contextValue = {
    // Expose sample products for backwards compatibility
    // Components should migrate to use TanStack Query hooks directly
    sampleProducts: SAMPLE_PRODUCTS,
    
    // Helper functions that might be needed across the app
    formatPrice: (price) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    },
    
    formatDate: (date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
  };

  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <NotificationProvider>
            <GeneralStateProvider>
              <UIProvider>
                <CartProvider>
                  <QuotesProvider>
                    <QuotationProvider>
                      <AppContext.Provider value={contextValue}>
                        {children}
                        <ReactQueryDevtools initialIsOpen={false} />
                      </AppContext.Provider>
                    </QuotationProvider>
                  </QuotesProvider>
                </CartProvider>
              </UIProvider>
            </GeneralStateProvider>
          </NotificationProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

// Hook to use the simplified app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Legacy hook for backwards compatibility
// Components should migrate to use specific stores and TanStack Query hooks
export const useLegacyAppContext = () => {
  const auth = useAuthStore();
  const ui = useUIStore();
  const appContext = useAppContext();

  console.warn(
    'useLegacyAppContext is deprecated. Please migrate to:' +
    '\n- useAuth() for authentication' +
    '\n- useModals(), useNotifications(), useFilters() for UI state' +
    '\n- useProductsQuery(), useQuotesQuery() for server state'
  );

  return {
    // Auth state (from Zustand store)
    user: auth.user,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    loading: auth.loading,
    error: auth.error,
    clearError: auth.clearError,

    // UI state (from Zustand store)
    uiState: {
      isMenuOpen: ui.isMenuOpen,
      selectedCategory: ui.selectedCategory,
      searchTerm: ui.searchTerm,
      notifications: ui.notifications,
      showAuth: ui.modals.showAuth,
      showQuotes: ui.modals.showQuotes,
      showQuoteModal: ui.modals.showQuoteModal,
      showAdmin: ui.modals.showAdmin,
      showQuoteSuccess: ui.modals.showQuoteSuccess,
      showQuoteComparison: ui.modals.showQuoteComparison,
      showOrders: ui.modals.showOrders,
      showQuotation: ui.modals.showQuotation,
      showCheckout: ui.modals.showCheckout,
      isLogin: ui.isLogin,
    },

    // UI actions (from Zustand store)
    updateUI: ui.updateUI,
    showModal: ui.showModal,
    hideModal: ui.hideModal,
    toggleMenu: ui.toggleMenu,
    addNotification: ui.addNotification,
    removeNotification: ui.removeNotification,

    // Static data and utilities
    products: appContext.sampleProducts,
    setProducts: () => {
      console.warn('setProducts is deprecated. Use TanStack Query mutations instead.');
    },
    quotes: [],
    setQuotes: () => {
      console.warn('setQuotes is deprecated. Use TanStack Query mutations instead.');
    },
    loadProducts: () => {
      console.warn('loadProducts is deprecated. Use useProductsQuery() instead.');
    },
    loadQuotes: () => {
      console.warn('loadQuotes is deprecated. Use useQuotesQuery() instead.');
    },
    handleRequestQuote: (product) => {
      if (!auth.user) {
        ui.showModal('showAuth');
        return;
      }
      ui.showModal('showQuoteModal');
    },
  };
};

// Export QueryClient for use in tests or advanced scenarios
export { queryClient };

export default AppProvider;