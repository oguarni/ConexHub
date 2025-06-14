import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, updateQueryData, handleQueryError } from '../../lib/queryClient';
import { apiService } from '../../services/api';

// =================== PRODUCT QUERIES ===================

/**
 * Hook for fetching products with filters and pagination
 */
export const useProductsQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      try {
        const response = await apiService.getProducts(filters);
        return response;
      } catch (error) {
        throw handleQueryError(error, 'useProductsQuery');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook for infinite scroll products
 */
export const useInfiniteProductsQuery = (baseFilters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list({ ...baseFilters, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const filters = { ...baseFilters, page: pageParam, limit: 20 };
        const response = await apiService.getProducts(filters);
        return {
          ...response,
          nextCursor: response.pagination.hasNextPage ? pageParam + 1 : undefined,
        };
      } catch (error) {
        throw handleQueryError(error, 'useInfiniteProductsQuery');
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching a single product by ID
 */
export const useProductQuery = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getProduct(id);
      } catch (error) {
        throw handleQueryError(error, 'useProductQuery');
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual products
    ...options,
  });
};

/**
 * Hook for searching products
 */
export const useProductSearchQuery = (searchQuery, filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.search(searchQuery, filters),
    queryFn: async () => {
      try {
        const searchFilters = { ...filters, search: searchQuery };
        const response = await apiService.getProducts(searchFilters);
        return response;
      } catch (error) {
        throw handleQueryError(error, 'useProductSearchQuery');
      }
    },
    enabled: !!searchQuery && searchQuery.trim().length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    ...options,
  });
};

/**
 * Hook for fetching featured products
 */
export const useFeaturedProductsQuery = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: async () => {
      try {
        const response = await apiService.getProducts({ featured: true, limit });
        return response.products || [];
      } catch (error) {
        throw handleQueryError(error, 'useFeaturedProductsQuery');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for featured products
    ...options,
  });
};

/**
 * Hook for fetching product recommendations
 */
export const useProductRecommendationsQuery = (productId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.recommendations(productId),
    queryFn: async () => {
      try {
        return await apiService.getProductRecommendations(productId);
      } catch (error) {
        throw handleQueryError(error, 'useProductRecommendationsQuery');
      }
    },
    enabled: !!productId,
    staleTime: 15 * 60 * 1000, // 15 minutes for recommendations
    ...options,
  });
};

/**
 * Hook for fetching trending products
 */
export const useTrendingProductsQuery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.trending(),
    queryFn: async () => {
      try {
        return await apiService.getTrendingProducts();
      } catch (error) {
        throw handleQueryError(error, 'useTrendingProductsQuery');
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for trending
    ...options,
  });
};

/**
 * Hook for fetching product categories
 */
export const useProductCategoriesQuery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: async () => {
      try {
        return await apiService.getProductCategories();
      } catch (error) {
        throw handleQueryError(error, 'useProductCategoriesQuery');
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour for categories
    ...options,
  });
};

/**
 * Hook for fetching search facets
 */
export const useProductFacetsQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.facets(filters),
    queryFn: async () => {
      try {
        return await apiService.getProductFacets(filters);
      } catch (error) {
        throw handleQueryError(error, 'useProductFacetsQuery');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for facets
    ...options,
  });
};

// =================== PRODUCT MUTATIONS ===================

/**
 * Hook for creating a new product
 */
