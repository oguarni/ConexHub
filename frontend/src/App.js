import React, { Suspense, lazy } from 'react';
import EnhancedErrorBoundary from './components/common/EnhancedErrorBoundary';
import { ToastProvider } from './components/common/ToastSystem';
import { PageLoading } from './components/common/LoadingStates';
import SecuritySanitizer from './utils/sanitizer';
import './App.css';

// ✅ Lazy loading para performance
const AppProvider = lazy(() => import('./contexts/AppProvider'));
const Header = lazy(() => import('./components/common/Header'));
const MainContent = lazy(() => import('./components/layout/MainContent'));
const ModalsContainer = lazy(() => import('./components/common/ModalsContainer'));

// ✅ Error fallback customizado
const AppErrorFallback = ({ error, resetError, errorId }) => (
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
      
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            Detalhes do Erro
          </summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {error?.message}
          </pre>
        </details>
      )}
      
      <div className="space-y-2">
        <button
          onClick={resetError}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
        >
          Recarregar Página
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">ID: {errorId}</p>
    </div>
  </div>
);

// ✅ Loading fallback melhorado
const AppLoadingFallback = () => (
  <PageLoading 
    text="Carregando B2B Marketplace..."
    description="Preparando ambiente de negócios"
  />
);

// ✅ Componente principal da aplicação
const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoading text="Carregando cabeçalho..." />}>
        <Header />
      </Suspense>
      
      <Suspense fallback={<PageLoading text="Carregando conteúdo principal..." />}>
        <MainContent />
      </Suspense>
      
      <Suspense fallback={null}>
        <ModalsContainer />
      </Suspense>
    </div>
  );
};

// ✅ App principal com todas as proteções
function App() {
  // ✅ Verificação de segurança básica
  React.useEffect(() => {
    // Verificar se DOMPurify está disponível
    if (!window.DOMPurify && process.env.NODE_ENV === 'production') {
      console.warn('DOMPurify não encontrado - funcionalidade de segurança limitada');
    }

    // Verificar capacidades do browser
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver não suportado - performance pode ser afetada');
    }

    // CSP Report endpoint (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('securitypolicyviolation', (e) => {
        console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
      });
    }
  }, []);

  // ✅ Error handler global para promises rejeitadas
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      // Opcional: reportar erro para serviço de monitoramento
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('unhandled_promise_rejection', { error: event.reason });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <EnhancedErrorBoundary fallback={AppErrorFallback}>
      <ToastProvider position="top-right" maxToasts={3}>
        <Suspense fallback={<AppLoadingFallback />}>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </Suspense>
      </ToastProvider>
    </EnhancedErrorBoundary>
  );
}

// ✅ HOC para desenvolvimento com ferramentas de debug
const AppWithDevelopmentTools = process.env.NODE_ENV === 'development' 
  ? React.memo(() => {
      const [showDebugInfo, setShowDebugInfo] = React.useState(false);
      
      // ✅ Atalhos de teclado para desenvolvimento
      React.useEffect(() => {
        const handleKeyPress = (e) => {
          // Ctrl + Shift + D = Toggle debug info
          if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            setShowDebugInfo(prev => !prev);
          }
          
          // Ctrl + Shift + C = Clear all storage
          if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Storage limpo');
          }
          
          // Ctrl + Shift + R = Reload with cache bypass
          if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            window.location.reload(true);
          }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }, []);

      return (
        <>
          <App />
          
          {/* ✅ Debug overlay */}
          {showDebugInfo && (
            <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Debug Info</h4>
                <button 
                  onClick={() => setShowDebugInfo(false)}
                  className="text-white hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-1">
                <div>Env: {process.env.NODE_ENV}</div>
                <div>React: {React.version}</div>
                <div>UserAgent: {navigator.userAgent.slice(0, 30)}...</div>
                <div>Screen: {screen.width}x{screen.height}</div>
                <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
                <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                <div>Memory: {performance.memory?.usedJSHeapSize ? 
                  `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
                </div>
              </div>
              
              <div className="mt-2 text-gray-300">
                Ctrl+Shift+D: Toggle | Ctrl+Shift+C: Clear Storage
              </div>
            </div>
          )}
        </>
      );
    })
  : App;

// ✅ Verificação de compatibilidade do navegador
const BrowserCompatibilityCheck = ({ children }) => {
  const [isCompatible, setIsCompatible] = React.useState(true);
  const [missingFeatures, setMissingFeatures] = React.useState([]);

  React.useEffect(() => {
    const requiredFeatures = [
      { name: 'fetch', check: () => typeof fetch !== 'undefined' },
      { name: 'Promise', check: () => typeof Promise !== 'undefined' },
      { name: 'localStorage', check: () => typeof Storage !== 'undefined' },
      { name: 'addEventListener', check: () => typeof EventTarget !== 'undefined' }
    ];

    const missing = requiredFeatures.filter(feature => !feature.check());
    
    if (missing.length > 0) {
      setIsCompatible(false);
      setMissingFeatures(missing.map(f => f.name));
    }
  }, []);

  if (!isCompatible) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Navegador Incompatível
          </h1>
          <p className="text-red-700 mb-4">
            Seu navegador não suporta recursos necessários para esta aplicação.
          </p>
          <div className="text-sm text-red-600 mb-4">
            Recursos ausentes: {missingFeatures.join(', ')}
          </div>
          <p className="text-sm text-gray-600">
            Por favor, atualize para uma versão mais recente do Chrome, Firefox, Safari ou Edge.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// ✅ Export principal
export default function SecureApp() {
  return (
    <BrowserCompatibilityCheck>
      <AppWithDevelopmentTools />
    </BrowserCompatibilityCheck>
  );
}

// ✅ Metadata para SEO e PWA
export const AppMetadata = {
  title: 'B2B Marketplace - Soluções Industriais',
  description: 'Marketplace B2B para cotações industriais rápidas e seguras',
  keywords: 'b2b, marketplace, industrial, cotações, fornecedores',
  author: 'UTFPR - Software Engineering',
  version: process.env.REACT_APP_VERSION || '0.2.0'
};