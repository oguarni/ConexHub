import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';

const useUIStore = create(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // Modal state
        modals: {
          showAuth: false,
          showQuotes: false,
          showQuoteModal: false,
          showAdmin: false,
          showQuoteSuccess: false,
          showQuoteComparison: false,
          showOrders: false,
          showQuotation: false,
          showCheckout: false,
          showCart: false,
        },

        // Navigation state
        isMenuOpen: false,

        // Filter state
        selectedCategory: 'all',
        searchTerm: '',

        // Auth modal state
        isLogin: true,

        // Notification state
        notifications: [],

        // Modal actions
        showModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: true },
          })),

        hideModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: false },
          })),

        toggleModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: !state.modals[modalName] },
          })),

        hideAllModals: () =>
          set((state) => ({
            modals: Object.keys(state.modals).reduce(
              (acc, key) => ({ ...acc, [key]: false }),
              {}
            ),
          })),

        // Navigation actions
        toggleMenu: () =>
          set((state) => ({ isMenuOpen: !state.isMenuOpen })),

        closeMenu: () => set({ isMenuOpen: false }),

        // Filter actions
        setSelectedCategory: (category) => set({ selectedCategory: category }),

        setSearchTerm: (term) => set({ searchTerm: term }),

        clearFilters: () =>
          set({ selectedCategory: 'all', searchTerm: '' }),

        // Auth modal actions
        setIsLogin: (isLogin) => set({ isLogin }),

        toggleAuthMode: () =>
          set((state) => ({ isLogin: !state.isLogin })),

        // Notification actions
        addNotification: (notification) => {
          const id = Date.now() + Math.random();
          const newNotification = {
            id,
            timestamp: Date.now(),
            ...notification,
          };

          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));

          // Auto-remove after specified duration or 5 seconds
          if (notification.autoHide !== false) {
            const duration = notification.duration || 5000;
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }

          return id;
        },

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),

        // Bulk update
        updateUI: (updates) => set(updates),

        // Reset to initial state
        resetUI: () =>
          set({
            modals: {
              showAuth: false,
              showQuotes: false,
              showQuoteModal: false,
              showAdmin: false,
              showQuoteSuccess: false,
              showQuoteComparison: false,
              showOrders: false,
              showQuotation: false,
              showCheckout: false,
              showCart: false,
            },
            isMenuOpen: false,
            selectedCategory: 'all',
            searchTerm: '',
            isLogin: true,
            notifications: [],
          }),

        // Getters
        isModalOpen: (modalName) => get().modals[modalName] || false,
        hasNotifications: () => get().notifications.length > 0,
        getNotificationCount: () => get().notifications.length,
        hasActiveFilters: () => {
          const state = get();
          return state.searchTerm || state.selectedCategory !== 'all';
        },
        getActiveModal: () => {
          const { modals } = get();
          const openModal = Object.entries(modals).find(([_, isOpen]) => isOpen);
          return openModal ? openModal[0] : null;
        },
      }),
      {
        name: 'ui-store',
      }
    )
  )
);

// Helper hooks for specific UI concerns
export const useModals = () => {
  const modals = useUIStore((state) => state.modals);
  const showModal = useUIStore((state) => state.showModal);
  const hideModal = useUIStore((state) => state.hideModal);
  const toggleModal = useUIStore((state) => state.toggleModal);
  const hideAllModals = useUIStore((state) => state.hideAllModals);
  const isModalOpen = useUIStore((state) => state.isModalOpen);
  const getActiveModal = useUIStore((state) => state.getActiveModal);

  return {
    modals,
    showModal,
    hideModal,
    toggleModal,
    hideAllModals,
    isModalOpen,
    getActiveModal,
  };
};

export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const clearNotifications = useUIStore((state) => state.clearNotifications);
  const hasNotifications = useUIStore((state) => state.hasNotifications);
  const getNotificationCount = useUIStore((state) => state.getNotificationCount);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    hasNotifications,
    count: getNotificationCount(),
    
    // Helper methods for different notification types
    addSuccess: (message, title = 'Sucesso') =>
      addNotification({ type: 'success', title, message }),
    
    addError: (message, title = 'Erro') =>
      addNotification({ type: 'error', title, message, autoHide: false }),
    
    addWarning: (message, title = 'Atenção') =>
      addNotification({ type: 'warning', title, message }),
    
    addInfo: (message, title = 'Informação') =>
      addNotification({ type: 'info', title, message }),
  };
};

export const useFilters = () => {
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const searchTerm = useUIStore((state) => state.searchTerm);
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory);
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const clearFilters = useUIStore((state) => state.clearFilters);
  const hasActiveFilters = useUIStore((state) => state.hasActiveFilters);

  return {
    selectedCategory,
    searchTerm,
    setSelectedCategory,
    setSearchTerm,
    clearFilters,
    hasActiveFilters,
  };
};

export const useNavigation = () => {
  const isMenuOpen = useUIStore((state) => state.isMenuOpen);
  const toggleMenu = useUIStore((state) => state.toggleMenu);
  const closeMenu = useUIStore((state) => state.closeMenu);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
};

export const useAuthModal = () => {
  const isLogin = useUIStore((state) => state.isLogin);
  const setIsLogin = useUIStore((state) => state.setIsLogin);
  const toggleAuthMode = useUIStore((state) => state.toggleAuthMode);

  return {
    isLogin,
    setIsLogin,
    toggleAuthMode,
  };
};

export default useUIStore;