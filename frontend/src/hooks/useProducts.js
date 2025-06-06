import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleError, handleSuccess } = useErrorHandler();
  
  // Cache para evitar requisições desnecessárias
  const cacheRef = useRef({
    data: null,
    timestamp: null,
    filters: null
  });
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // ✅ Verificar se cache é válido
  const isCacheValid = useCallback((filters = {}) => {
    const cache = cacheRef.current;
    if (!cache.data || !cache.timestamp) return false;
    
    const isExpired = Date.now() - cache.timestamp > CACHE_DURATION;
    if (isExpired) return false;
    
    // Verificar se filtros são iguais
    const filtersMatch = JSON.stringify(cache.filters) === JSON.stringify(filters);
    return filtersMatch;
  }, []);

  // ✅ Atualizar cache
  const updateCache = useCallback((data, filters = {}) => {
    cacheRef.current = {
      data,
      timestamp: Date.now(),
      filters
    };
  }, []);

  // ✅ FIX: useCallback com cache inteligente
  const loadProducts = useCallback(async (filters = {}) => {
    // Verificar cache primeiro
    if (isCacheValid(filters)) {
      setProducts(cacheRef.current.data);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.getProducts(filters);
      const productList = data.products || [];
      
      setProducts(productList);
      updateCache(productList, filters);
      
    } catch (error) {
      const errorMessage = 'Erro ao carregar produtos';
      setError(errorMessage);
      handleError(error, 'loadProducts');
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, updateCache, handleError]);

  // ✅ FIX: Memoização otimizada com validação completa
  const memoizedProducts = useMemo(() => {
    return products.filter(product => 
      product && 
      typeof product === 'object' && 
      product.id && 
      product.name
    );
  }, [products]);

  // ✅ FIX: Criar produto com invalidação de cache
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError('');
      
      // Validação robusta
      const validation = validateProductData(productData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      const data = await apiService.createProduct(productData);
      
      // Atualizar estado local imediatamente
      const newProduct = data.product;
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      // Invalidar cache
      cacheRef.current = { data: null, timestamp: null, filters: null };
      
      handleSuccess('Produto criado com sucesso!');
      return { success: true, product: newProduct };
      
    } catch (error) {
      const errorMessage = 'Erro ao criar produto';
      setError(errorMessage);
      handleError(error, 'createProduct');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // ✅ FIX: Atualizar produto com otimistic update
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError('');
      
      // Validação
      if (!id) throw new Error('ID do produto é obrigatório');
      
      const validation = validateProductData(productData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      // Optimistic update
      const oldProducts = [...products];
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? { ...product, ...productData } : product
        )
      );
      
      try {
        const data = await apiService.updateProduct(id, productData);
        
        // Update with server response
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? { ...product, ...data.product } : product
          )
        );
        
        // Invalidar cache
        cacheRef.current = { data: null, timestamp: null, filters: null };
        
        handleSuccess('Produto atualizado com sucesso!');
        return { success: true, product: data.product };
        
      } catch (error) {
        // Rollback on error
        setProducts(oldProducts);
        throw error;
      }
      
    } catch (error) {
      const errorMessage = 'Erro ao atualizar produto';
      setError(errorMessage);
      handleError(error, 'updateProduct');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [products, handleError, handleSuccess]);

  // ✅ FIX: Deletar com confirmação e rollback
  const deleteProduct = useCallback(async (id, options = {}) => {
    try {
      setLoading(true);
      setError('');
      
      if (!id) throw new Error('ID do produto é obrigatório');
      
      // Confirmação opcional
      if (options.requireConfirmation !== false) {
        const confirmed = window.confirm('Tem certeza que deseja excluir este produto?');
        if (!confirmed) {
          return { success: false, cancelled: true };
        }
      }
      
      // Optimistic delete
      const oldProducts = [...products];
      const productToDelete = products.find(p => p.id === id);
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== id)
      );
      
      try {
        await apiService.deleteProduct(id);
        
        // Invalidar cache
        cacheRef.current = { data: null, timestamp: null, filters: null };
        
        handleSuccess(`Produto "${productToDelete?.name || id}" excluído com sucesso!`);
        return { success: true };
        
      } catch (error) {
        // Rollback on error
        setProducts(oldProducts);
        throw error;
      }
      
    } catch (error) {
      const errorMessage = 'Erro ao deletar produto';
      setError(errorMessage);
      handleError(error, 'deleteProduct');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [products, handleError, handleSuccess]);

  // ✅ Função de validação
  const validateProductData = useCallback((productData) => {
    if (!productData) {
      return { isValid: false, error: 'Dados do produto são obrigatórios' };
    }
    
    if (!productData.name?.trim()) {
      return { isValid: false, error: 'Nome do produto é obrigatório' };
    }
    
    if (!productData.price || isNaN(parseFloat(productData.price))) {
      return { isValid: false, error: 'Preço deve ser um número válido' };
    }
    
    if (parseFloat(productData.price) <= 0) {
      return { isValid: false, error: 'Preço deve ser maior que zero' };
    }
    
    if (!productData.category?.trim()) {
      return { isValid: false, error: 'Categoria é obrigatória' };
    }
    
    return { isValid: true };
  }, []);

  // ✅ Outros métodos otimizados
  const getProductById = useCallback((id) => {
    return memoizedProducts.find(product => product.id === id) || null;
  }, [memoizedProducts]);

  const filterProducts = useCallback((filters) => {
    return memoizedProducts.filter(product => {
      if (filters.category && filters.category !== 'Todas' && product.category !== filters.category) {
        return false;
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.minPrice && parseFloat(product.price) < parseFloat(filters.minPrice)) {
        return false;
      }
      
      if (filters.maxPrice && parseFloat(product.price) > parseFloat(filters.maxPrice)) {
        return false;
      }
      
      return true;
    });
  }, [memoizedProducts]);

  // ✅ Estatísticas avançadas
  const productStats = useMemo(() => {
    const stats = {
      total: memoizedProducts.length,
      byCategory: {},
      averagePrice: 0,
      totalValue: 0,
      priceRange: { min: 0, max: 0 }
    };

    if (memoizedProducts.length > 0) {
      let minPrice = Infinity;
      let maxPrice = 0;
      
      memoizedProducts.forEach(product => {
        // Contagem por categoria
        stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1;
        
        // Valores
        const price = parseFloat(product.price) || 0;
        stats.totalValue += price;
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      });
      
      stats.averagePrice = stats.totalValue / memoizedProducts.length;
      stats.priceRange = { min: minPrice, max: maxPrice };
    }

    return stats;
  }, [memoizedProducts]);

  // ✅ Limpar cache quando componente desmonta
  useEffect(() => {
    return () => {
      cacheRef.current = { data: null, timestamp: null, filters: null };
    };
  }, []);

  const clearError = useCallback(() => setError(''), []);
  
  const resetProducts = useCallback(() => {
    setProducts([]);
    setError('');
    setLoading(false);
    cacheRef.current = { data: null, timestamp: null, filters: null };
  }, []);

  return {
    // Estado
    products: memoizedProducts,
    loading,
    error,
    productStats,
    
    // Métodos principais
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Métodos auxiliares
    getProductById,
    filterProducts,
    validateProductData,
    clearError,
    resetProducts
  };
};