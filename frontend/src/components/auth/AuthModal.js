import React from 'react';
import { X, Building, Users, ShoppingCart } from 'lucide-react';
import { formatCNPJ } from '../../utils/validation';
import ErrorHandler from '../common/ErrorHandler';

const AuthModal = ({ 
  showAuth, 
  setShowAuth, 
  isLogin, 
  setIsLogin, 
  authForm, 
  setAuthForm, 
  handleAuth, 
  loading,
  error
}) => {
  if (!showAuth) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  const handleFieldChange = (field, value) => {
    if (field === 'cnpj') {
      value = formatCNPJ(value);
    } else if (field === 'phone') {
      value = value.replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
    
    setAuthForm({...authForm, [field]: value});
  };

  const InputField = ({ 
    field, 
    type = 'text', 
    placeholder, 
    required = false,
    maxLength,
    as = 'input',
    rows 
  }) => {
    const Component = as;
    return (
      <Component
        type={type}
        placeholder={`${placeholder}${required ? ' *' : ''}`}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        value={authForm[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        maxLength={maxLength}
        rows={rows}
        required={required}
        aria-label={placeholder}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-backdrop">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative max-h-screen overflow-y-auto fade-in">
        <button 
          onClick={() => setShowAuth(false)} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-6">
          <Building className="mx-auto mb-2 text-blue-600" size={48} />
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Acesso B2B' : 'Cadastro Empresarial'}
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            {isLogin ? 'Entre com suas credenciais' : 'Registre sua empresa no marketplace'}
          </p>
        </div>

        {error && (
          <ErrorHandler 
            error={error} 
            className="mb-4"
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <InputField 
                field="name" 
                placeholder="Nome do responsável" 
                required 
              />

              <InputField 
                field="companyName" 
                placeholder="Razão Social da Empresa" 
                required 
              />

              <InputField 
                field="cnpj" 
                placeholder="CNPJ" 
                maxLength={18}
                required 
              />

              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={authForm.sector || ''}
                onChange={(e) => handleFieldChange('sector', e.target.value)}
                required
                aria-label="Setor industrial"
              >
                <option value="">Selecione o setor industrial *</option>
                <option value="metalurgia">Metalurgia</option>
                <option value="automotivo">Automotivo</option>
                <option value="petrochemical">Petroquímico</option>
                <option value="alimenticio">Alimentício</option>
                <option value="textil">Têxtil</option>
                <option value="construcao">Construção Civil</option>
                <option value="eletroeletronico">Eletroeletrônico</option>
                <option value="farmaceutico">Farmacêutico</option>
                <option value="papel">Papel e Celulose</option>
                <option value="outros">Outros</option>
              </select>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tipo de empresa *</p>
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
        
        <div className="mt-6 text-center">
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
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Conta demo:</strong><br />
              Admin: admin@b2bmarketplace.com / 123456<br />
              Comprador: buyer@empresa.com / 123456<br />
              Fornecedor: supplier@empresa.com / 123456
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;