import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Create context first
const AppContext = createContext(null);

// Main provider component
// Sample products defined outside component to avoid recreation
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
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS); // Initialize with sample products
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [uiState, setUiState] = useState({
    isMenuOpen: false,
    selectedCategory: 'all',
    searchTerm: '',
    notifications: [],
    showAuth: false,
    showQuotes: false,
    showQuoteModal: false,
    showAdmin: false,
    showQuoteSuccess: false,
    showQuoteComparison: false,
    showOrders: false,
    showQuotation: false,
    showCheckout: false,
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

  // Sample users for demonstration
  const sampleUsers = {
    'buyer@demo.com': {
      id: 1,
      name: 'João Silva',
      email: 'buyer@demo.com',
      role: 'buyer',
      companyName: 'Indústria Demo Ltda',
      address: 'Rua das Indústrias, 123',
      phone: '(11) 99999-1234'
    },
    'supplier@demo.com': {
      id: 2,
      name: 'Maria Santos',
      email: 'supplier@demo.com',
      role: 'supplier',
      companyName: 'Fornecimentos Industriais',
      address: 'Av. dos Fornecedores, 456',
      phone: '(11) 99999-5678'
    },
    'admin@demo.com': {
      id: 3,
      name: 'Admin Sistema',
      email: 'admin@demo.com',
      role: 'admin',
      companyName: 'ConexHub Admin',
      address: 'Sede Principal',
      phone: '(11) 99999-0000'
    }
  };

  // Notification functions (defined early)
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

  // Auth functions
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      // Try API first
      try {
        const data = await apiService.login(email, password);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUiState(prev => ({ ...prev, showAuth: false }));
        return true;
      } catch (apiError) {
        // If API fails, check sample users
        const sampleUser = sampleUsers[email];
        if (sampleUser && password === 'demo123') {
          setUser(sampleUser);
          localStorage.setItem('token', 'demo-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify(sampleUser));
          setUiState(prev => ({ ...prev, showAuth: false }));
          addNotification({
            type: 'success',
            message: `Login realizado com sucesso!`
          });
          return true;
        } else {
          throw new Error('Credenciais inválidas. Use um dos emails de demo: buyer@demo.com, supplier@demo.com, admin@demo.com com senha: demo123');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

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

  // Product functions - UPDATED to use apiService with fallback
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('AppProvider: Trying to load products from API...');
      const data = await apiService.getProducts();
      console.log('AppProvider: Products data received from API:', data);
      const productList = data.products || data || [];
      console.log('AppProvider: Setting API products:', productList);
      setProducts(productList);
    } catch (err) {
      console.error('AppProvider: API failed, using sample products:', err);
      console.log('AppProvider: Sample products being set:', SAMPLE_PRODUCTS);
      setProducts(SAMPLE_PRODUCTS);
      setError('');
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

  // Load initial data (try API in background)
  useEffect(() => {
    console.log('AppProvider: useEffect - Products already initialized, trying API in background...');
    loadProducts();
  }, [loadProducts]);

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