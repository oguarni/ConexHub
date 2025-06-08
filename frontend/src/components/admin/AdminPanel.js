import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Users, Package, Check, AlertTriangle } from 'lucide-react';
import { categories } from '../../utils/constants';
import { apiService } from '../../services/api';

const AdminPanel = ({ 
  showAdmin, 
  setShowAdmin, 
  user, 
  productForm, 
  setProductForm, 
  editingProduct, 
  setEditingProduct, 
  handleProductSubmit, 
  products, 
  editProduct, 
  deleteProduct, 
  loading 
}) => {
  const [activeTab, setActiveTab] = useState('products');
  const [pendingSuppliers, setPendingSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'suppliers') {
      loadPendingSuppliers();
    }
  }, [activeTab]);

  if (!showAdmin || user?.role !== 'admin') return null;

  const loadPendingSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const data = await apiService.getPendingSuppliers();
      setPendingSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const approveSupplier = async (supplierId) => {
    try {
      await apiService.approveSupplier(supplierId);
      await loadPendingSuppliers();
      alert('Fornecedor aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar fornecedor:', error);
      alert('Erro ao aprovar fornecedor');
    }
  };

  const rejectSupplier = async (supplierId) => {
    try {
      await apiService.rejectSupplier(supplierId);
      await loadPendingSuppliers();
      alert('Fornecedor rejeitado');
    } catch (error) {
      console.error('Erro ao rejeitar fornecedor:', error);
      alert('Erro ao rejeitar fornecedor');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleProductSubmit();
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm({ 
      name: '', 
      category: 'Maquinário', 
      price: '', 
      unit: 'unidade', 
      description: '', 
      image: '📦',
      minQuantity: 1
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Painel Administrativo</h2>
            <button onClick={() => setShowAdmin(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'products' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package size={18} />
              <span>Produtos</span>
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeTab === 'suppliers' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={18} />
              <span>Aprovar Fornecedores</span>
              {pendingSuppliers.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingSuppliers.length}
                </span>
              )}
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Product Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-4">
                  {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
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
                      value={productForm.minQuantity || ''}
                      onChange={(e) => setProductForm({...productForm, minQuantity: parseInt(e.target.value) || 1})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Emoji do produto"
                      className="px-4 py-2 border rounded-lg"
                      value={productForm.image}
                      onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <textarea
                      placeholder="Descrição detalhada do produto"
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Adicionar')}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Products List */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Produto</th>
                      <th className="border p-2 text-left">Categoria</th>
                      <th className="border p-2 text-left">Preço</th>
                      <th className="border p-2 text-left">Qtd. Mín.</th>
                      <th className="border p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="border p-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{product.image}</span>
                            <div>
                              <div className="font-semibold">{product.name}</div>
                              <div className="text-sm text-gray-600">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border p-2">{product.category}</td>
                        <td className="border p-2">R$ {parseFloat(product.price).toFixed(2)}</td>
                        <td className="border p-2">{product.minQuantity || 1} {product.unit}</td>
                        <td className="border p-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users size={20} />
                <span>Fornecedores Pendentes de Aprovação</span>
              </h3>

              {suppliersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2">Carregando fornecedores...</p>
                </div>
              ) : pendingSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto mb-4 text-gray-400" size={64} />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor pendente</h4>
                  <p className="text-gray-500">Todos os fornecedores foram aprovados ou rejeitados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSuppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{supplier.companyName}</h4>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <AlertTriangle size={12} className="mr-1" />
                              Pendente
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Responsável:</strong> {supplier.name}</p>
                              <p><strong>Email:</strong> {supplier.email}</p>
                              <p><strong>CNPJ:</strong> {supplier.cnpj}</p>
                            </div>
                            <div>
                              <p><strong>Setor:</strong> {supplier.sector || 'Não informado'}</p>
                              <p><strong>Telefone:</strong> {supplier.phone}</p>
                              <p><strong>Cadastrado:</strong> {new Date(supplier.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          {supplier.address && (
                            <div className="mt-3">
                              <p className="text-sm"><strong>Endereço:</strong> {supplier.address}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => approveSupplier(supplier.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                          >
                            <Check size={16} />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => rejectSupplier(supplier.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                          >
                            <X size={16} />
                            <span>Rejeitar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;