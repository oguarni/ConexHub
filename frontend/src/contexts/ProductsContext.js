// contexts/ProductsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useForm } from '../hooks/useForm';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const products = useProducts();
  const { auth } = useAuth();
  const { uiState, addNotification } = useUI();
  const [editingProduct, setEditingProduct] = useState(null);
  
  const productForm = useForm({ 
    name: '', 
    category: 'Maquinário', 
    price: '', 
    unit: 'unidade', 
    description: '', 
    image: '📦',
    minQuantity: 1
  });

  // Load products with filters when UI state changes
  useEffect(() => {
    const filters = {};
    if (uiState.selectedCategory !== 'Todas') filters.category = uiState.selectedCategory;
    if (uiState.searchTerm) filters.search = uiState.searchTerm;
    products.loadProducts(filters);
  }, [uiState.selectedCategory, uiState.searchTerm]);

  // Initial load
  useEffect(() => {
    products.loadProducts();
  }, []);

  const handleProductSubmit = async () => {
    if (!auth.hasPermission('manage_products')) {
      addNotification({
        type: 'error',
        title: 'Acesso negado',
        message: 'Você não tem permissão para gerenciar produtos'
      });
      return;
    }

    const success = editingProduct
      ? await products.updateProduct(editingProduct.id, productForm.form)
      : await products.createProduct(productForm.form);
    
    if (success) {
      setEditingProduct(null);
      productForm.resetForm();
      products.loadProducts();
      addNotification({
        type: 'success',
        title: editingProduct ? 'Produto atualizado!' : 'Produto criado!',
        message: 'Produto salvo com sucesso'
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar produto',
        message: products.error || 'Tente novamente'
      });
    }
  };

  const editProduct = (product) => {
    if (!auth.hasPermission('manage_products')) {
      addNotification({
        type: 'error',
        title: 'Acesso negado',
        message: 'Você não tem permissão para editar produtos'
      });
      return;
    }

    setEditingProduct(product);
    productForm.setForm({ ...product, price: product.price.toString() });
  };

  const handleDeleteProduct = async (productId) => {
    if (!auth.hasPermission('manage_products')) {
      addNotification({
        type: 'error',
        title: 'Acesso negado',
        message: 'Você não tem permissão para excluir produtos'
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const success = await products.deleteProduct(productId);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Produto excluído!',
          message: 'Produto removido com sucesso'
        });
      }
    }
  };

  const contextValue = {
    ...products,
    productForm,
    editingProduct,
    setEditingProduct,
    handleProductSubmit,
    editProduct,
    handleDeleteProduct
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext deve ser usado dentro de ProductsProvider');
  }
  return context;
};