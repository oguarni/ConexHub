import { useCallback, useRef, useState } from 'react';

/**
 * Hook for measuring component performance metrics
 */
export const usePerformance = (componentName = 'Unknown') => {
  const renderStartRef = useRef(0);
  const renderCountRef = useRef(0);
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    totalRenderTime: 0
  });
  
  const startMeasure = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      renderStartRef.current = performance.now();
    }
  }, []);
  
  const endMeasure = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStartRef.current;
      renderCountRef.current += 1;
      
      setMetrics(prev => {
        const totalTime = prev.totalRenderTime + renderTime;
        return {
          renderCount: renderCountRef.current,
          averageRenderTime: totalTime / renderCountRef.current,
          lastRenderTime: renderTime,
          totalRenderTime: totalTime
        };
      });
      
      // Log slow renders
      if (renderTime > 16) {
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName]);
  
  const logMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Performance Metrics: ${componentName}`);
      console.log('Render count:', metrics.renderCount);
      console.log('Average render time:', `${metrics.averageRenderTime.toFixed(2)}ms`);
      console.log('Last render time:', `${metrics.lastRenderTime.toFixed(2)}ms`);
      console.log('Total render time:', `${metrics.totalRenderTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  }, [componentName, metrics]);
  
  return {
    metrics,
    startMeasure,
    endMeasure,
    logMetrics
  };
};

/**
 * Hook for tracking expensive computations
 */
export const useComputationTracker = () => {
  const track = useCallback((name, computation) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = computation();
      const end = performance.now();
      const time = end - start;
      
      if (time > 5) { // Log computations taking more than 5ms
        console.log(`⚡ Computation "${name}": ${time.toFixed(2)}ms`);
      }
      
      return result;
    }
    
    return computation();
  }, []);
  
  return { track };
};

/**
 * Hook for memory usage monitoring (Chrome DevTools required)
 */
export const useMemoryMonitor = () => {
  const getMemoryUsage = useCallback(() => {
    if (performance.memory && process.env.NODE_ENV === 'development') {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }, []);
  
  const logMemoryUsage = useCallback((label = 'Memory Usage') => {
    const usage = getMemoryUsage();
    if (usage) {
      console.log(`🧠 ${label}:`, usage);
      
      // Warn about high memory usage
      const percentage = (usage.used / usage.limit) * 100;
      if (percentage > 80) {
        console.warn('⚠️  High memory usage detected!', `${percentage.toFixed(1)}%`);
      }
    }
  }, [getMemoryUsage]);
  
  return {
    getMemoryUsage,
    logMemoryUsage
  };
};