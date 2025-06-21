import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, DollarSign, ShoppingCart, 
  BarChart3, PieChart, Plus, Edit, Trash2, Eye,
  Star, Clock, CheckCircle, AlertTriangle, Users
} from 'lucide-react';
import { apiService } from '../../services/api';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend && (
          <p className={`text-sm flex items-center mt-1 ${
            trend.value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={14} className="mr-1" />
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.period}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const ChartContainer = ({ title, children, actions }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    {children}
  </div>
);

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => (
  <div className="bg-white rounded-lg shadow p-4 border">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{product.image || '📦'}</span>
        <div>
          <h4 className="font-semibold text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">{product.category}</p>
        </div>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onEdit(product)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Preço:</span>
        <span className="font-medium">R$ {parseFloat(product.price).toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Estoque:</span>
        <span className={`font-medium ${
          product.stock <= product.minQuantity ? 'text-red-600' : 'text-green-600'
        }`}>
          {product.stock || 0} {product.unit}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Status:</span>
        <button
          onClick={() => onToggleStatus(product.id, !product.isActive)}
          className={`px-2 py-1 text-xs rounded-full ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.isActive ? 'Ativo' : 'Inativo'}
        </button>
      </div>
    </div>
  </div>
);

const SupplierDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    unit: 'unidade',
    minQuantity: 1,
    stock: 0,
    image: '📦'
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, productsData] = await Promise.all([
        apiService.get('/analytics/supplier/dashboard'),
        apiService.get('/products/my-products')
      ]);

      setStats(dashboardData);
      setProducts(productsData.products || []);
      setRecentOrders(dashboardData.recentOrders || []);
      setMonthlyRevenue(dashboardData.monthlyRevenue || []);
      setTopProducts(dashboardData.topProducts || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiService.put(`/products/${editingProduct.id}`, productForm);
      } else {
        await apiService.post('/products', productForm);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: '',
        price: '',
        description: '',
        unit: 'unidade',
        minQuantity: 1,
        stock: 0,
        image: '📦'
      });
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      unit: product.unit,
      minQuantity: product.minQuantity,
      stock: product.stock || 0,
      image: product.image || '📦'
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await apiService.delete(`/products/${productId}`);
        loadDashboardData();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleToggleProductStatus = async (productId, isActive) => {
    try {
      await apiService.put(`/products/${productId}`, { isActive });
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      alert('Erro ao atualizar status do produto');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'products', label: 'Meus Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Fornecedor</h1>
        <p className="text-gray-600">Gerencie seus produtos e monitore suas vendas</p>
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
              icon={Package}
              title="Produtos Ativos"
              value={stats?.totalProducts || 0}
              subtitle="produtos cadastrados"
              color="blue"
            />
            <StatCard
              icon={ShoppingCart}
              title="Pedidos Totais"
              value={stats?.totalOrders || 0}
              subtitle="pedidos recebidos"
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title="Receita Total"
              value={`R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="receita acumulada"
              color="yellow"
            />
            <StatCard
              icon={Clock}
              title="Cotações Pendentes"
              value={stats?.pendingQuotes || 0}
              subtitle="aguardando resposta"
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Receita Mensal">
              <div className="space-y-2">
                {monthlyRevenue.slice(0, 6).map((data, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {new Date(data.month).toLocaleDateString('pt-BR', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      R$ {parseFloat(data.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </ChartContainer>

            <ChartContainer title="Produtos Mais Vendidos">
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{product.Product?.image || '📦'}</span>
                      <div>
                        <p className="text-sm font-medium">{product.Product?.name}</p>
                        <p className="text-xs text-gray-500">{product.totalSold} vendidos</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      R$ {parseFloat(product.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* Recent Orders */}
          <ChartContainer title="Pedidos Recentes">
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium">Pedido #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {order.User?.name} - {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {parseFloat(order.totalAmount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Meus Produtos</h2>
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Adicionar Produto</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleProductStatus}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-500 mb-4">Comece adicionando seus primeiros produtos</p>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Adicionar Primeiro Produto
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                  <select
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                  >
                    <option value="">Selecione a categoria</option>
                    <option value="Maquinário">Maquinário</option>
                    <option value="Materiais">Materiais</option>
                    <option value="Ferramentas">Ferramentas</option>
                    <option value="Equipamentos">Equipamentos</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unidade (kg, ton, m², etc.)"
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantidade mínima"
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.minQuantity}
                    onChange={(e) => setProductForm({...productForm, minQuantity: parseInt(e.target.value)})}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Estoque atual"
                    className="px-4 py-2 border rounded-lg"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Descrição detalhada do produto"
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  required
                />
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingProduct ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        category: '',
                        price: '',
                        description: '',
                        unit: 'unidade',
                        minQuantity: 1,
                        stock: 0,
                        image: '📦'
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;