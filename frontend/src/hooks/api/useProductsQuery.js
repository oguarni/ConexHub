import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { queryKeys, invalidateQueries } from '../../config/queryClient';
import { useErrorHandler } from '../useErrorHandler';

// Get all products with filters
export const useProductsQuery = (filters = {}, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      try {
        const data = await apiService.getProducts(filters);
        return data.products || [];
      } catch (error) {
        handleError(error, 'loadProducts');
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for product lists
    enabled: true,
    ...options,
  });
};

// Get single product by ID
export const useProductQuery = (id, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getProduct(id);
      } catch (error) {
        handleError(error, 'getProduct');
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single product
    ...options,
  });
};

// Search products
export const useProductSearchQuery = (searchQuery, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.products.search(searchQuery),
    queryFn: async () => {
      try {
        const data = await apiService.searchProducts(searchQuery);
        return data.products || [];
      } catch (error) {
        handleError(error, 'searchProducts');
        throw error;
      }
    },
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    ...options,
  });
};

// Get featured products
export const useFeaturedProductsQuery = (options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: async () => {
      try {
        const data = await apiService.getProducts({ featured: true, limit: 10 });
        return data.products || [];
      } catch (error) {
        handleError(error, 'getFeaturedProducts');
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for featured products
    ...options,
  });
};

// Create product mutation
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async (productData) => {
      // Validate product data
      if (!productData.name?.trim()) {
        throw new Error('Nome do produto é obrigatório');
      }
      if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
        throw new Error('Preço deve ser um número válido maior que zero');
      }
      if (!productData.category?.trim()) {
        throw new Error('Categoria é obrigatória');
      }
      
      const data = await apiService.createProduct(productData);
      return data.product;
    },
    onSuccess: (newProduct) => {
      // Optimistic update - add to existing product lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return [newProduct, ...oldData];
          }
          return oldData;
        }
      );
      
      // Invalidate product lists to refetch
      invalidateQueries.products();
      
      handleSuccess('Produto criado com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'createProduct');
    },
  });
};

// Update product mutation
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, productData }) => {
      if (!id) throw new Error('ID do produto é obrigatório');
      
      const data = await apiService.updateProduct(id, productData);
      return { id, product: data.product };
    },
    onMutate: async ({ id, productData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });
      
      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.products.detail(id), (old) => ({
        ...old,
        ...productData,
      }));
      
      // Update in lists too
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.map(product => 
              product.id === id ? { ...product, ...productData } : product
            );
          }
          return oldData;
        }
      );
      
      return { previousProduct };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(queryKeys.products.detail(id), context.previousProduct);
      }
      handleError(error, 'updateProduct');
    },
    onSuccess: ({ id, product }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.products.detail(id), product);
      invalidateQueries.products();
      handleSuccess('Produto atualizado com sucesso!');
    },
  });
};

// Delete product mutation
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, requireConfirmation = true }) => {
      if (!id) throw new Error('ID do produto é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja excluir este produto?');
        if (!confirmed) {
          throw new Error('Operação cancelada pelo usuário');
        }
      }
      
      await apiService.deleteProduct(id);
      return id;
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all() });
      
      // Snapshot previous values
      const previousProducts = queryClient.getQueriesData({ queryKey: queryKeys.products.all() });
      const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
      
      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.filter(product => product.id !== id);
          }
          return oldData;
        }
      );
      
      // Remove detailed view
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      
      return { previousProducts, previousProduct };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProduct) {
        queryClient.setQueryData(queryKeys.products.detail(id), context.previousProduct);
      }
      
      if (error.message !== 'Operação cancelada pelo usuário') {
        handleError(error, 'deleteProduct');
      }
    },
    onSuccess: (id) => {
      invalidateQueries.products();
      
      // Get product name for success message
      const productName = queryClient.getQueryData(queryKeys.products.detail(id))?.name || `ID ${id}`;
      handleSuccess(`Produto "${productName}" excluído com sucesso!`);
    },
  });
};

// Bulk operations
export const useBulkUpdateProductsMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async (updates) => {
      const results = await Promise.allSettled(
        updates.map(({ id, productData }) => apiService.updateProduct(id, productData))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      return { successful: successful.length, failed: failed.length, total: updates.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      invalidateQueries.products();
      
      if (failed === 0) {
        handleSuccess(`Todos os ${total} produtos foram atualizados com sucesso!`);
      } else {
        handleSuccess(`${successful} de ${total} produtos atualizados. ${failed} falharam.`);
      }
    },
    onError: (error) => {
      handleError(error, 'bulkUpdateProducts');
    },
  });
};