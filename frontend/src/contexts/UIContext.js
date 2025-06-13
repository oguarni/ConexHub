import React, { createContext, useContext, useReducer } from 'react';

const UIContext = createContext();

// Estado inicial da UI
const initialUIState = {
  isMenuOpen: false,
  selectedCategory: 'All',
  searchTerm: '',
  notifications: [],
  modals: {
    showAuth: false,
    showQuotes: false,
    showQuoteModal: false,
    showAdmin: false,
    showQuoteSuccess: false,
    showQuoteComparison: false,
    showOrders: false
  },
  isLogin: true
};

// Reducer da UI seguindo SRP
const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: { 
          ...state.modals, 
          [action.modal]: action.show 
        }
      };
      
    case 'SET_SEARCH':
      return { 
        ...state, 
        searchTerm: action.term 
      };
      
    case 'SET_CATEGORY':
      return { 
        ...state, 
        selectedCategory: action.category 
      };
      
    case 'TOGGLE_MENU':
      return { 
        ...state, 
        isMenuOpen: !state.isMenuOpen 
      };
      
    case 'CLOSE_MENU':
      return { 
        ...state, 
        isMenuOpen: false 
      };
      
    case 'SET_LOGIN_MODE':
      return { 
        ...state, 
        isLogin: action.isLogin 
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { 
            id: action.id || Date.now(),
            timestamp: Date.now(),
            ...action.notification 
          }
        ]
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id)
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
      
    case 'UPDATE_UI':
      return {
        ...state,
        ...action.updates
      };
      
    case 'RESET_UI':
      return initialUIState;
      
    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  // ✅ Actions da UI com useCallback implícito via dispatch
  const actions = {
    // Modal management
    showModal: (modal) => 
      dispatch({ type: 'TOGGLE_MODAL', modal, show: true }),
      
    hideModal: (modal) => 
      dispatch({ type: 'TOGGLE_MODAL', modal, show: false }),
      
    toggleModal: (modal) => 
      dispatch({ type: 'TOGGLE_MODAL', modal, show: !state.modals[modal] }),

    // Search and filters
    setSearch: (term) => 
      dispatch({ type: 'SET_SEARCH', term }),
      
    setCategory: (category) => 
      dispatch({ type: 'SET_CATEGORY', category }),
      
    clearSearch: () => 
      dispatch({ type: 'SET_SEARCH', term: '' }),
      
    resetFilters: () => {
      dispatch({ type: 'SET_SEARCH', term: '' });
      dispatch({ type: 'SET_CATEGORY', category: 'Todas' });
    },

    // Menu management
    toggleMenu: () => 
      dispatch({ type: 'TOGGLE_MENU' }),
      
    closeMenu: () => 
      dispatch({ type: 'CLOSE_MENU' }),

    // Auth mode
    setLoginMode: (isLogin) => 
      dispatch({ type: 'SET_LOGIN_MODE', isLogin }),
      
    toggleAuthMode: () => 
      dispatch({ type: 'SET_LOGIN_MODE', isLogin: !state.isLogin }),

    // Notification management
    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        notification,
        id 
      });
      
      // Auto-remove após 5 segundos se autoHide não for false
      if (notification.autoHide !== false) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', id });
        }, notification.duration || 5000);
      }
      
      return id; // Retorna ID para remoção manual se necessário
    },
    
    removeNotification: (id) => 
      dispatch({ type: 'REMOVE_NOTIFICATION', id }),
      
    clearNotifications: () => 
      dispatch({ type: 'CLEAR_NOTIFICATIONS' }),

    // Bulk update
    updateUI: (updates) => 
      dispatch({ type: 'UPDATE_UI', updates }),
      
    resetUI: () => 
      dispatch({ type: 'RESET_UI' })
  };

  // ✅ Helper getters para facilitar uso
  const getters = {
    isModalOpen: (modal) => Boolean(state.modals[modal]),
    hasNotifications: () => state.notifications.length > 0,
    getNotificationCount: () => state.notifications.length,
    hasActiveFilters: () => state.searchTerm || state.selectedCategory !== 'Todas',
    getActiveModal: () => {
      const openModal = Object.entries(state.modals).find(([_, isOpen]) => isOpen);
      return openModal ? openModal[0] : null;
    }
  };

  const contextValue = {
    // Estado
    uiState: state,
    
    // Actions
    ...actions,
    
    // Getters
    ...getters
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI deve ser usado dentro de UIProvider');
  }
  return context;
};

// ✅ Hook especializado para modais
export const useModal = (modalName) => {
  const { uiState, showModal, hideModal, toggleModal } = useUI();
  
  return {
    isOpen: uiState.modals[modalName] || false,
    show: () => showModal(modalName),
    hide: () => hideModal(modalName),
    toggle: () => toggleModal(modalName)
  };
};

// ✅ Hook especializado para notificações
export const useNotifications = () => {
  const { 
    uiState, 
    addNotification, 
    removeNotification, 
    clearNotifications,
    hasNotifications,
    getNotificationCount 
  } = useUI();
  
  return {
    notifications: uiState.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    hasNotifications: hasNotifications(),
    count: getNotificationCount(),
    
    // Helper methods
    addSuccess: (message, title = 'Sucesso') => 
      addNotification({ type: 'success', title, message }),
      
    addError: (message, title = 'Erro') => 
      addNotification({ type: 'error', title, message, autoHide: false }),
      
    addWarning: (message, title = 'Atenção') => 
      addNotification({ type: 'warning', title, message }),
      
    addInfo: (message, title = 'Informação') => 
      addNotification({ type: 'info', title, message })
  };
};

// ✅ Hook especializado para search e filters
export const useFilters = () => {
  const { 
    uiState, 
    setSearch, 
    setCategory, 
    clearSearch, 
    resetFilters,
    hasActiveFilters 
  } = useUI();
  
  return {
    searchTerm: uiState.searchTerm,
    selectedCategory: uiState.selectedCategory,
    setSearch,
    setCategory,
    clearSearch,
    resetFilters,
    hasActiveFilters: hasActiveFilters()
  };
};