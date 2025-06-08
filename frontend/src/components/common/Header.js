import React from 'react';
import { FileText, User, Menu, X, Building, Package, Globe } from 'lucide-react';
import { useAppContext } from '../../contexts/AppProvider';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = ({ currentPage, setCurrentPage }) => {
  const { 
    user, 
    uiState, 
    logout, 
    showModal, 
    toggleMenu,
    addNotification 
  } = useAppContext();
  
  const { t, language, changeLanguage, availableLanguages } = useLanguage();

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
    <header className="bg-blue-600 text-white sticky top-0 z-40 shadow-md">
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
            
            <div className="flex items-center space-x-2">
              <Building size={28} />
              <div>
                <h1 className="text-xl font-bold">B2B Marketplace</h1>
                <p className="text-xs text-blue-200 hidden lg:block">Soluções Industriais</p>
              </div>
            </div>
          </div>
          
          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentPage && setCurrentPage('products')}
              className={`hover:text-blue-200 text-sm ${currentPage === 'products' ? 'border-b-2 border-white' : ''}`}
            >
              {t('products')}
            </button>
            
            <button 
              onClick={() => setCurrentPage && setCurrentPage('about')}
              className={`hover:text-blue-200 text-sm ${currentPage === 'about' ? 'border-b-2 border-white' : ''}`}
            >
              {t('about')}
            </button>
            
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
            <button 
              onClick={() => showModal('showQuotes')}
              className="relative bg-blue-700 px-3 py-2 rounded-lg hover:bg-blue-800 flex items-center space-x-2"
            >
              <FileText size={18} />
              <span className="hidden sm:inline text-sm">{t('quotes')}</span>
            </button>
            
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
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center space-x-2"
              >
                <User size={18} />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;