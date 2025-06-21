// Fixed auth hook following SOLID principles
import { useState, useEffect, useCallback } from 'react';
import { validateCNPJ } from '../utils/validation';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Form validation
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
    
    if (!formData.role || !['buyer', 'supplier'].includes(formData.role)) {
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
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro na autenticação');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro de conexão com o servidor');
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

      // Client-side validation
      const errors = validateRegisterForm(userData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Por favor, corrija os campos destacados');
        return false;
      }

      // Format CNPJ before sending
      const formattedData = {
        ...userData,
        cnpj: userData.cnpj.replace(/\D/g, ''), // Remove formatting
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro no cadastro');
        
        // Map backend validation errors
        if (errorData.details) {
          setValidationErrors(errorData.details);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Erro de conexão com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validateRegisterForm]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Permission checking function that matches backend RBAC
  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    
    // Define role permissions (should match backend RBAC)
    const rolePermissions = {
      admin: [
        'users:read', 'users:write', 'users:delete',
        'suppliers:read', 'suppliers:write', 'suppliers:delete', 'suppliers:approve', 'suppliers:reject',
        'products:read', 'products:write', 'products:delete', 'products:approve',
        'orders:read', 'orders:write', 'orders:delete', 'orders:update_status',
        'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:respond',
        'analytics:read', 'reports:read',
        'system:read', 'system:write', 'config:read', 'config:write',
        'constants:read', 'constants:write'
      ],
      supplier: [
        'profile:read', 'profile:write',
        'products:read', 'products:write', 'products:delete_own',
        'orders:read_own', 'orders:update_status_own',
        'quotes:read_own', 'quotes:respond',
        'constants:read'
      ],
      buyer: [
        'profile:read', 'profile:write',
        'products:read',
        'orders:read_own', 'orders:write',
        'quotes:read_own', 'quotes:write', 'quotes:accept', 'quotes:reject',
        'constants:read'
      ]
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  return {
    user,
    loading,
    error,
    validationErrors,
    login,
    register,
    logout,
    validateCNPJ,
    hasPermission
  };
};