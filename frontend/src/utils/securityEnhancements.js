
// utils/securityEnhancements.js
import DOMPurify from 'dompurify';

export class SecurityValidator {
  // Rate limiting client-side
  static requestLimiter = new Map();
  
  static checkRateLimit(endpoint, maxRequests = 10, timeWindow = 60000) {
    const now = Date.now();
    const key = endpoint;
    
    if (!this.requestLimiter.has(key)) {
      this.requestLimiter.set(key, []);
    }
    
    const requests = this.requestLimiter.get(key);
    const validRequests = requests.filter(time => now - time < timeWindow);
    
    if (validRequests.length >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    this.requestLimiter.set(key, validRequests);
  }

  // Input validation mais robusta
  static validateInput(value, type, options = {}) {
    if (!value && options.required) {
      throw new Error('Campo obrigatório');
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Email inválido');
        }
        break;
        
      case 'cnpj':
        if (!this.validateCNPJ(value)) {
          throw new Error('CNPJ inválido');
        }
        break;
        
      case 'price':
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          throw new Error('Preço inválido');
        }
        if (options.max && price > options.max) {
          throw new Error(`Preço máximo: ${options.max}`);
        }
        break;
        
      case 'text':
        if (options.maxLength && value.length > options.maxLength) {
          throw new Error(`Máximo ${options.maxLength} caracteres`);
        }
        break;
    }
    
    return true;
  }

  // CSP violations handling
  static handleCSPViolation(event) {
    console.error('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy
    });
    
    // Report to security service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/security/csp-violation', {
        method: 'POST',
        body: JSON.stringify({
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    }
  }
}
