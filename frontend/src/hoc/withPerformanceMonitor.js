import React, { memo, useEffect, useRef } from 'react';

/**
 * HOC for monitoring React component performance
 * Tracks render times and re-render frequency
 * Only active in development mode
 */
const withPerformanceMonitor = (WrappedComponent, componentName) => {
  const MonitoredComponent = memo((props) => {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(Date.now());
    const mountTimeRef = useRef(Date.now());
    
    // Only monitor in development
    if (process.env.NODE_ENV === 'development') {
      renderCountRef.current += 1;
      const now = Date.now();
      const renderTime = now - lastRenderTimeRef.current;
      lastRenderTimeRef.current = now;
      
      // Log performance metrics
      if (renderCountRef.current > 1) {
        console.group(`🔍 Performance Monitor: ${componentName || WrappedComponent.displayName || WrappedComponent.name}`);
        console.log(`📊 Render #${renderCountRef.current}`);
        console.log(`⏱️  Time since last render: ${renderTime}ms`);
        console.log(`🕒 Total time since mount: ${now - mountTimeRef.current}ms`);
        
        // Warn about frequent re-renders
        if (renderTime < 16) { // Less than one frame (60fps)
          console.warn('⚠️  Frequent re-renders detected! Consider optimization.');
        }
        
        // Log props changes (shallow comparison)
        console.log('🔧 Current props:', props);
        console.groupEnd();
      }
    }
    
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName || WrappedComponent.displayName || WrappedComponent.name} mounted`);
        
        return () => {
          const totalTime = Date.now() - mountTimeRef.current;
          console.log(`🔻 ${componentName || WrappedComponent.displayName || WrappedComponent.name} unmounted`);
          console.log(`📈 Total renders: ${renderCountRef.current}, Total lifetime: ${totalTime}ms`);
        };
      }
    }, []);
    
    return <WrappedComponent {...props} />;
  });
  
  MonitoredComponent.displayName = `withPerformanceMonitor(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MonitoredComponent;
};

export default withPerformanceMonitor;