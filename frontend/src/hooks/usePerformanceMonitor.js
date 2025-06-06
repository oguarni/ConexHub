import { useEffect, useRef, useCallback, useState } from 'react';

// ✅ Hook principal de monitoramento de performance
export const usePerformanceMonitor = (componentName, options = {}) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const mountTime = useRef(performance.now());
  const renderTimes = useRef([]);
  const [performanceData, setPerformanceData] = useState(null);
  
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    warningThreshold = 50, // ms
    maxRenderWarning = 10,
    trackMemory = false,
    trackNetworkRequests = false
  } = options;

  // ✅ Métricas de render
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    const timeSinceMount = currentTime - mountTime.current;
    
    // Armazenar histórico de render times
    renderTimes.current.push(timeSinceLastRender);
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift(); // Manter apenas os últimos 20
    }
    
    // Calcular métricas
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    const maxRenderTime = Math.max(...renderTimes.current);
    const minRenderTime = Math.min(...renderTimes.current);
    
    // Atualizar dados de performance
    const newPerformanceData = {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: timeSinceLastRender,
      averageRenderTime,
      maxRenderTime,
      minRenderTime,
      timeSinceMount,
      renderFrequency: renderCount.current / (timeSinceMount / 1000), // renders per second
      isSlowRender: timeSinceLastRender > warningThreshold,
      hasExcessiveRenders: renderCount.current > maxRenderWarning && timeSinceLastRender < warningThreshold
    };
    
    setPerformanceData(newPerformanceData);
    
    // ✅ Logging inteligente
    if (enableLogging) {
      const renderInfo = `🔍 ${componentName}: Render #${renderCount.current}`;
      const timeInfo = `Time: ${timeSinceLastRender.toFixed(2)}ms`;
      const avgInfo = `Avg: ${averageRenderTime.toFixed(2)}ms`;
      
      if (newPerformanceData.isSlowRender) {
        console.warn(`🐌 ${renderInfo}, ${timeInfo} (SLOW), ${avgInfo}`);
      } else if (newPerformanceData.hasExcessiveRenders) {
        console.warn(`🔄 ${renderInfo}, ${timeInfo} (EXCESSIVE), ${avgInfo}`);
      } else {
        console.log(`${renderInfo}, ${timeInfo}, ${avgInfo}`);
      }
    }
    
    lastRenderTime.current = currentTime;
  });

  // ✅ Métricas de memória (opcional)
  const getMemoryUsage = useCallback(() => {
    if (!trackMemory || !performance.memory) return null;
    
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
    };
  }, [trackMemory]);

  // ✅ Monitoramento de Network (opcional)
  const getNetworkMetrics = useCallback(() => {
    if (!trackNetworkRequests) return null;
    
    const entries = performance.getEntriesByType('navigation');
    if (entries.length === 0) return null;
    
    const navigation = entries[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalPageLoad: navigation.loadEventEnd - navigation.fetchStart
    };
  }, [trackNetworkRequests]);

  // ✅ Relatório completo de performance
  const getPerformanceReport = useCallback(() => {
    return {
      ...performanceData,
      memory: getMemoryUsage(),
      network: getNetworkMetrics(),
      timestamp: new Date().toISOString()
    };
  }, [performanceData, getMemoryUsage, getNetworkMetrics]);

  // ✅ Reset de métricas
  const resetMetrics = useCallback(() => {
    renderCount.current = 0;
    renderTimes.current = [];
    mountTime.current = performance.now();
    lastRenderTime.current = performance.now();
    setPerformanceData(null);
  }, []);

  return {
    performanceData,
    getPerformanceReport,
    resetMetrics,
    renderCount: renderCount.current
  };
};

// ✅ Hook especializado para componentes com dados
export const useDataFetchPerformance = (hookName, dataLength = 0) => {
  const fetchTimes = useRef([]);
  const lastFetchTime = useRef(null);
  const [fetchMetrics, setFetchMetrics] = useState({
    averageFetchTime: 0,
    lastFetchDuration: 0,
    fetchCount: 0,
    itemsPerSecond: 0
  });

  // ✅ Registrar início de fetch
  const markFetchStart = useCallback(() => {
    lastFetchTime.current = performance.now();
  }, []);

  // ✅ Registrar fim de fetch
  const markFetchEnd = useCallback(() => {
    if (!lastFetchTime.current) return;
    
    const duration = performance.now() - lastFetchTime.current;
    fetchTimes.current.push(duration);
    
    if (fetchTimes.current.length > 10) {
      fetchTimes.current.shift();
    }
    
    const averageFetchTime = fetchTimes.current.reduce((a, b) => a + b, 0) / fetchTimes.current.length;
    const itemsPerSecond = dataLength > 0 ? (dataLength / duration) * 1000 : 0;
    
    setFetchMetrics({
      averageFetchTime,
      lastFetchDuration: duration,
      fetchCount: fetchTimes.current.length,
      itemsPerSecond
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${hookName}: Fetch completed in ${duration.toFixed(2)}ms, ${dataLength} items, ${itemsPerSecond.toFixed(2)} items/sec`);
    }
    
    lastFetchTime.current = null;
  }, [hookName, dataLength]);

  return {
    fetchMetrics,
    markFetchStart,
    markFetchEnd
  };
};

// ✅ Hook para monitorar re-renders com dependências
export const useRenderOptimization = (componentName, dependencies = []) => {
  const previousDeps = useRef(dependencies);
  const renderReasons = useRef([]);
  
  useEffect(() => {
    const changedDeps = dependencies
      .map((dep, index) => ({
        index,
        prev: previousDeps.current[index],
        current: dep,
        changed: !Object.is(previousDeps.current[index], dep)
      }))
      .filter(dep => dep.changed);
    
    if (changedDeps.length > 0) {
      const reason = {
        timestamp: performance.now(),
        changedDependencies: changedDeps
      };
      
      renderReasons.current.push(reason);
      
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔄 ${componentName} re-render caused by:`);
        changedDeps.forEach(dep => {
          console.log(`Dependency ${dep.index}: ${JSON.stringify(dep.prev)} → ${JSON.stringify(dep.current)}`);
        });
        console.groupEnd();
      }
    }
    
    previousDeps.current = dependencies;
  }, dependencies);

  const getRenderReasons = useCallback(() => renderReasons.current.slice(-5), []);
  
  return { getRenderReasons };
};

