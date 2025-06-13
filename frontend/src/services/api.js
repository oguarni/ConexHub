import axios from 'axios';
import { secureAuthService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006/api';

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
        
        // Auto-redirect para login se necessário
        if (processedError.requiresAuth && window.location.pathname !== '/login') {
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
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

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.api.put(`/orders/${orderId}/status`, { status });
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

  // Quote methods
  async requestQuote(productId, quoteData) {
    try {
      const response = await this.api.post('/quotes/request', {
        productId,
        quantity: quoteData.quantity,
        notes: `${quoteData.message || ''}\n\nUrgência: ${quoteData.urgency}\nEndereço: ${quoteData.deliveryAddress || ''}\nEspecificações: ${quoteData.specifications || ''}`.trim()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createQuote(quoteData) {
    try {
      const response = await this.api.post('/quotes', quoteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserQuotes() {
    return this.withRetry(async () => {
      const response = await this.api.get('/quotes/user');
      return response.data;
    });
  }

  async getSupplierQuotes() {
    return this.withRetry(async () => {
      const response = await this.api.get('/quotes/supplier');
      return response.data;
    });
  }

  async respondQuote(quoteId, response) {
    try {
      const res = await this.api.put(`/quotes/${quoteId}/respond`, response);
      return res.data;
    } catch (error) {
      throw error;
    }
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
}

export const apiService = new ApiService();
export { ApiErrorHandler };