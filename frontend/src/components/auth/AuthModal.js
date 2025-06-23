import React, { useState } from 'react';
import { X, User, Mail, Lock, Building } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';

const AuthModal = () => {
  const { login, register, loading, error } = useAuth();
  const { modals, hideModal, addNotification } = useUIStore();
  
  // Debug logging
  console.log('AuthModal render - showAuth:', modals.showAuth);
  console.log('AuthModal render - all modals:', modals);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    cnpj: '',
    role: 'buyer'
  });

  const [isLogin, setIsLogin] = useState(true);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      const success = await login(formData.email, formData.password);
      if (success) {
        hideModal('showAuth');
        addNotification({
          type: 'success',
          message: 'Login realizado com sucesso!'
        });
      }
    } else {
      // Register
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        role: formData.role
      });
      
      if (success) {
        hideModal('showAuth');
        addNotification({
          type: 'success',
          message: 'Conta criada com sucesso!'
        });
      }
    }
  };

  const closeModal = () => {
    hideModal('showAuth');
    setFormData({
      email: '',
      password: '',
      name: '',
      companyName: '',
      cnpj: '',
      role: 'buyer'
    });
  };

  if (!modals.showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="buyer">Comprador</option>
                    <option value="supplier">Fornecedor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Carregando...
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          {/* Switch between login/register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
            </button>
          </div>

          {/* Test accounts info */}
          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Contas de Teste Disponíveis:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Comprador:</strong> joao@empresa.com / buyer123</p>
                <p><strong>Fornecedor:</strong> carlos@fornecedor.com / supplier123</p>
                <p><strong>Admin:</strong> admin@b2bmarketplace.com / admin123</p>
              </div>
              <p className="text-xs text-blue-600 mt-2 italic">* Use as credenciais exatas como mostrado acima</p>
              <p className="text-xs text-green-600 mt-1">✅ API funcionando - containers online</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;