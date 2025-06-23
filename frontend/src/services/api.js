console.log('[API Service] Module loading started');
import axios from 'axios';
import { secureAuthService } from './authService';

// Use environment variable for API URL with fallback to relative path
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Error handler centralizado
class ApiErrorHandler {
  static handle(error) {
    const response = error.response;
    const data = response?.data;
    
    // Estrutura de erro padronizada
    const errorInfo = {
      status: response?.status || 500,
      code: data?.code || 'UNKNOWN_ERROR',
      message: data?.error || data?.message || 'Erro interno do servidor',
      details: data?.details || null,
      errors: data?.errors || null,
      timestamp: new Date().toISOString()
    };

    // Log detalhado para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 API Error');
      console.error('Status:', errorInfo.status);
      console.error('Message:', errorInfo.message);
      console.error('Details:', errorInfo.details);
      console.error('Full Error:', error);
      console.groupEnd();
    }

    // Tratamento específico por tipo de erro
    switch (errorInfo.status) {
      case 400:
        return this.handleValidationError(errorInfo);
      case 401:
        return this.handleAuthError(errorInfo);
      case 403:
        return this.handlePermissionError(errorInfo);
      case 404:
        return this.handleNotFoundError(errorInfo);
      case 409:
        return this.handleConflictError(errorInfo);
      case 422:
        return this.handleUnprocessableError(errorInfo);
      case 429:
        return this.handleRateLimitError(errorInfo);
      case 500:
      default:
        return this.handleServerError(errorInfo);
    }
  }

  static handleValidationError(errorInfo) {
    return {
      ...errorInfo,
      type: 'VALIDATION_ERROR',
      userMessage: 'Dados inválidos. Verifique os campos e tente novamente.',
      retryable: true
    };
  }

  static handleAuthError(errorInfo) {
    // Auto logout em caso de token inválido
    secureAuthService.clearAuthData();
    
    return {
      ...errorInfo,
      type: 'AUTH_ERROR',
      userMessage: 'Sessão expirada. Faça login novamente.',
      retryable: false,
      requiresAuth: true
    };
  }

  static handlePermissionError(errorInfo) {
    return {
      ...errorInfo,
      type: 'PERMISSION_ERROR',
      userMessage: 'Você não tem permissão para realizar esta ação.',
      retryable: false
    };
  }

  static handleNotFoundError(errorInfo) {
    return {
      ...errorInfo,
      type: 'NOT_FOUND_ERROR',
      userMessage: 'Recurso não encontrado.',
      retryable: false
    };
  }

  static handleConflictError(errorInfo) {
    return {
      ...errorInfo,
      type: 'CONFLICT_ERROR',
      userMessage: 'Recurso já existe ou conflito de dados.',
      retryable: false
    };
  }

  static handleUnprocessableError(errorInfo) {
    return {
      ...errorInfo,
      type: 'UNPROCESSABLE_ERROR',
      userMessage: 'Dados não podem ser processados.',
      retryable: true
    };
  }

  static handleRateLimitError(errorInfo) {
    return {
      ...errorInfo,
      type: 'RATE_LIMIT_ERROR',
      userMessage: 'Muitas tentativas. Aguarde alguns minutos.',
      retryable: true,
      retryAfter: 60000 // 1 minuto
    };
  }

  static handleServerError(errorInfo) {
    return {
      ...errorInfo,
      type: 'SERVER_ERROR',
      userMessage: 'Erro interno do servidor. Tente novamente em alguns instantes.',
      retryable: true
    };
  }
}

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Adicionar token de autenticação
        const { token } = secureAuthService.getAuthData();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log de requests em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Log de responses em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // Processar erro através do handler
        const processedError = ApiErrorHandler.handle(error);
        
        // Dispatch custom event for auth errors instead of forcing page refresh
        if (processedError.requiresAuth && window.location.pathname !== '/login') {
          // Dispatch a global event that components can listen for
          window.dispatchEvent(new CustomEvent('auth:error', {
            detail: {
              error: processedError,
              message: processedError.userMessage,
              timestamp: processedError.timestamp
            }
          }));
        }

        // Rejeitar com erro processado
        return Promise.reject(processedError);
      }
    );
  }

  // Método helper para retry automático
  async withRetry(apiCall, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // Não tentar novamente se não for retryable
        if (!error.retryable) {
          throw error;
        }

        // Se não for a última tentativa, aguardar
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // Auth methods
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error; // Erro já processado pelo interceptor
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        cnpj: userData.cnpj,
        companyName: userData.companyName,
        role: userData.role,
        address: userData.address,
        phone: userData.phone,
        sector: userData.sector
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Products methods com retry
  async getProducts(filters = {}) {
    console.log('API: Getting products with filters:', filters);
    return this.withRetry(async () => {
      const response = await this.api.get('/products', { params: filters });
      console.log('API: Products response:', response.data);
      return response.data;
    });
  }

  async createProduct(productData) {
    try {
      const response = await this.api.post('/products', {
        ...productData,
        minQuantity: productData.minQuantity || 1
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await this.api.put(`/products/${id}`, {
        ...productData,
        minQuantity: productData.minQuantity || 1
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const response = await this.api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Orders methods
  async createOrder(orderData) {
    try {
      const response = await this.api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders() {
    return this.withRetry(async () => {
      const response = await this.api.get('/orders/user');
      return response.data;
    });
  }

  async getSupplierOrders() {
    return this.withRetry(async () => {
      const response = await this.api.get('/orders/supplier');
      return response.data;
    });
  }

  async getOrders(filters = {}) {
    return this.withRetry(async () => {
      const response = await this.api.get('/orders', { params: filters });
      return response.data;
    });
  }

  async getOrder(orderId) {
    return this.withRetry(async () => {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data;
    });
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getOrderHistory(userId) {
    return this.withRetry(async () => {
      const response = await this.api.get(`/orders/history/${userId}`);
      return response.data;
    });
  }

  async getOrderAnalytics(period = '30d') {
    return this.withRetry(async () => {
      const response = await this.api.get(`/orders/analytics?period=${period}`);
      return response.data;
    });
  }

  async cancelOrder(id, reason) {
    try {
      const response = await this.api.put(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async processOrderPayment(orderId, paymentData) {
    try {
      const response = await this.api.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async convertQuoteToOrder(quoteId, orderData) {
    try {
      const response = await this.api.post(`/quotes/${quoteId}/convert`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Supplier approval methods
  async getPendingSuppliers() {
    return this.withRetry(async () => {
      const response = await this.api.get('/admin/suppliers/pending');
      return response.data;
    });
  }

  async approveSupplier(supplierId) {
    try {
      const response = await this.api.put(`/admin/suppliers/${supplierId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async rejectSupplier(supplierId) {
    try {
      const response = await this.api.put(`/admin/suppliers/${supplierId}/reject`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // --- Quote Management ---

  /**
   * Requests a new quote for a specific product.
   * Corresponds to: POST /api/quotes/request
   */
  async requestQuote(productId, quoteData) {
    return this.withRetry(async () => {
      // Transform the frontend form data into the backend's expected structure
      const payload = {
        productId,
        quantity: quoteData.quantity,
        // Combine multiple fields into the 'notes' field for the backend
        notes: `Urgency: ${quoteData.urgency}\nAddress: ${quoteData.deliveryAddress || 'N/A'}\n\nMessage: ${quoteData.message || ''}`.trim()
      };
      const response = await this.api.post('/quotes/request', payload);
      return response.data;
    });
  }

  /**
   * Fetches all quotes for the authenticated buyer, with optional filters.
   * Corresponds to: GET /api/quotes/buyer
   */
  async getBuyerQuotes(filters = {}) {
    return this.withRetry(async () => {
      const response = await this.api.get('/quotes/buyer', { params: filters });
      return response.data;
    });
  }

  /**
   * Fetches all quote requests for the authenticated supplier.
   * Corresponds to: GET /api/quotes/supplier
   */
  async getSupplierQuotes(filters = {}) {
    return this.withRetry(async () => {
        const response = await this.api.get('/quotes/supplier', { params: filters });
        return response.data;
    });
  }

  /**
   * Fetches a single quote by its ID.
   * Corresponds to: GET /api/quotes/:quoteId
   */
  async getQuote(quoteId) {
    return this.withRetry(async () => {
      const response = await this.api.get(`/quotes/${quoteId}`);
      return response.data;
    });
  }

  /**
   * Submits a response (e.g., price) to a quote request (for suppliers).
   * Corresponds to: POST /api/quotes/:quoteId/submit
   */
  async respondToQuote(quoteId, responseData) {
    return this.withRetry(async () => {
      const response = await this.api.post(`/quotes/${quoteId}/submit`, responseData);
      return response.data;
    });
  }

  /**
   * Accepts a quote (for buyers).
   * Corresponds to: POST /api/quotes/:quoteId/accept
   */
  async acceptQuote(quoteId, data = {}) {
    return this.withRetry(async () => {
      const response = await this.api.post(`/quotes/${quoteId}/accept`, data);
      return response.data;
    });
  }

  /**
   * Rejects a quote (for buyers).
   * Corresponds to: POST /api/quotes/:quoteId/reject
   */
  async rejectQuote(quoteId, reason = '') {
    return this.withRetry(async () => {
      const response = await this.api.post(`/quotes/${quoteId}/reject`, { reason });
      return response.data;
    });
  }

  // Legacy method for backward compatibility
  async getUserQuotes() {
    return this.getBuyerQuotes();
  }

  // Seed method
  async seedDatabase() {
    try {
      const response = await this.api.post('/seed');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    return this.withRetry(async () => {
      const response = await this.api.get('/health');
      return response.data;
    }, 1, 500);
  }

  // Constants methods for externalized data (requires authentication)
  async getSampleOrders(role = 'buyer') {
    try {
      return this.withRetry(async () => {
        const response = await this.api.get('/constants/sample-orders', { 
          params: { role } 
        });
        return response.data.data;
      });
    } catch (error) {
      // Return empty array if not authenticated or endpoint not available
      if (error.status === 401 || error.status === 404) {
        console.warn('Sample orders not available:', error.message);
        return [];
      }
      throw error;
    }
  }

  async getSampleProducts() {
    try {
      return this.withRetry(async () => {
        const response = await this.api.get('/constants/sample-products');
        return response.data.data;
      });
    } catch (error) {
      // Return empty array if not authenticated or endpoint not available
      if (error.status === 401 || error.status === 404) {
        console.warn('Sample products not available:', error.message);
        return [];
      }
      throw error;
    }
  }

  async getAppConstants() {
    try {
      return this.withRetry(async () => {
        const response = await this.api.get('/constants/app-constants');
        return response.data.data;
      });
    } catch (error) {
      // Return default constants if not available
      if (error.status === 401 || error.status === 404) {
        console.warn('App constants not available:', error.message);
        return {};
      }
      throw error;
    }
  }

  async getStaticContent() {
    try {
      return this.withRetry(async () => {
        const response = await this.api.get('/constants/static-content');
        return response.data.data;
      });
    } catch (error) {
      // Return empty object if not available
      if (error.status === 401 || error.status === 404) {
        console.warn('Static content not available:', error.message);
        return {};
      }
      throw error;
    }
  }

  async getShippingConfig() {
    try {
      return this.withRetry(async () => {
        const response = await this.api.get('/constants/shipping-zones');
        return response.data.data;
      });
    } catch (error) {
      // Return empty array if not available
      if (error.status === 401 || error.status === 404) {
        console.warn('Shipping config not available:', error.message);
        return [];
      }
      throw error;
    }
  }
}

const apiService = new ApiService();
console.log('[API Service] Module loaded, available methods:', Object.keys(apiService));

// Development only
if (process.env.NODE_ENV === 'development') {
  import('./mocks/ordersMock.js').then(({ mockOrderEndpoints }) => {
    mockOrderEndpoints(apiService);
  }).catch(error => {
    console.warn('Could not load order mocks:', error.message);
  });
}

export { apiService, ApiErrorHandler };