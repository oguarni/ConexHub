// services/authService.js
class SecureAuthService {
  constructor() {
    this.TOKEN_KEY = 'auth_token';
    this.USER_KEY = 'user_data';
  }

  // Usar sessionStorage em vez de localStorage para dados sensíveis
  setAuthData(token, user) {
    try {
      // Token em sessionStorage (mais seguro)
      sessionStorage.setItem(this.TOKEN_KEY, token);
      
      // Dados do usuário sem informações sensíveis
      const sanitizedUser = this.sanitizeUserData(user);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(sanitizedUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de auth:', error);
      return false;
    }
  }

  getAuthData() {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const userData = sessionStorage.getItem(this.USER_KEY);
      
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
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('token'); // Limpar dados antigos
    localStorage.removeItem('user');
  }

  sanitizeUserData(user) {
    // Remove dados sensíveis antes de armazenar
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