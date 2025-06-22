import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, Shield } from 'lucide-react';

// ✅ Tipos de erro categorizados
const ErrorTypes = {
  NETWORK: 'network',
  SECURITY: 'security', 
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  COMPONENT: 'component',
  UNKNOWN: 'unknown'
};

// ✅ Classificador inteligente de erros
class ErrorClassifier {
  static classify(error, errorInfo) {
    const errorMessage = error.message?.toLowerCase() || '';
    const stackTrace = error.stack?.toLowerCase() || '';
    const componentStack = errorInfo.componentStack?.toLowerCase() || '';

    // Erros de rede
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('cors') ||
        error.name === 'NetworkError') {
      return ErrorTypes.NETWORK;
    }

    // Erros de segurança
    if (errorMessage.includes('xss') ||
        errorMessage.includes('security') ||
        errorMessage.includes('sanitize') ||
        componentStack.includes('secureproductcard')) {
      return ErrorTypes.SECURITY;
    }

    // Erros de validação
    if (errorMessage.includes('validation') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('required') ||
        componentStack.includes('validator')) {
      return ErrorTypes.VALIDATION;
    }

    // Erros de permissão
    if (errorMessage.includes('permission') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('unauthorized') ||
        error.status === 403) {
      return ErrorTypes.PERMISSION;
    }

    // Erros de componente
    if (stackTrace.includes('react') ||
        componentStack.includes('component') ||
        error.name === 'TypeError' ||
        error.name === 'ReferenceError') {
      return ErrorTypes.COMPONENT;
    }

    return ErrorTypes.UNKNOWN;
  }
}

// ✅ Componentes de erro específicos
const NetworkErrorView = ({ error, onRetry, errorId }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
    <div className="flex items-center mb-4">
      <Wifi className="text-red-500 mr-3" size={24} />
      <h3 className="text-lg font-semibold text-red-800">Erro de Conexão</h3>
    </div>
    
    <p className="text-red-700 mb-4">
      Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
    </p>
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center space-x-2"
      >
        <RefreshCw size={16} />
        <span>Tentar Novamente</span>
      </button>
      
      <p className="text-xs text-red-600 text-center">ID: {errorId}</p>
    </div>
  </div>
);

const SecurityErrorView = ({ error, onRetry, errorId }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
    <div className="flex items-center mb-4">
      <Shield className="text-yellow-500 mr-3" size={24} />
      <h3 className="text-lg font-semibold text-yellow-800">Erro de Segurança</h3>
    </div>
    
    <p className="text-yellow-700 mb-4">
      Conteúdo bloqueado por medidas de segurança. Os dados foram sanitizados.
    </p>
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 flex items-center justify-center space-x-2"
      >
        <RefreshCw size={16} />
        <span>Recarregar</span>
      </button>
      
      <p className="text-xs text-yellow-600 text-center">ID: {errorId}</p>
    </div>
  </div>
);

const ComponentErrorView = ({ error, onRetry, errorId, componentStack }) => (
  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
    <div className="flex items-center mb-4">
      <Bug className="text-purple-500 mr-3" size={24} />
      <h3 className="text-lg font-semibold text-purple-800">Erro no Componente</h3>
    </div>
    
    <p className="text-purple-700 mb-4">
      Um componente encontrou um problema inesperado.
    </p>
    
    {process.env.NODE_ENV === 'development' && componentStack && (
      <details className="mb-4">
        <summary className="text-sm text-purple-600 cursor-pointer">Detalhes técnicos</summary>
        <pre className="text-xs bg-purple-100 p-2 rounded mt-2 overflow-auto">
          {componentStack.split('\n').slice(0, 5).join('\n')}
        </pre>
      </details>
    )}
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 flex items-center justify-center space-x-2"
      >
        <RefreshCw size={16} />
        <span>Tentar Novamente</span>
      </button>
      
      <p className="text-xs text-purple-600 text-center">ID: {errorId}</p>
    </div>
  </div>
);

const DefaultErrorView = ({ error, onRetry, onGoHome, errorId }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
    <div className="flex items-center mb-4">
      <AlertTriangle className="text-gray-500 mr-3" size={24} />
      <h3 className="text-lg font-semibold text-gray-800">Ops! Algo deu errado</h3>
    </div>
    
    <p className="text-gray-700 mb-4">
      Ocorreu um erro inesperado. Nossa equipe foi notificada.
    </p>
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
      >
        <RefreshCw size={16} />
        <span>Tentar Novamente</span>
      </button>
      
      <button
        onClick={onGoHome}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center justify-center space-x-2"
      >
        <Home size={16} />
        <span>Voltar ao Início</span>
      </button>
      
      <p className="text-xs text-gray-600 text-center">ID: {errorId}</p>
    </div>
  </div>
);

// ✅ Enhanced Error Boundary principal
class EnhancedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      errorType: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorType = ErrorClassifier.classify(error, errorInfo);
    
    this.setState({ 
      error, 
      errorInfo,
      errorType
    });

    this.logError(error, errorInfo, errorType);
  }

  logError = (error, errorInfo, errorType) => {
    const errorData = {
      id: this.state.errorId,
      type: errorType,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      retryCount: this.state.retryCount
    };
    
    // Log local
    console.group(`🚨 Error Boundary [${errorType.toUpperCase()}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Classified as:', errorType);
    console.groupEnd();
    
    // Enviar para serviço de monitoramento (produção)
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  };

  sendToErrorService = async (errorData) => {
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

  handleRetry = () => {
    const maxRetries = 3;
    
    if (this.state.retryCount >= maxRetries) {
      this.handleGoHome();
      return;
    }

    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  renderErrorView() {
    const { error, errorInfo, errorId, errorType } = this.state;
    const commonProps = {
      error,
      errorId,
      onRetry: this.handleRetry,
      onGoHome: this.handleGoHome
    };

    switch (errorType) {
      case ErrorTypes.NETWORK:
        return <NetworkErrorView {...commonProps} />;
      
      case ErrorTypes.SECURITY:
        return <SecurityErrorView {...commonProps} />;
      
      case ErrorTypes.COMPONENT:
        return (
          <ComponentErrorView 
            {...commonProps} 
            componentStack={errorInfo?.componentStack}
          />
        );
      
      default:
        return <DefaultErrorView {...commonProps} />;
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorType={this.state.errorType}
            resetError={this.handleRetry}
            errorId={this.state.errorId}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          {this.renderErrorView()}
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ HOCs especializados
export const withNetworkErrorBoundary = (Component) => {
  return function NetworkErrorBoundaryComponent(props) {
    return (
      <EnhancedErrorBoundary>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

export const withSecurityErrorBoundary = (Component) => {
  return function SecurityErrorBoundaryComponent(props) {
    return (
      <EnhancedErrorBoundary>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

// ✅ Hook para erro manual
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const throwError = React.useCallback((error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { throwError, clearError };
};

// ✅ Context para errors globais
export const ErrorContext = React.createContext();

export const ErrorProvider = ({ children }) => {
  const [globalErrors, setGlobalErrors] = React.useState([]);

  const addError = React.useCallback((error) => {
    const errorWithId = {
      ...error,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    
    setGlobalErrors(prev => [...prev, errorWithId]);
    
    // Auto-remove após 10 segundos
    setTimeout(() => {
      setGlobalErrors(prev => prev.filter(e => e.id !== errorWithId.id));
    }, 10000);
  }, []);

  const removeError = React.useCallback((errorId) => {
    setGlobalErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  return (
    <ErrorContext.Provider value={{ globalErrors, addError, removeError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default EnhancedErrorBoundary;