export const useCreateProductMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      // Client-side validation
      if (!productData.name?.trim()) {
        throw new Error('Nome do produto é obrigatório');
      }
      if (!productData.price || parseFloat(productData.price) <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }
      if (!productData.category?.trim()) {
        throw new Error('Categoria é obrigatória');
      }

      return await apiService.createProduct(productData);
    },
    onSuccess: (newProduct, variables) => {
      // Optimistic update - add to existing lists
      updateQueryData.addProductToLists(newProduct);
      
      // Invalidate and refetch related queries
      invalidateQueries.products();
      
      // Show success notification
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Produto criado com sucesso!' 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, 'createProduct');
      
      // Show error notification
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao criar produto' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for updating a product
 */
export const useUpdateProductMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }) => {
      if (!id) throw new Error('ID do produto é obrigatório');
      return await apiService.updateProduct(id, productData);
    },
    onMutate: async ({ id, productData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });
      
      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
      
      // Optimistic update
      updateQueryData.updateProduct(id, productData);
      
      return { previousProduct, id };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousProduct && context?.id) {
        queryClient.setQueryData(
          queryKeys.products.detail(context.id), 
          context.previousProduct
        );
      }
      
      handleQueryError(error, 'updateProduct');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao atualizar produto' 
        }
      }));
    },
    onSuccess: (updatedProduct, { id }) => {
      // Update with server response
      updateQueryData.updateProduct(id, updatedProduct);
      
      // Invalidate related queries
      invalidateQueries.productDetails(id);
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Produto atualizado com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for deleting a product
 */
export const useDeleteProductMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, requireConfirmation = true }) => {
      if (!id) throw new Error('ID do produto é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja excluir este produto?');
        if (!confirmed) {
          throw new Error('CANCELLED');
        }
      }
      
      await apiService.deleteProduct(id);
      return id;
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all() });
      
      // Snapshot previous values
      const previousQueries = [];
      const queryCache = queryClient.getQueryCache();
      
      queryCache.findAll({ queryKey: queryKeys.products.lists() }).forEach(query => {
        previousQueries.push({
          queryKey: query.queryKey,
          data: query.state.data
        });
      });
      
      const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
      
      // Optimistic update - remove from lists
      updateQueryData.removeProductFromLists(id);
      
      return { previousQueries, previousProduct, id };
    },
    onError: (error, variables, context) => {
      // Don't show error for user cancellation
      if (error.message === 'CANCELLED') {
        return;
      }
      
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      if (context?.previousProduct && context?.id) {
        queryClient.setQueryData(
          queryKeys.products.detail(context.id), 
          context.previousProduct
        );
      }
      
      handleQueryError(error, 'deleteProduct');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao excluir produto' 
        }
      }));
    },
    onSuccess: (deletedId) => {
      // Invalidate and refetch related queries
      invalidateQueries.products();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Produto excluído com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for bulk operations
 */
export const useBulkProductMutation = (operation, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items) => {
      switch (operation) {
        case 'updatePrices':
          return await apiService.bulkUpdateProductPrices(items);
        case 'updateStock':
          return await apiService.bulkUpdateProductStock(items);
        case 'delete':
          return await Promise.all(
            items.map(id => apiService.deleteProduct(id))
          );
        default:
          throw new Error(`Operação não suportada: ${operation}`);
      }
    },
    onSuccess: (results, variables) => {
      // Invalidate all product queries
      invalidateQueries.products();
      
      const successCount = Array.isArray(results) 
        ? results.filter(r => r.success !== false).length
        : variables.length;
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: `${successCount} produtos atualizados com sucesso!` 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, `bulk${operation}`);
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro na operação em lote' 
        }
      }));
    },
    ...options,
  });
};

// =================== UTILITY HOOKS ===================

/**
 * Hook to prefetch product details for better UX
 */
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return {
    prefetchProduct: (id) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => apiService.getProduct(id),
        staleTime: 2 * 60 * 1000,
      });
    },
    prefetchProducts: (filters) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.list(filters),
        queryFn: () => apiService.getProducts(filters),
        staleTime: 1 * 60 * 1000,
      });
    },
  };
};

/**
 * Hook for optimistic product updates
 */
export const useOptimisticProduct = (id) => {
  const queryClient = useQueryClient();

  return {
    updateOptimistically: (updates) => {
      updateQueryData.updateProduct(id, updates);
    },
    revertOptimisticUpdate: (originalData) => {
      queryClient.setQueryData(queryKeys.products.detail(id), originalData);
    },
  };
};