import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Validação de CNPJ
const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Valida 1º dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) return false;

  // Valida 2º dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  return resultado == digitos.charAt(1);
};

// Formatação de CNPJ
const formatCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        logout();
      }
    }
  }, []);

  const validateRegisterForm = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

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

    if (!formData.address?.trim()) {
      errors.address = 'Endereço é obrigatório';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Telefone é obrigatório';
    }

    return errors;
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});

      if (!email?.trim() || !password?.trim()) {
        setError('Email e senha são obrigatórios');
        return false;
      }
      
      const data = await apiService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Erro na autenticação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});

      // Validação do formulário
      const errors = validateRegisterForm(userData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Por favor, corrija os campos destacados');
        return false;
      }

      // Formatar CNPJ antes de enviar
      const formattedData = {
        ...userData,
        cnpj: userData.cnpj.replace(/\D/g, ''), // Remove formatação
      };
      
      const data = await apiService.register(formattedData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro no cadastro';
      setError(errorMessage);
      
      // Se for erro de validação do backend, mapear para campos específicos
      if (error.response?.data?.details) {
        setValidationErrors(error.response.data.details);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError('');
    setValidationErrors({});
  };

  const clearError = () => {
    setError('');
    setValidationErrors({});
  };

  const isAdmin = () => user?.role === 'admin';
  const isBuyer = () => user?.role === 'buyer';
  const isSupplier = () => user?.role === 'supplier';

  const hasPermission = (permission) => {
    if (!user) return false;
    
    switch (permission) {
      case 'admin':
        return isAdmin();
      case 'buy':
        return isBuyer() || isAdmin();
      case 'sell':
        return isSupplier() || isAdmin();
      case 'manage_products':
        return isSupplier() || isAdmin();
      default:
        return false;
    }
  };

  const getUserDisplayInfo = () => {
    if (!user) return null;
    
    return {
      name: user.name,
      company: user.companyName,
      role: user.role,
      roleLabel: {
        admin: 'Administrador',
        buyer: 'Comprador',
        supplier: 'Fornecedor'
      }[user.role] || user.role,
      cnpj: user.cnpj ? formatCNPJ(user.cnpj) : '',
      email: user.email
    };
  };

  return {
    user,
    loading,
    error,
    validationErrors,
    login,
    register,
    logout,
    clearError,
    isAdmin,
    isBuyer,
    isSupplier,
    hasPermission,
    getUserDisplayInfo,
    formatCNPJ,
    validateCNPJ
  };
};