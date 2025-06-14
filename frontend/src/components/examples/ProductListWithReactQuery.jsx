import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  useProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation,
  useDeleteProductMutation
} from '../hooks/api/useProductsQuery';
import { queryClient } from '../config/queryClient';

// Product List Component using React Query
const ProductList = ({ filters = {} }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Use React Query hooks
  const { 
    data: products = [], 
    isLoading, 
    error, 
    refetch 
  } = useProductsQuery(filters, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();

  const handleCreateProduct = async (productData) => {
    try {
      await createProductMutation.mutateAsync(productData);
      // React Query automatically updates the cache
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await updateProductMutation.mutateAsync({ id, productData });
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProductMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Loading states
  const isCreating = createProductMutation.isPending;
  const isUpdating = updateProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <h3 className="text-error-800 font-semibold">Erro ao carregar produtos</h3>
        <p className="text-error-600 mt-1">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-secondary-900">
          Produtos ({products.length})
        </h1>
        <CreateProductButton 
          onCreateProduct={handleCreateProduct}
          isCreating={isCreating}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isEditing={editingProduct === product.id}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={() => setEditingProduct(product.id)}
            onCancelEdit={() => setEditingProduct(null)}
            onUpdate={(data) => handleUpdateProduct(product.id, data)}
            onDelete={() => handleDeleteProduct(product.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-secondary-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-secondary-600">
            Comece criando seu primeiro produto.
          </p>
        </div>
      )}
    </div>
  );
};

// Product Card Component with Tailwind styling
const ProductCard = ({ 
  product, 
  isEditing, 
  isUpdating, 
  isDeleting, 
  onEdit, 
  onCancelEdit, 
  onUpdate, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    description: product.description,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-secondary-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Preço
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-secondary-200 text-secondary-700 py-2 px-4 rounded-md hover:bg-secondary-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover border border-secondary-200 overflow-hidden transition-all duration-200 hover:scale-105">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="flex items-center justify-center text-4xl">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            '📦'
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-3">
        <h3 className="font-semibold text-lg text-secondary-900 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-2xl font-bold text-primary-600">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>

        {product.description && (
          <p className="text-secondary-600 text-sm line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Stock indicator */}
        {product.stock !== undefined && (
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              product.stock > 10 ? 'bg-success-500' :
              product.stock > 0 ? 'bg-warning-500' : 'bg-error-500'
            }`} />
            <span className="text-secondary-600">
              {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </span>
          </div>
        )}

        {/* Category */}
        {product.category && (
          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-error-600 text-white py-2 px-4 rounded-md hover:bg-error-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isDeleting ? '...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Product Button Component
const CreateProductButton = ({ onCreateProduct, isCreating }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateProduct(formData);
    setFormData({ name: '', price: '', description: '', category: '' });
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            Criar Novo Produto
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Preço *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Categoria *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isCreating ? 'Criando...' : 'Criar Produto'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-secondary-200 text-secondary-700 py-2 px-4 rounded-md hover:bg-secondary-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
    >
      <span>+</span>
      <span>Novo Produto</span>
    </button>
  );
};

// Main App wrapper with React Query Provider
const ProductListApp = () => {
  const [filters, setFilters] = useState({});

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-secondary-50">
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar produtos..."
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <select
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as categorias</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Ferramentas">Ferramentas</option>
                <option value="Materiais">Materiais</option>
              </select>
            </div>
          </div>

          {/* Product List */}
          <ProductList filters={filters} />
        </div>
      </div>

      {/* React Query DevTools (only in development) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default ProductListApp;