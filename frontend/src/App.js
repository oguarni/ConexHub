import React, { Suspense, useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/common/Header';
import MainContent from './components/layout/MainContent';
import AuthModal from './components/auth/AuthModal';
import QuotesSidebar from './components/quotes/QuotesSidebar';
import OrdersModal from './components/orders/OrdersModal';
import About from './components/pages/About';
import DebugProducts from './components/DebugProducts';
import './App.css';

// Simple notification container
const NotificationContainer = () => {
  const { uiState, removeNotification } = useAppContext();

  if (uiState.notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {uiState.notifications.map(notification => (
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
  const { uiState, quotes, loading, user, updateUI, loadQuotes, addNotification } = useAppContext();
  const [currentPage, setCurrentPage] = useState('products');
  
  // Add debug mode for testing
  const isDebug = window.location.search.includes('debug=true');
  
  // Load quotes when user logs in
  React.useEffect(() => {
    if (user && uiState.showQuotes) {
      loadQuotes();
    }
  }, [user, uiState.showQuotes, loadQuotes]);
  
  // Simple page routing
  const renderPage = () => {
    if (isDebug) return <DebugProducts />;
    
    switch (currentPage) {
      case 'about':
        return <About />;
      default:
        return <MainContent />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <AuthModal />
      <QuotesSidebar
        showQuotes={uiState.showQuotes}
        setShowQuotes={(show) => updateUI({ showQuotes: show })}
        quotes={quotes}
        loading={loading}
        user={user}
        setShowQuoteComparison={(show) => updateUI({ showQuoteComparison: show })}
        setShowAuth={(show) => updateUI({ showAuth: show })}
      />
      <OrdersModal
        show={uiState.showOrders}
        onClose={() => updateUI({ showOrders: false })}
        user={user}
        addNotification={addNotification}
      />
      <NotificationContainer />
    </div>
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
      <LanguageProvider>
        <AppProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppContent />
          </Suspense>
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;