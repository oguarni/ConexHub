import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUiState(prev => ({ ...prev, showAuth: false }));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error');
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

  // Product functions
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
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