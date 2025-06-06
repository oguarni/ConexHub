import React from 'react';
import { FileText, User, Menu, X, Package, Settings, Building } from 'lucide-react';
import { useAppContext } from '../../contexts';
import { apiService } from '../../services/api';

const Header = () => {
  const { 
    uiState, 
    auth, 
    quotes,
    showModal, 
    hideModal, 
    toggleMenu, 
    closeMenu, 
    addNotification 
  } = useAppContext();

  const seedData = async () => {
    try {
      await apiService.seedDatabase();
      addNotification({
        type: 'success',
        title: 'Dados populados!',
        message: 'Banco de dados atualizado com produtos B2B'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao popular dados',
        message: 'Falha na operação'
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
              className="md:hidden focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded p-1 transition-colors hover:bg-blue-700"
              aria-label={uiState.isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={uiState.isMenuOpen}
            >
              {uiState.isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Building size={28} aria-hidden="true" />
              <div>
                <h1 className="text-xl font-bold">B2B Marketplace</h1>
                <p className="text-xs text-blue-200 hidden lg:block">Soluções Industriais</p>
              </div>
            </div>
          </div>
          
          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={seedData}
                className="hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1 transition-colors text-sm"
              >
                Popular DB
              </button>
            )}
            
            {auth.user?.role === 'admin' && (
              <button 
                onClick={() => showModal('showAdmin')}
                className="hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1 transition-colors flex items-center space-x-1"
              >
                <Settings size={16} />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => showModal('showQuotes')}
              className="relative bg-blue-700 px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
            >
              <FileText size={18} />
              <span className="hidden sm:inline text-sm">Cotações</span>
              {quotes.getTotalQuotes() > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
                  {quotes.getTotalQuotes()}
                </span>
              )}
            </button>

            {auth.user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">{auth.user.name}</div>
                  <div className="text-xs text-blue-200">
                    {auth.getUserDisplayInfo()?.roleLabel}
                  </div>
                </div>
                <button 
                  onClick={auth.logout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => showModal('showAuth')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <User size={18} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;