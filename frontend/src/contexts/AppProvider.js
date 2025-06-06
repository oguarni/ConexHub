import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  
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

  // Auth functions
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setUiState(prev => ({ ...prev, showAuth: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  // UI functions
  const updateUI = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  const showModal = (modalName) => {
    setUiState(prev => ({ ...prev, [modalName]: true }));
  };

  const hideModal = (modalName) => {
    setUiState(prev => ({ ...prev, [modalName]: false }));
  };

  const toggleMenu = () => {
    setUiState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
  };

  // Mock data functions
  const handleRequestQuote = (product) => {
    if (!user) {
      showModal('showAuth');
      return;
    }
    showModal('showQuoteModal');
  };

  const contextValue = {
    // State
    uiState,
    auth: { user, loading, login, logout },
    quotes: { quotes, handleRequestQuote },
    products: { products, loading },
    
    // Functions
    updateUI,
    showModal,
    hideModal,
    toggleMenu,
    handleRequestQuote,
    
    // Legacy support
    user,
    login,
    logout,
    setProducts,
    setQuotes
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
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export default AppProvider;