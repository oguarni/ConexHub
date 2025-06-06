class PerformanceMonitor {
  static thresholds = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    CLS: 0.1,  // Cumulative Layout Shift
    FID: 100   // First Input Delay
  };

  static init() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    this.measureFCP();
    this.measureLCP();
    this.measureCLS();
    this.measureFID();
  }

  static measureFCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntriesByName('first-contentful-paint');
      if (entries.length > 0) {
        const fcp = entries[0].startTime;
        console.log('FCP:', fcp);
        
        if (fcp > this.thresholds.FCP) {
          console.warn('⚠️ Slow FCP detected:', fcp);
        }
      }
    }).observe({ entryTypes: ['paint'] });
  }

  static measureComponentRender(componentName, renderTime) {
    if (renderTime > 16) { // 16ms = 60fps
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime}ms`);
    }
  }
}

// hooks/usePerformanceOptimization.js
export const usePerformanceOptimization = () => {
  const [renderCount, setRenderCount] = useState(0);
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderCount > 10 && renderTime > 16) {
      console.warn('Performance issue detected:', {
        renderCount,
        renderTime
      });
    }
  });

  return { renderCount };
};