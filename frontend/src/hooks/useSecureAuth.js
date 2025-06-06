// hooks/useSecureAuth.js
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { secureAuthService } from '../services/authService';
import { USER_ROLES } from '../utils/constants';
import { validateCNPJ, formatCNPJ } from '../utils/validation';

export const useSecureAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Inicializar estado do usuário
  useEffect(() => {
    const initializeAuth = () => {
      if (secureAuthService.validateSession()) {
        const { user } = secureAuthService.getAuthData();
        setUser(user);
      }
    };

    initializeAuth();
  }, []);

  // Validação de formulário
  const validateRegisterForm = useCallback((formData) => {
    const errors = {};

    if (!formData.name?.trim()) errors.name = 'Nome é obrigatório';
    
    if (!formData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.cnpj?.trim()) {
      errors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.cnpj)) {
      errors.cnpj = 'CNPJ inválido';
    }
    
    if (!formData.companyName?.trim()) {
      errors.companyName = 'Razão social é obrigatória';
    }
    
    if (!formData.role || !Object.values(USER_ROLES).includes(formData.role)) {
      errors.role = 'Tipo de usuário é obrigatório';
    }
    
    if (!formData.address?.trim()) errors.address = 'Endereço é obrigatório';
    if (!formData.phone?.trim()) errors.phone = 'Telefone é obrigatório';

    return errors;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});

      if (!email?.trim() || !password?.trim()) {
        setError('Email e senha são obrigatórios');
        return false;
      }
      
      const data = await apiService.login(email, password);
      
      const success = secureAuthService.setAuthData(data.token, data.user);
      if (!success) {
        setError('Erro ao salvar sessão');
        return false;
      }
      
      setUser(data.user);
      return true;
    } catch (error) {
      // Usar a mensagem user-friendly do error handler
      const message = error.userMessage || error.message || 'Erro na autenticação';
      setError(message);
      
      // Se houver erros de validação específicos
      if (error.errors) {
        const mappedErrors = {};
        error.errors.forEach(err => {
          mappedErrors[err.field] = err.message;
        });
        setValidationErrors(mappedErrors);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});

      // Validação client-side
      const errors = validateRegisterForm(userData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Por favor, corrija os campos destacados');
        return false;
      }

      const formattedData = {
        ...userData,
        cnpj: userData.cnpj.replace(/\D/g, ''),
      };
      
      const data = await apiService.register(formattedData);
      
      const success = secureAuthService.setAuthData(data.token, data.user);
      if (!success) {
        setError('Erro ao salvar sessão');
        return false;
      }
      
      setUser(data.user);
      return true;
    } catch (error) {
      // Usar a mensagem user-friendly do error handler
      const message = error.userMessage || error.message || 'Erro no cadastro';
      setError(message);
      
      // Mapear erros de validação do backend
      if (error.errors) {
        const mappedErrors = {};
        error.errors.forEach(err => {
          mappedErrors[err.field] = err.message;
        });
        setValidationErrors(mappedErrors);
      } else if (error.details) {
        setValidationErrors(error.details);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [validateRegisterForm]);

  const logout = useCallback(() => {
    secureAuthService.clearAuthData();
    setUser(null);
    setError('');
    setValidationErrors({});
  }, []);

  const clearError = useCallback(() => {
    setError('');
    setValidationErrors({});
  }, []);

  // Helpers de permissão
  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const permissions = {
      admin: () => hasRole(USER_ROLES.ADMIN),
      buy: () => hasRole(USER_ROLES.BUYER) || hasRole(USER_ROLES.ADMIN),
      sell: () => hasRole(USER_ROLES.SUPPLIER) || hasRole(USER_ROLES.ADMIN),
      manage_products: () => hasRole(USER_ROLES.SUPPLIER) || hasRole(USER_ROLES.ADMIN),
    };

    return permissions[permission]?.() || false;
  }, [user, hasRole]);

  const getUserDisplayInfo = useCallback(() => {
    if (!user) return null;
    
    const roleLabels = {
      [USER_ROLES.ADMIN]: 'Administrador',
      [USER_ROLES.BUYER]: 'Comprador',
      [USER_ROLES.SUPPLIER]: 'Fornecedor'
    };

    return {
      name: user.name,
      company: user.companyName,
      role: user.role,
      roleLabel: roleLabels[user.role] || user.role,
      cnpj: user.cnpj ? formatCNPJ(user.cnpj) : '',
      email: user.email
    };
  }, [user]);

  return {
    user,
    loading,
    error,
    validationErrors,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasPermission,
    getUserDisplayInfo,
  };
};