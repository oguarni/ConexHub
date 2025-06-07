// services/authService.js
class SecureAuthService {
  constructor() {
    this.TOKEN_KEY = 'token';
    this.USER_KEY = 'user_data';
  }

  // Use localStorage for persistent auth data
  setAuthData(token, user) {
    try {
      // Sanitize user data before storing
      const sanitizedUser = this.sanitizeUserData(user);
      
      // Store in localStorage for persistence across browser sessions
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(sanitizedUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de auth:', error);
      return false;
    }
  }

  getAuthData() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      return {
        token,
        user: userData ? JSON.parse(userData) : null
      };
    } catch (error) {
      console.error('Erro ao recuperar dados de auth:', error);
      this.clearAuthData();
      return { token: null, user: null };
    }
  }

  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Also clear any legacy keys
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  sanitizeUserData(user) {
    // Remove sensitive data before storing
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  validateSession() {
    const { token, user } = this.getAuthData();
    
    if (!token || !user || this.isTokenExpired(token)) {
      this.clearAuthData();
      return false;
    }
    
    return true;
  }
}

export const secureAuthService = new SecureAuthService();