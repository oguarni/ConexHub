import React from 'react';
import Header from './components/common/Header';
import AppRouter from './components/router/AppRouter';
import { AppProvider } from './contexts/AppProvider';
import AuthModal from './components/auth/AuthModal';
import QuotationModal from './components/quotation/QuotationModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import OrdersModal from './components/orders/OrdersModal';
import QuotesSidebar from './components/quotes/QuotesSidebar';
import EnhancedErrorBoundary from './components/common/EnhancedErrorBoundary';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import { useQuotesModalQuery } from './hooks/queries/useQuotesQuery';
import './App.css';
import './styles/components.css';

// Notification container using Zustand
const NotificationContainer = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// This component centralizes the content that depends on the providers
const AppContent = () => {
  const { user } = useAuthStore();
  const { modals, showModal, hideModal, addNotification } = useUIStore();
  
  // Fetch quotes data for the sidebar
  const { data: quotes = [], isLoading: quotesLoading } = useQuotesModalQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AppRouter />
      <AuthModal />
      <QuotesSidebar
        showQuotes={modals.showQuotes}
        setShowQuotes={(show) => show ? showModal('showQuotes') : hideModal('showQuotes')}
        quotes={quotes}
        loading={quotesLoading}
        user={user}
        setShowQuoteComparison={(show) => show ? showModal('showQuoteComparison') : hideModal('showQuoteComparison')}
        setShowAuth={(show) => show ? showModal('showAuth') : hideModal('showAuth')}
      />
      <OrdersModal
        show={modals.showOrders}
        onClose={() => hideModal('showOrders')}
        user={user}
        addNotification={addNotification}
      />
      <QuotationModal />
      <CheckoutModal />
      <NotificationContainer />
    </div>
  );
};

// The main App component with the correct provider hierarchy
function App() {
  return (
    <EnhancedErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;