// ✅ Hook para métricas de interação do usuário
export const useInteractionMetrics = (componentName) => {
  const interactions = useRef([]);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    averageResponseTime: 0,
    slowInteractions: 0
  });

  const trackInteraction = useCallback((interactionType, startTime = performance.now()) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const interaction = {
      type: interactionType,
      duration,
      timestamp: endTime,
      isSlow: duration > 100 // 100ms threshold
    };
    
    interactions.current.push(interaction);
    
    // Manter apenas as últimas 50 interações
    if (interactions.current.length > 50) {
      interactions.current.shift();
    }
    
    // Calcular métricas
    const totalInteractions = interactions.current.length;
    const averageResponseTime = interactions.current.reduce((sum, i) => sum + i.duration, 0) / totalInteractions;
    const slowInteractions = interactions.current.filter(i => i.isSlow).length;
    
    setMetrics({
      totalInteractions,
      averageResponseTime,
      slowInteractions
    });
    
    if (process.env.NODE_ENV === 'development' && interaction.isSlow) {
      console.warn(`🐌 ${componentName}: Slow ${interactionType} interaction (${duration.toFixed(2)}ms)`);
    }
    
    return interaction;
  }, [componentName]);

  return {
    metrics,
    trackInteraction,
    getInteractionHistory: () => interactions.current.slice(-10)
  };
};

// ✅ Hook para monitoramento de Virtual DOM
export const useVirtualDOMMetrics = (componentName) => {
  const [domMetrics, setDomMetrics] = useState({
    nodeCount: 0,
    eventListeners: 0,
    complexSelectors: 0
  });

  useEffect(() => {
    const measureDOM = () => {
      const nodeCount = document.querySelectorAll('*').length;
      const eventListeners = window.getEventListeners ? 
        Object.keys(window.getEventListeners(document)).length : 0;
      
      setDomMetrics({
        nodeCount,
        eventListeners,
        complexSelectors: document.querySelectorAll('[class*=" "], [class*=":"]').length
      });
    };

    measureDOM();
    const interval = setInterval(measureDOM, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return domMetrics;
};

// ✅ HOC para monitoramento automático
export const withPerformanceMonitoring = (Component, options = {}) => {
  return function PerformanceMonitoredComponent(props) {
    const componentName = Component.displayName || Component.name || 'UnknownComponent';
    const { performanceData } = usePerformanceMonitor(componentName, options);
    
    return <Component {...props} __performanceData={performanceData} />;
  };
};

// ✅ Provider para contexto global de performance
export const PerformanceContext = React.createContext();

export const PerformanceProvider = ({ children, enabled = process.env.NODE_ENV === 'development' }) => {
  const [globalMetrics, setGlobalMetrics] = useState({
    components: new Map(),
    totalRenders: 0,
    slowComponents: [],
    memoryLeaks: []
  });

  const registerComponent = useCallback((componentName, metrics) => {
    if (!enabled) return;
    
    setGlobalMetrics(prev => {
      const newComponents = new Map(prev.components);
      newComponents.set(componentName, metrics);
      
      const slowComponents = Array.from(newComponents.entries())
        .filter(([_, data]) => data.averageRenderTime > 50)
        .map(([name]) => name);
      
      return {
        ...prev,
        components: newComponents,
        totalRenders: prev.totalRenders + 1,
        slowComponents
      };
    });
  }, [enabled]);

  const getGlobalReport = useCallback(() => {
    return {
      ...globalMetrics,
      timestamp: new Date().toISOString(),
      componentsCount: globalMetrics.components.size
    };
  }, [globalMetrics]);

  return (
    <PerformanceContext.Provider value={{ registerComponent, getGlobalReport, globalMetrics }}>
      {children}
    </PerformanceContext.Provider>
  );
};

// ✅ Exemplo de uso no marketplace
/*
// Em ProductGrid.js
const ProductGrid = memo(({ products = [], loading = false, onRequestQuote, user }) => {
  const { performanceData } = usePerformanceMonitor('ProductGrid', {
    warningThreshold: 100,
    trackMemory: true
  });
  
  const { trackInteraction } = useInteractionMetrics('ProductGrid');
  const { fetchMetrics, markFetchStart, markFetchEnd } = useDataFetchPerformance('ProductGrid', products.length);
  
  useEffect(() => {
    if (products.length > 0) {
      markFetchEnd();
    }
  }, [products.length]);
  
  const handleQuoteRequest = useCallback((product) => {
    const startTime = performance.now();
    onRequestQuote(product);
    trackInteraction('quote-request', startTime);
  }, [onRequestQuote, trackInteraction]);
  
  // Component logic...
});

// Em App.js
function App() {
  return (
    <PerformanceProvider enabled={process.env.NODE_ENV === 'development'}>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </PerformanceProvider>
  );
}
*/