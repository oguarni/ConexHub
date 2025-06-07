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

  return {
    user,
    loading,
    error,
    validationErrors,
    login,
    register,
    logout,
    validateCNPJ
  };
};

// AuthModal component
import React, { useState } from 'react';
import { X, Building, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    cnpj: '',
    companyName: '',
    role: 'buyer',
    address: '',
    phone: '',
    sector: ''
  });

  const { login, register, loading, error, validationErrors } = useAuth();

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setAuthForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let success = false;
    if (isLogin) {
      success = await login(authForm.email, authForm.password);
    } else {
      success = await register(authForm);
    }
    
    if (success) {
      onSuccess?.();
      onClose();
      // Reset form
      setAuthForm({
        name: '',
        email: '',
        password: '',
        cnpj: '',
        companyName: '',
        role: 'buyer',
        address: '',
        phone: '',
        sector: ''
      });
    }
  };

  const InputField = ({ field, type = 'text', placeholder, required, maxLength, as = 'input', rows }) => {
    const Component = as;
    return (
      <div>
        <Component
          type={type}
          value={authForm[field]}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          rows={rows}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors[field] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Building className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">
              {isLogin ? 'Login Empresarial' : 'Cadastro de Empresa'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <>
              <InputField 
                field="name" 
                placeholder="Nome do responsável" 
                required 
              />
              
              <InputField 
                field="companyName" 
                placeholder="Razão social da empresa" 
                required 
              />
              
              <InputField 
                field="cnpj" 
                placeholder="CNPJ (apenas números)" 
                maxLength={18}
                required 
              />

              <InputField 
                field="sector" 
                placeholder="Setor de atuação" 
                required 
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de conta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    authForm.role === 'buyer' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={authForm.role === 'buyer'}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <ShoppingCart className="mx-auto mb-2 text-blue-600" size={32} />
                      <div className="font-medium">Comprador</div>
                      <div className="text-xs text-gray-600">Busca produtos</div>
                    </div>
                  </label>

                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    authForm.role === 'supplier' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="supplier"
                      checked={authForm.role === 'supplier'}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <Users className="mx-auto mb-2 text-green-600" size={32} />
                      <div className="font-medium">Fornecedor</div>
                      <div className="text-xs text-gray-600">Vende produtos</div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
          
          <InputField 
            field="email" 
            type="email"
            placeholder="Email empresarial" 
            required 
          />
          
          <InputField 
            field="password" 
            type="password"
            placeholder={isLogin ? "Senha" : "Senha (mín. 6 caracteres)"} 
            required 
          />
          
          {!isLogin && (
            <>
              <InputField 
                field="phone" 
                placeholder="Telefone empresarial" 
                maxLength={15}
                required 
              />

              <InputField 
                field="address" 
                placeholder="Endereço completo da empresa" 
                as="textarea"
                rows={3}
                required 
              />
            </>
          )}
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin inline-block w-5 h-5 border-b-2 border-white mr-2"></div>
                Processando...
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Cadastrar Empresa'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center pb-6">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 ml-1 hover:underline font-medium"
            >
              {isLogin ? 'Cadastre sua empresa' : 'Faça login'}
            </button>
          </p>
        </div>
        
        {isLogin && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg mx-6 mb-6">
            <p className="text-xs text-gray-600 text-center">
              <strong>Contas demo:</strong><br />
              Admin: admin@b2bmarketplace.com / 123456<br />
              Comprador: joao@empresa.com / 123456
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;