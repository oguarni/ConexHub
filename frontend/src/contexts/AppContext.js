// contexts/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSecureAuth } from '../hooks/useSecureAuth';
import { useBuyerQuotesQuery, useRequestQuoteMutation } from '../hooks/queries/useQuotesQuery';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import { useForm } from '../hooks/useForm';

const AppContext = createContext();

// Estado inicial unificado
const initialState = {
  ui: {
    isMenuOpen: false,
    selectedCategory: 'Todas',
    searchTerm: '',
    modals: {
      showQuotes: false,
      showAuth: false,
      showQuoteModal: false,
      showAdmin: false,
      showQuoteSuccess: false,
      showQuoteComparison: false,
      showOrders: false
    },
    isLogin: true,
    notifications: []
  }
};

// Reducer unificado seguindo SRP
const appReducer = (state, action) => {
  switch (action.type) {
    case 'UI/TOGGLE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.modal]: action.show
          }
        }
      };

    case 'UI/SET_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, searchTerm: action.term }
      };

    case 'UI/SET_CATEGORY':
      return {
        ...state,
        ui: { ...state.ui, selectedCategory: action.category }
      };

    case 'UI/TOGGLE_MENU':
      return {
        ...state,
        ui: { ...state.ui, isMenuOpen: !state.ui.isMenuOpen }
      };

    case 'UI/ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, { 
            id: Date.now(), 
            ...action.notification 
          }]
        }
      };

    case 'UI/REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.id)
        }
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const auth = useSecureAuth();
  
  // TanStack Query hooks for quotes
  const { 
    data: quotesResponse, 
    isLoading: quotesLoading, 
    error: quotesError,
    refetch: refetchQuotes
  } = useBuyerQuotesQuery({}, { enabled: !!auth.user });
  
  const requestQuoteMutation = useRequestQuoteMutation();
  
  // Create quotes object to maintain compatibility
  const quotes = React.useMemo(() => ({
    quotes: quotesResponse?.quotes || [],
    loading: quotesLoading,
    error: quotesError?.message || '',
    lastQuoteId: '', // Managed by mutations
    loadUserQuotes: refetchQuotes,
    createQuote: async (quoteData) => {
      try {
        const result = await requestQuoteMutation.mutateAsync(quoteData);
        return { success: true, quote: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    clearError: () => {} // Error is handled by TanStack Query
  }), [quotesResponse, quotesLoading, quotesError, refetchQuotes, requestQuoteMutation]);
  
  // Calculate filters for products query
  const productFilters = React.useMemo(() => {
    const filters = {};
    if (state.ui.selectedCategory !== 'Todas') filters.category = state.ui.selectedCategory;
    if (state.ui.searchTerm) filters.search = state.ui.searchTerm;
    return filters;
  }, [state.ui.selectedCategory, state.ui.searchTerm]);
  
  const { 
    data: productsResponse, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useProductsQuery(productFilters);
  
  // Create products object to maintain compatibility
  const products = React.useMemo(() => ({
    products: productsResponse?.products || [],
    loading: productsLoading,
    error: productsError?.message || '',
    loadProducts: refetchProducts,
    clearError: () => {} // Error is handled by TanStack Query
  }), [productsResponse, productsLoading, productsError, refetchProducts]);

  // Forms separados por responsabilidade
  const authForm = useForm({ 
    email: '', password: '', name: '', cnpj: '', 
    companyName: '', role: '', address: '', phone: '', sector: ''
  });
  
  const quoteForm = useForm({ 
    quantity: 1, urgency: 'normal', deliveryAddress: '',
    specifications: '', message: ''
  });
  
  const productForm = useForm({ 
    name: '', category: 'Maquinário', price: '', unit: 'unidade',
    description: '', image: '📦', minQuantity: 1
  });

  // Actions seguindo Interface Segregation Principle
  const uiActions = {
    showModal: (modalName) => 
      dispatch({ type: 'UI/TOGGLE_MODAL', modal: modalName, show: true }),
    
    hideModal: (modalName) => 
      dispatch({ type: 'UI/TOGGLE_MODAL', modal: modalName, show: false }),
    
    setSearch: (term) => 
      dispatch({ type: 'UI/SET_SEARCH', term }),
    
    setCategory: (category) => 
      dispatch({ type: 'UI/SET_CATEGORY', category }),
    
    toggleMenu: () => 
      dispatch({ type: 'UI/TOGGLE_MENU' }),
    
    addNotification: (notification) => {
      dispatch({ type: 'UI/ADD_NOTIFICATION', notification });
      if (notification.autoHide) {
        setTimeout(() => {
          dispatch({ type: 'UI/REMOVE_NOTIFICATION', id: notification.id });
        }, 5000);
      }
    },
    
    removeNotification: (id) => 
      dispatch({ type: 'UI/REMOVE_NOTIFICATION', id })
  };

  // Business actions
  const handleAuth = async () => {
    const success = state.ui.isLogin 
      ? await auth.login(authForm.form.email, authForm.form.password)
      : await auth.register(authForm.form);
    
    if (success) {
      authForm.resetForm();
      uiActions.hideModal('showAuth');
      return true;
    }
    return false;
  };

  const clearAllErrors = () => {
    auth.clearError();
    // quotes.clearError and products.clearError are handled by TanStack Query
  };

  // Effects otimizados - quotes are automatically loaded by useBuyerQuotesQuery when user is available

  // Products are automatically loaded by useProductsQuery when filters change

  const contextValue = {
    // State
    uiState: state.ui,
    auth,
    quotes,
    products,
    
    // Forms
    authForm,
    quoteForm,
    productForm,
    
    // Actions
    ...uiActions,
    handleAuth,
    clearAllErrors
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};