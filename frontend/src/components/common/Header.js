import React from 'react';
import { FileText, User, Menu, X, Building, Package } from 'lucide-react';
import { useAppContext } from '../../contexts/AppProvider';

const Header = () => {
  const { 
    user, 
    uiState, 
    logout, 
    showModal, 
    toggleMenu,
    addNotification 
  } = useAppContext();

  const handleLogin = async () => {
    if (user) {
      console.log('Login button clicked'); // For debugging
      logout();
      addNotification({
        type: 'info',
        message: 'Logout realizado com sucesso'
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
          message: 'Dados populados com sucesso!'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao popular dados'
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
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={seedData}
                className="hover:text-blue-200 text-sm"
              >
                Popular DB
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
              <span className="hidden sm:inline text-sm">Cotações</span>
            </button>
            
            {user && (
              <button 
                onClick={() => showModal('showOrders')}
                className="relative bg-green-700 px-3 py-2 rounded-lg hover:bg-green-800 flex items-center space-x-2"
              >
                <Package size={18} />
                <span className="hidden sm:inline text-sm">Pedidos</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-blue-200">
                    {user.role === 'admin' ? 'Administrador' : 
                     user.role === 'buyer' ? 'Comprador' : 'Fornecedor'}
                  </div>
                </div>
                <button 
                  onClick={handleLogin}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center space-x-2"
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