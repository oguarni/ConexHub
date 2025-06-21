import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './stores/authStore';
import { useNotifications, useModals } from './stores/uiStore';
import Header from './components/common/Header';
import AppRouter from './components/router/AppRouter';
import AuthModal from './components/auth/AuthModal';
import QuotesSidebar from './components/quotes/QuotesSidebar';
import OrdersModal from './components/orders/OrdersModal';
import QuotationModal from './components/quotation/QuotationModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import './App.css';
import './styles/components.css';

// Updated notification container using Zustand
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

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

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Carregando B2B Marketplace...</h2>
    </div>
  </div>
);

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              B2B Marketplace - Erro
            </h1>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado na aplicação.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App content
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { modals, showModal, hideModal } = useModals();
  const { addNotification } = useNotifications();
  
  // Initialize auth store on mount
  React.useEffect(() => {
    const authStore = require('./stores/authStore').default;
    authStore.getState().initializeAuth();
  }, []);
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AppRouter />
        <AuthModal />
        <QuotesSidebar
          showQuotes={modals.showQuotes}
          setShowQuotes={(show) => show ? showModal('showQuotes') : hideModal('showQuotes')}
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
    </Router>
  );
};

// Main App component
function App() {
  // Security checks
  useEffect(() => {
    // Check for DOMPurify in production
    if (process.env.NODE_ENV === 'production' && !window.DOMPurify) {
      console.warn('DOMPurify not found - limited security functionality');
    }

    // Performance check
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported - performance may be affected');
    }

    // CSP violation handler
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('securitypolicyviolation', (e) => {
        console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;