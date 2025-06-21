import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, User, Menu, X, Building, Package, Globe, HelpCircle } from 'lucide-react';
import { useLegacyAppContext } from "../../contexts/AppProvider";
import { useLanguage } from '../../contexts/LanguageContext';
import QuotationButton from '../quotation/QuotationButton';

const Header = () => {
  const location = useLocation();
  const { 
    user, 
    uiState, 
    logout, 
    showModal, 
    toggleMenu,
    addNotification 
  } = useLegacyAppContext();
  
  const { t, language, changeLanguage, availableLanguages } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async () => {
    if (user) {
      console.log('Login button clicked'); // For debugging
      logout();
      addNotification({
        type: 'info',
        message: t('logoutSuccess') || 'Logout realizado com sucesso'
      });
    } else {
      showModal('showAuth');
    }
  };

  const seedData = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (response.ok) {
        addNotification({
          type: 'success',
          message: t('seedSuccess') || 'Dados populados com sucesso!'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('seedError') || 'Erro ao popular dados'
      });
    }
  };

  return (
    <header className="bg-green-600 text-white sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Menu Mobile */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleMenu}
              className="md:hidden"
              aria-label={uiState.isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {uiState.isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <Building size={28} />
              <div>
                <h1 className="text-xl font-bold">ConexHub</h1>
                <p className="text-xs text-green-200 hidden lg:block">{t('industrialSolutions') || 'Soluções Industriais'}</p>
              </div>
            </Link>
          </div>
          
          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/products"
              className={`hover:text-blue-200 text-sm ${(location.pathname === '/' || location.pathname === '/products') ? 'border-b-2 border-white' : ''}`}
            >
              {t('products')}
            </Link>
            
            <Link 
              to="/about"
              className={`hover:text-blue-200 text-sm ${location.pathname === '/about' ? 'border-b-2 border-white' : ''}`}
            >
              {t('about')}
            </Link>
            
            {/* Language Switcher */}
            <div className="relative group">
              <button className="hover:text-blue-200 flex items-center space-x-1">
                <Globe size={16} />
                <span className="text-xs">{availableLanguages.find(lang => lang.code === language)?.flag}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      language === lang.code ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={seedData}
                className="hover:text-blue-200 text-xs"
              >
                Seed DB
              </button>
            )}
            
            {user?.role === 'admin' && (
              <button 
                onClick={() => showModal('showAdmin')}
                className="hover:text-blue-200 flex items-center space-x-1"
              >
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            {/* Help Button */}
            {!user && (
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="relative bg-green-700 px-2 py-2 rounded-lg hover:bg-green-800"
                title="Ajuda para login demo"
              >
                <HelpCircle size={20} className="text-white" />
              </button>
            )}

            {/* Quotation Button */}
            <div className="bg-green-700 px-2 py-2 rounded-lg hover:bg-green-800">
              <QuotationButton />
            </div>
            
            {user && (
              <button 
                onClick={() => showModal('showOrders')}
                className="relative bg-green-700 px-3 py-2 rounded-lg hover:bg-green-800 flex items-center space-x-2"
              >
                <Package size={18} />
                <span className="hidden sm:inline text-sm">{t('orders')}</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-blue-200">
                    {user.role === 'admin' ? t('admin') || 'Administrador' : 
                     user.role === 'buyer' ? t('buyer') : t('supplier')}
                  </div>
                </div>
                <button 
                  onClick={handleLogin}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center space-x-2"
              >
                <User size={18} />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Demo Login</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Use uma das credenciais abaixo para testar o sistema:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">👤 Comprador</div>
                    <div className="text-sm text-blue-700">buyer@demo.com</div>
                    <div className="text-sm text-blue-700">Senha: demo123</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">🏭 Fornecedor</div>
                    <div className="text-sm text-green-700">supplier@demo.com</div>
                    <div className="text-sm text-green-700">Senha: demo123</div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">⚙️ Admin</div>
                    <div className="text-sm text-purple-700">admin@demo.com</div>
                    <div className="text-sm text-purple-700">Senha: demo123</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600">
                    💡 Cada usuário tem funcionalidades diferentes. Teste todos para ver as diferentes perspectivas!
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;