import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Create context first
const AppContext = createContext(null);

// Main provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [uiState, setUiState] = useState({
    isMenuOpen: false,
    selectedCategory: 'Todas',
    searchTerm: '',
    notifications: [],
    showAuth: false,
    showQuotes: false,
    showQuoteModal: false,
    showAdmin: false,
    showQuoteSuccess: false,
    showQuoteComparison: false,
    showOrders: false,
    isLogin: true
  });

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error loading user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Auth functions
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.login(email, password);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUiState(prev => ({ ...prev, showAuth: false }));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.register(userData);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUiState(prev => ({ ...prev, showAuth: false }));
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUiState(prev => ({ ...prev, showAuth: false }));
  }, []);

  // UI functions
  const updateUI = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const showModal = useCallback((modalName) => {
    setUiState(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const hideModal = useCallback((modalName) => {
    setUiState(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const toggleMenu = useCallback(() => {
    setUiState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
  }, []);

  // Product functions - UPDATED to use apiService
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading products...');
      const data = await apiService.getProducts();
      console.log('Products data received:', data);
      const productList = data.products || data || [];
      console.log('Setting products:', productList);
      setProducts(productList);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Quote functions
  const handleRequestQuote = useCallback((product) => {
    if (!user) {
      showModal('showAuth');
      return;
    }
    showModal('showQuoteModal');
  }, [user, showModal]);

  const loadQuotes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const endpoint = user.role === 'supplier' ? '/quotes/supplier' : '/quotes/buyer';
      const data = await apiService.api.get(endpoint);
      const quotesList = data.data.quotes || [];
      
      // Transform quotes for display
      const transformedQuotes = quotesList.map(quote => ({
        id: quote.id,
        productName: quote.Product?.name || 'Produto',
        supplierName: quote.Supplier?.companyName || quote.Buyer?.companyName || 'Empresa',
        quantity: quote.quantity,
        unit: quote.Product?.unit || 'un',
        status: quote.status,
        totalPrice: quote.totalAmount,
        createdAt: quote.createdAt
      }));
      
      setQuotes(transformedQuotes);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, timestamp: Date.now(), ...notification };
    
    setUiState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto-remove after 5 seconds
    if (notification.autoHide !== false) {
      setTimeout(() => {
        setUiState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id)
        }));
      }, 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setUiState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  // Load initial data
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const contextValue = {
    // State
    user,
    products,
    quotes,
    loading,
    error,
    uiState,
    
    // Auth
    login,
    register,
    logout,
    
    // UI
    updateUI,
    showModal,
    hideModal,
    toggleMenu,
    addNotification,
    removeNotification,
    
    // Products
    loadProducts,
    setProducts,
    
    // Quotes
    handleRequestQuote,
    loadQuotes,
    setQuotes,
    
    // Utils
    clearError: () => setError('')
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Default export
export default AppProvider;