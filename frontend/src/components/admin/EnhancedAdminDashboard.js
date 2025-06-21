import React, { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Activity, 
  BarChart3, PieChart, Calendar, AlertTriangle, CheckCircle,
  XCircle, Clock, Star, Eye, Edit, Trash2, Filter
} from 'lucide-react';
import { apiService } from '../../services/api';

const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% desde o mês passado
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const TableContainer = ({ title, children, actions }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    {children}
  </div>
);

const EnhancedAdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userRole: '',
    supplierVerified: '',
    productActive: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, orderStatsData, usersData, suppliersData, productsData] = await Promise.all([
        apiService.get('/analytics/admin/dashboard'),
        apiService.get('/analytics/admin/orders?period=30d'),
        apiService.get('/admin/users?limit=10'),
        apiService.get('/admin/suppliers?limit=10'),
        apiService.get('/admin/products?limit=10')
      ]);

      setStats(statsData);
      setOrderStats(orderStatsData.orderStats || []);
      setUsers(usersData.users || []);
      setSuppliers(suppliersData.suppliers || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      switch (action) {
        case 'update':
          await apiService.put(`/admin/users/${userId}`, data);
          break;
        case 'delete':
          if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            await apiService.delete(`/admin/users/${userId}`);
          }
          break;
      }
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert('Erro ao executar ação');
    }
  };

  const handleSupplierAction = async (supplierId, action, data = {}) => {
    try {
      switch (action) {
        case 'verify':
          await apiService.put(`/admin/suppliers/${supplierId}/verify`);
          break;
        case 'updateStatus':
          await apiService.put(`/admin/suppliers/${supplierId}/status`, data);
          break;
      }
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert('Erro ao executar ação');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'suppliers', label: 'Fornecedores', icon: Package },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'analytics', label: 'Análises', icon: PieChart }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Gerencie usuários, fornecedores e monitore o desempenho da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Total de Usuários"
              value={stats?.totalUsers || 0}
              color="blue"
            />
            <StatCard
              icon={Package}
              title="Fornecedores Ativos"
              value={stats?.activeSuppliers || 0}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Pedidos Este Mês"
              value={stats?.lastMonthOrders || 0}
              change={stats?.monthlyGrowth?.ordersGrowth}
              color="purple"
            />
            <StatCard
              icon={DollarSign}
              title="Receita Este Mês"
              value={`R$ ${(stats?.lastMonthRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              color="yellow"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Pedidos nos Últimos 30 Dias">
              <div className="space-y-2">
                {orderStats.slice(0, 10).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {new Date(stat.date).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{stat.count} pedidos</span>
                      <span className="text-sm text-green-600">
                        R$ {parseFloat(stat.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>

            <ChartContainer title="Estatísticas Rápidas">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium">Cotações Pendentes</span>
                  <span className="text-lg font-bold text-blue-600">{stats?.pendingQuotes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium">Produtos Totais</span>
                  <span className="text-lg font-bold text-green-600">{stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-sm font-medium">Fornecedores Totais</span>
                  <span className="text-lg font-bold text-purple-600">{stats?.totalSuppliers || 0}</span>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <TableContainer 
          title="Gerenciamento de Usuários"
          actions={[
            <button key="filter" className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          ]}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'supplier' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center space-x-1 ${
                        user.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span className="text-sm">{user.isActive ? 'Ativo' : 'Inativo'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'update', { isActive: !user.isActive })}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableContainer>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <TableContainer title="Gerenciamento de Fornecedores">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.companyName}</div>
                        <div className="text-sm text-gray-500">{supplier.cnpj}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.User?.name}</div>
                        <div className="text-sm text-gray-500">{supplier.User?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center space-x-1 ${
                        supplier.verified ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {supplier.verified ? <CheckCircle size={16} /> : <Clock size={16} />}
                        <span className="text-sm">{supplier.verified ? 'Verificado' : 'Pendente'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400" />
                        <span className="text-sm">{supplier.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!supplier.verified && (
                          <button
                            onClick={() => handleSupplierAction(supplier.id, 'verify')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableContainer>
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;