import React from 'react';
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const errorId = React.useMemo(() => Date.now().toString(), []);

  React.useEffect(() => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId
    };
    
    console.error('Error Boundary:', errorData);
    
    if (process.env.NODE_ENV === 'production') {
      sendToErrorService(errorData);
    }
  }, [error, errorId]);

  const sendToErrorService = async (errorData) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      console.error('Failed to send error to service:', err);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Ops! Algo deu errado
        </h1>
        
        <p className="text-gray-600 mb-4">
          Erro ID: {errorId}
        </p>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>Tentar Novamente</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home size={18} />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Debug Info
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {error?.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

const BetterErrorBoundary = ({ children, fallback }) => {
  const handleError = React.useCallback((error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
  }, []);

  const handleReset = React.useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

export const withErrorBoundary = (Component, fallback) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <BetterErrorBoundary fallback={fallback}>
        <Component {...props} />
      </BetterErrorBoundary>
    );
  };
};

export { useErrorHandler };
export default BetterErrorBoundary;