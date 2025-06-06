import React, { memo } from 'react';
import { Loader2, Package, FileText, Users, Settings } from 'lucide-react';

// ✅ Spinner base reutilizável
const BaseSpinner = memo(({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      aria-hidden="true"
    />
  );
});

// ✅ Loading inline para botões
export const ButtonLoading = memo(({ text = 'Carregando...', size = 'sm' }) => (
  <div className="flex items-center space-x-2" role="status" aria-live="polite">
    <BaseSpinner size={size} />
    <span className="text-sm">{text}</span>
    <span className="sr-only">Carregando</span>
  </div>
));

// ✅ Loading para cards/componentes pequenos
export const CardLoading = memo(({ text = 'Carregando...', height = 'h-32' }) => (
  <div 
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${height} flex flex-col items-center justify-center p-4`}
    role="status"
    aria-live="polite"
  >
    <BaseSpinner size="md" />
    <p className="text-sm text-gray-600 mt-2">{text}</p>
    <span className="sr-only">Carregando conteúdo</span>
  </div>
));

// ✅ Loading para seções/páginas
export const SectionLoading = memo(({ 
  text = 'Carregando dados...', 
  description,
  icon: Icon = Package 
}) => (
  <div 
    className="flex flex-col items-center justify-center py-16 px-4"
    role="status"
    aria-live="polite"
  >
    <div className="relative">
      <Icon className="w-16 h-16 text-gray-300 mb-4" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BaseSpinner size="lg" />
      </div>
    </div>
    
    <h3 className="text-lg font-medium text-gray-900 mb-2">{text}</h3>
    {description && (
      <p className="text-gray-500 text-center max-w-md">{description}</p>
    )}
    <span className="sr-only">Carregando {text}</span>
  </div>
));

// ✅ Loading para modal
export const ModalLoading = memo(({ text = 'Carregando...', size = 'md' }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-live="polite"
  >
    <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm mx-4">
      <div className="flex flex-col items-center space-y-4">
        <BaseSpinner size={size} />
        <p className="text-gray-700 font-medium">{text}</p>
        <span className="sr-only">Modal carregando</span>
      </div>
    </div>
  </div>
));

// ✅ Loading para página inteira
export const PageLoading = memo(({ 
  text = 'Carregando página...', 
  description = 'Aguarde um momento' 
}) => (
  <div 
    className="min-h-screen flex items-center justify-center bg-gray-50"
    role="status"
    aria-live="polite"
  >
    <div className="text-center">
      <BaseSpinner size="xl" />
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">{text}</h2>
      <p className="text-gray-500">{description}</p>
      <span className="sr-only">Página carregando</span>
    </div>
  </div>
));

// ✅ Skeleton para lista de produtos
export const ProductsSkeleton = memo(({ count = 8 }) => (
  <div 
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    role="status"
    aria-label="Carregando produtos"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-4 h-full flex flex-col">
          {/* Ícone produto */}
          <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>
          
          {/* Nome e fornecedor */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Descrição */}
          <div className="space-y-2 mb-3 flex-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
          
          {/* Badge categoria */}
          <div className="h-5 bg-gray-200 rounded-full w-1/3 mb-3"></div>
          
          {/* Preço */}
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
          
          {/* Botão */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
    <span className="sr-only">Carregando {count} produtos</span>
  </div>
));

// ✅ Skeleton para cotações
export const QuotesSkeleton = memo(({ count = 3 }) => (
  <div className="space-y-4" role="status" aria-label="Carregando cotações">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border rounded-lg p-3 bg-gray-50 animate-pulse">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/5"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        
        <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
      </div>
    ))}
    <span className="sr-only">Carregando {count} cotações</span>
  </div>
));

// ✅ Loading específicos por contexto
export const AdminLoading = memo(() => (
  <SectionLoading 
    text="Carregando painel administrativo..."
    description="Preparando ferramentas de gestão"
    icon={Settings}
  />
));

export const QuotesLoading = memo(() => (
  <SectionLoading 
    text="Carregando cotações..."
    description="Buscando suas solicitações"
    icon={FileText}
  />
));

export const SuppliersLoading = memo(() => (
  <SectionLoading 
    text="Carregando fornecedores..."
    description="Verificando aprovações pendentes"
    icon={Users}
  />
));

// ✅ Hook para gerenciar estados de loading
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState('');

  const startLoading = React.useCallback((text = 'Carregando...') => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  const withLoading = React.useCallback(async (asyncFn, text = 'Processando...') => {
    try {
      startLoading(text);
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading
  };
};

// ✅ HOC para loading automático
export const withLoadingBoundary = (Component, LoadingComponent = SectionLoading) => {
  return memo((props) => {
    if (props.loading) {
      return <LoadingComponent {...props.loadingProps} />;
    }
    return <Component {...props} />;
  });
};

export default {
  ButtonLoading,
  CardLoading,
  SectionLoading,
  ModalLoading,
  PageLoading,
  ProductsSkeleton,
  QuotesSkeleton,
  AdminLoading,
  QuotesLoading,
  SuppliersLoading,
  BaseSpinner,
  useLoadingState,
  withLoadingBoundary
};