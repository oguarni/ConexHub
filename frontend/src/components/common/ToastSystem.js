import React, { memo, useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// ✅ Tipos de toast com configurações
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    baseClasses: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500',
    duration: 4000
  },
  error: {
    icon: AlertCircle,
    baseClasses: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
    duration: 6000
  },
  warning: {
    icon: AlertTriangle,
    baseClasses: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
    progressColor: 'bg-yellow-500',
    duration: 5000
  },
  info: {
    icon: Info,
    baseClasses: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
    duration: 4000
  },
  loading: {
    icon: Loader2,
    baseClasses: 'bg-gray-50 border-gray-200 text-gray-800',
    iconColor: 'text-gray-500',
    progressColor: 'bg-gray-500',
    duration: null // Não remove automaticamente
  }
};

// ✅ Componente Toast individual
const Toast = memo(({ 
  id, 
  type = 'info', 
  title, 
  message, 
  description,
  onRemove,
  duration,
  showProgress = true,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = TOAST_TYPES[type];
  const Icon = config.icon;
  const finalDuration = duration || config.duration;

  // ✅ Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Progress bar e auto-remove
  useEffect(() => {
    if (!finalDuration || type === 'loading') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (finalDuration / 100));
        if (newProgress <= 0) {
          handleRemove();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [finalDuration, type]);

  // ✅ Handler para remoção com animação
  const handleRemove = useCallback(() => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    setIsVisible(false);
    
    setTimeout(() => {
      onRemove(id);
    }, 300); // Tempo da animação
  }, [id, onRemove, isRemoving]);

  // ✅ Pausar progress no hover
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-out transform max-w-sm w-full
        ${config.baseClasses}
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ✅ Progress bar */}
      {showProgress && finalDuration && type !== 'loading' && (
        <div 
          className="absolute top-0 left-0 h-1 transition-all duration-100"
          style={{ 
            width: `${progress}%`,
            backgroundColor: config.progressColor.replace('bg-', ''),
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
          aria-hidden="true"
        />
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* ✅ Ícone */}
          <div className="flex-shrink-0">
            <Icon 
              size={20} 
              className={`${config.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </div>

          {/* ✅ Conteúdo */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-medium text-sm mb-1">{title}</h4>
            )}
            
            <p className="text-sm">{message}</p>
            
            {description && (
              <p className="text-xs mt-1 opacity-75">{description}</p>
            )}

            {/* ✅ Ações customizadas */}
            {actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                      action.variant === 'primary'
                        ? `bg-${type}-600 text-white hover:bg-${type}-700`
                        : `text-${type}-700 hover:text-${type}-900 underline`
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Botão fechar */}
          <button
            onClick={handleRemove}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500 rounded`}
            aria-label={`Fechar notificação: ${title || message}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

// ✅ Container de toasts
const ToastContainer = memo(({ toasts, onRemove, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4', 
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 space-y-2 ${positionClasses[position]}`}
      aria-label="Notificações"
      role="region"
    >
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onRemove={onRemove}
        />
      ))}
    </div>
  );
});

// ✅ Hook para gerenciar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  // ✅ Adicionar toast
  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      id,
      timestamp: new Date().toISOString(),
      ...toast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  // ✅ Remover toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // ✅ Limpar todos
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ✅ Atualizar toast existente
  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // ✅ Helpers tipados
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ type: 'loading', message, ...options });
  }, [addToast]);

  // ✅ Promisify para async operations
  const promise = useCallback(async (
    promiseFn, 
    { loading: loadingMsg, success: successMsg, error: errorMsg } = {}
  ) => {
    const loadingId = loading(loadingMsg || 'Processando...');
    
    try {
      const result = await promiseFn();
      removeToast(loadingId);
      success(successMsg || 'Operação concluída com sucesso!');
      return result;
    } catch (err) {
      removeToast(loadingId);
      error(errorMsg || err.message || 'Erro na operação');
      throw err;
    }
  }, [loading, success, error, removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    loading,
    promise
  };
};

// ✅ Provider de contexto para toasts
export const ToastContext = React.createContext(null);

export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const toast = useToast();

  // ✅ Limitar número máximo de toasts
  const limitedToasts = toast.toasts.slice(-maxToasts);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer 
        toasts={limitedToasts}
        onRemove={toast.removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// ✅ Hook para usar toast context
export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve ser usado dentro de ToastProvider');
  }
  return context;
};

// ✅ HOC para toast automático
export const withToastNotifications = (Component) => {
  return function ToastEnabledComponent(props) {
    return (
      <ToastProvider>
        <Component {...props} />
      </ToastProvider>
    );
  };
};

// ✅ Componente para testes
export const ToastTester = memo(() => {
  const toast = useToastContext();

  const testToasts = [
    () => toast.success('Operação realizada com sucesso!', { 
      title: 'Sucesso',
      description: 'Todos os dados foram salvos corretamente.'
    }),
    () => toast.error('Erro ao processar solicitação', {
      title: 'Erro',
      description: 'Verifique sua conexão e tente novamente.',
      actions: [
        { label: 'Tentar novamente', onClick: () => {}, variant: 'primary' },
        { label: 'Cancelar', onClick: () => {} }
      ]
    }),
    () => toast.warning('Atenção: Dados não salvos', {
      title: 'Aviso',
      description: 'Salve antes de sair da página.'
    }),
    () => toast.info('Nova funcionalidade disponível!', {
      title: 'Informação'
    }),
    () => toast.loading('Processando solicitação...', {
      title: 'Aguarde'
    })
  ];

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-bold">Teste de Toasts</h3>
      {testToasts.map((test, index) => (
        <button
          key={index}
          onClick={test}
          className="block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Toast {index + 1}
        </button>
      ))}
      <button
        onClick={toast.clearToasts}
        className="block bg-red-600 text-white px-4 py-2 rounded"
      >
        Limpar Todos
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';
ToastContainer.displayName = 'ToastContainer';
ToastTester.displayName = 'ToastTester';

export default ToastContainer;