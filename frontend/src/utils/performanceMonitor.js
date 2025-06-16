class PerformanceMonitor {
  static thresholds = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    CLS: 0.1,  // Cumulative Layout Shift
    FID: 100   // First Input Delay
  };

  static metrics = new Map();
  static observers = new Map();
  static isEnabled = process.env.NODE_ENV === 'development';

  static init() {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Core Web Vitals
    this.measureFCP();
    this.measureLCP();
    this.measureCLS();
    this.measureFID();
    this.measureBundleLoading();
    this.trackMemoryUsage();
    this.profileComponentTree();

    // Expose to global scope for manual testing
    window.performanceMonitor = this;
    
    console.log('🔍 Enhanced Performance monitoring enabled');
    console.log('Generate report: window.performanceMonitor.generateReport()');
  }

  static measureFCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntriesByName('first-contentful-paint');
      if (entries.length > 0) {
        const fcp = entries[0].startTime;
        console.log('🎨 FCP:', fcp.toFixed(2), 'ms');
        
        if (fcp > this.thresholds.FCP) {
          console.warn('⚠️ Slow FCP detected:', fcp.toFixed(2), 'ms');
        }
      }
    }).observe({ entryTypes: ['paint'] });
  }

  static measureLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      console.log('🖼️  LCP:', lcp.toFixed(2), 'ms');
      
      if (lcp > this.thresholds.LCP) {
        console.warn('⚠️ Slow LCP detected:', lcp.toFixed(2), 'ms');
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  static measureCLS() {
    new PerformanceObserver((list) => {
      let cumulativeScore = 0;
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
        }
      }
      console.log('📐 CLS:', cumulativeScore.toFixed(4));
      
      if (cumulativeScore > this.thresholds.CLS) {
        console.warn('⚠️ High CLS detected:', cumulativeScore.toFixed(4));
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  static measureFID() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('⚡ FID:', fid.toFixed(2), 'ms');
        
        if (fid > this.thresholds.FID) {
          console.warn('⚠️ Slow FID detected:', fid.toFixed(2), 'ms');
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  static measureBundleLoading() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('chunk') || entry.name.includes('.js')) {
          console.log(`📦 Bundle: ${entry.name.split('/').pop()} - ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('bundle', observer);
  }

  static trackMemoryUsage() {
    if (!performance.memory) return;

    const logMemory = () => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576);
      const total = Math.round(memory.totalJSHeapSize / 1048576);
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      console.log(`🧠 Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);
      
      if (used / limit > 0.8) {
        console.warn('⚠️  High memory usage detected!');
      }
    };

    setInterval(logMemory, 30000);
    logMemory();
  }

  static profileComponentTree() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('🔍 React DevTools detected - profiling enabled');
    }
  }

  static startMeasure(componentName, props = {}) {
    if (!this.isEnabled) return;

    const measureId = `${componentName}-${Date.now()}`;
    performance.mark(`${measureId}-start`);
    
    this.metrics.set(measureId, {
      componentName,
      startTime: performance.now(),
      props: this.sanitizeProps(props)
    });

    return measureId;
  }

  static endMeasure(measureId) {
    if (!this.isEnabled || !measureId) return;

    const endTime = performance.now();
    performance.mark(`${measureId}-end`);
    
    try {
      performance.measure(
        `${measureId}-duration`,
        `${measureId}-start`,
        `${measureId}-end`
      );
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }

    const metric = this.metrics.get(measureId);
    if (metric) {
      const duration = endTime - metric.startTime;
      this.logPerformance(metric.componentName, duration, metric.props);
      this.metrics.delete(measureId);
    }
  }

  static logPerformance(componentName, duration, props) {
    if (duration > 16) {
      console.group(`🐌 Slow Component: ${componentName}`);
      console.log(`⏱️  Render time: ${duration.toFixed(2)}ms`);
      console.log('🔧 Props:', props);
      
      if (duration > 100) {
        console.error('❌ Critical performance issue!');
      } else if (duration > 50) {
        console.warn('⚠️  Performance warning');
      }
      
      console.groupEnd();
    }
  }

  static sanitizeProps(props) {
    const sanitized = {};
    
    Object.keys(props).forEach(key => {
      const value = props[key];
      
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          sanitized[key] = `[Array(${value.length})]`;
        } else {
          sanitized[key] = '[Object]';
        }
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  static generateReport() {
    if (!this.isEnabled) return null;

    const performanceEntries = performance.getEntriesByType('measure');
    const componentMetrics = performanceEntries
      .filter(entry => entry.name.includes('duration'))
      .map(entry => ({
        name: entry.name.replace('-duration', '').split('-')[0],
        duration: entry.duration
      }));

    const report = {
      timestamp: new Date().toISOString(),
      totalMeasurements: componentMetrics.length,
      slowComponents: componentMetrics
        .filter(metric => metric.duration > 16)
        .sort((a, b) => b.duration - a.duration),
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576)
      } : null
    };

    console.group('📊 Performance Report');
    console.table(report.slowComponents);
    console.log('Full report:', report);
    console.groupEnd();

    return report;
  }

  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }

  static measureComponentRender(componentName, renderTime) {
    if (renderTime > 16) {
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }
}

// Auto-initialize in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  PerformanceMonitor.init();
}

export default PerformanceMonitor;