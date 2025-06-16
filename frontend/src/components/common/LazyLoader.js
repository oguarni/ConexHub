import React, { Suspense, memo } from 'react';
import { Package } from 'lucide-react';

/**
 * Enhanced loading component with better UX
 */
const LoadingSpinner = memo(({ message = 'Carregando...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}></div>
      <div className="flex items-center space-x-2 text-gray-600">
        <Package size={16} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Error boundary for lazy-loaded components
 */
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
          <Package className="text-red-500" size={48} />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Erro ao carregar componente
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Houve um problema ao carregar esta seção. 
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for lazy loading components with enhanced error handling
 */
export const withLazyLoading = (LazyComponent, loadingProps = {}) => {
  const LazyWrapper = memo((props) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingSpinner {...loadingProps} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  ));

  LazyWrapper.displayName = `withLazyLoading(${LazyComponent.displayName || LazyComponent.name})`;

  return LazyWrapper;
};

/**
 * Component for intersection observer based lazy loading
 */
export const LazySection = memo(({ 
  children, 
  placeholder, 
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <LoadingSpinner message="Carregando seção..." />
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={elementRef}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        placeholder || <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      )}
    </div>
  );
});

LazySection.displayName = 'LazySection';

export default LoadingSpinner;