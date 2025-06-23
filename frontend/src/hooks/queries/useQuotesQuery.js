import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, updateQueryData, handleQueryError } from '../../lib/queryClient';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

console.log('[useQuotesQuery] Module loading, apiService methods:', 
  apiService ? Object.keys(apiService) : 'apiService is undefined');

// =================== QUOTE QUERIES ===================

/**
 * Hook for fetching quotes based on user role (for modals/UI components)
 * This hook encapsulates all the logic for fetching quotes with role-based API calls
 */
export const useQuotesModalQuery = () => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: ['quotes', 'list', { userId: user?.id, role: user?.role }],
    queryFn: async () => {
      if (!user?.role) return [];
      
      try {
        // Dynamic import to ensure module is loaded
        const { apiService: dynamicApiService } = await import('../../services/api');
        
        const data = user.role === 'supplier'
          ? await dynamicApiService.getSupplierQuotes()
          : await dynamicApiService.getBuyerQuotes();
        
        // Handle both direct array and wrapped object API responses
        return Array.isArray(data) ? data : (data?.quotes || []);
      } catch (apiError) {
        console.error('API Error fetching quotes:', apiError);
        console.log('API not available, returning empty array as fallback.');
        return [];
      }
    },
    enabled: !!user?.id && !!user?.role,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook for fetching quotes as a buyer
 */
export const useBuyerQuotesQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.buyer(),
    queryFn: async () => {
      try {
        // Dynamic import to ensure module is loaded
        const { apiService: dynamicApiService } = await import('../../services/api');
        
        if (typeof dynamicApiService.getBuyerQuotes !== 'function') {
          console.error('CRITICAL: getBuyerQuotes is NOT a function on apiService!', dynamicApiService);
          console.log('Available keys:', Object.keys(dynamicApiService));
          throw new Error('getBuyerQuotes not available');
        }
        
        const response = await dynamicApiService.getBuyerQuotes(filters);
        return response;
      } catch (error) {
        throw handleQueryError(error, 'useBuyerQuotesQuery');
      }
    },
    staleTime: 30 * 1000, // 30 seconds (quotes change frequently)
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook for fetching quotes as a supplier
 */
export const useSupplierQuotesQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.supplier(),
    queryFn: async () => {
      try {
        // Dynamic import to ensure module is loaded
        const { apiService: dynamicApiService } = await import('../../services/api');
        const response = await dynamicApiService.getSupplierQuotes(filters);
        return response;
      } catch (error) {
        throw handleQueryError(error, 'useSupplierQuotesQuery');
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook for infinite scroll quotes
 */
export const useInfiniteQuotesQuery = (type = 'buyer', baseFilters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.quotes[type]({ ...baseFilters, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Dynamic import to ensure module is loaded
        const { apiService: dynamicApiService } = await import('../../services/api');
        
        const filters = { ...baseFilters, page: pageParam, limit: 20 };
        const response = type === 'buyer' 
          ? await dynamicApiService.getBuyerQuotes(filters)
          : await dynamicApiService.getSupplierQuotes(filters);
        return {
          ...response,
          nextCursor: response.pagination?.hasNextPage ? pageParam + 1 : undefined,
        };
      } catch (error) {
        throw handleQueryError(error, 'useInfiniteQuotesQuery');
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching a single quote by ID
 */
export const useQuoteQuery = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getQuote(id);
      } catch (error) {
        throw handleQueryError(error, 'useQuoteQuery');
      }
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute for individual quotes
    ...options,
  });
};

/**
 * Hook for fetching quotes by product
 */
export const useQuotesByProductQuery = (productId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.byProduct(productId),
    queryFn: async () => {
      try {
        const response = await apiService.getQuotesByProduct(productId);
        return response.quotes || [];
      } catch (error) {
        throw handleQueryError(error, 'useQuotesByProductQuery');
      }
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook for fetching quotes by status
 */
export const useQuotesByStatusQuery = (status, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.byStatus(status),
    queryFn: async () => {
      try {
        const response = await apiService.getQuotesByStatus(status);
        return response.quotes || [];
      } catch (error) {
        throw handleQueryError(error, 'useQuotesByStatusQuery');
      }
    },
    enabled: !!status,
    staleTime: 30 * 1000, // 30 seconds for status-based quotes
    ...options,
  });
};

// =================== QUOTE MUTATIONS ===================

/**
 * Hook for requesting a new quote
 */
export const useRequestQuoteMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteData) => {
      // Client-side validation
      if (!quoteData.productId) {
        throw new Error('Produto é obrigatório para solicitar cotação');
      }
      
      if (!quoteData.quantity || parseInt(quoteData.quantity) <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      if (!quoteData.message?.trim()) {
        throw new Error('Mensagem com detalhes da cotação é obrigatória');
      }
      
      if (!quoteData.deliveryDate) {
        throw new Error('Data de entrega desejada é obrigatória');
      }

      return await apiService.requestQuote(quoteData);
    },
    onSuccess: (newQuote, variables) => {
      // Add to buyer quotes
      queryClient.setQueriesData(
        { queryKey: queryKeys.quotes.buyer() },
        (oldData) => {
          if (!oldData) return oldData;
          
          if (Array.isArray(oldData)) {
            return [newQuote, ...oldData];
          }
          
          if (oldData.quotes && Array.isArray(oldData.quotes)) {
            return {
              ...oldData,
              quotes: [newQuote, ...oldData.quotes],
              pagination: oldData.pagination ? {
                ...oldData.pagination,
                total: (oldData.pagination.total || 0) + 1
              } : undefined
            };
          }
          
          return oldData;
        }
      );
      
      // Invalidate related queries
      invalidateQueries.quotes();
      
      // Show success notification
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Cotação solicitada com sucesso!' 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, 'requestQuote');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao solicitar cotação' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for responding to a quote (supplier)
 */
export const useRespondToQuoteMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, response }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      if (!response.price || parseFloat(response.price) <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }
      if (!response.deliveryTime) {
        throw new Error('Prazo de entrega é obrigatório');
      }
      
      return await apiService.respondToQuote(quoteId, response);
    },
    onMutate: async ({ quoteId, response }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId) });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData(queryKeys.quotes.detail(quoteId));
      
      // Optimistic update
      queryClient.setQueryData(
        queryKeys.quotes.detail(quoteId),
        (oldData) => oldData ? { 
          ...oldData, 
          status: 'responded',
          supplierResponse: response,
          updatedAt: new Date().toISOString()
        } : oldData
      );
      
      return { previousQuote, quoteId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousQuote && context?.quoteId) {
        queryClient.setQueryData(
          queryKeys.quotes.detail(context.quoteId), 
          context.previousQuote
        );
      }
      
      handleQueryError(error, 'respondToQuote');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao responder cotação' 
        }
      }));
    },
    onSuccess: (updatedQuote, { quoteId }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), updatedQuote);
      
      // Invalidate related queries
      invalidateQueries.quotes();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Resposta enviada com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for accepting a quote (buyer)
 */
export const useAcceptQuoteMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, acceptanceData }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      return await apiService.acceptQuote(quoteId, acceptanceData);
    },
    onMutate: async ({ quoteId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId) });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData(queryKeys.quotes.detail(quoteId));
      
      // Optimistic update
      queryClient.setQueryData(
        queryKeys.quotes.detail(quoteId),
        (oldData) => oldData ? { 
          ...oldData, 
          status: 'accepted',
          updatedAt: new Date().toISOString()
        } : oldData
      );
      
      return { previousQuote, quoteId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousQuote && context?.quoteId) {
        queryClient.setQueryData(
          queryKeys.quotes.detail(context.quoteId), 
          context.previousQuote
        );
      }
      
      handleQueryError(error, 'acceptQuote');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao aceitar cotação' 
        }
      }));
    },
    onSuccess: (acceptedQuote, { quoteId }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), acceptedQuote);
      
      // Invalidate related queries
      invalidateQueries.quotes();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Cotação aceita com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for rejecting a quote
 */
export const useRejectQuoteMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, reason, requireConfirmation = true }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja rejeitar esta cotação?');
        if (!confirmed) {
          throw new Error('CANCELLED');
        }
      }
      
      return await apiService.rejectQuote(quoteId, reason);
    },
    onMutate: async ({ quoteId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId) });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData(queryKeys.quotes.detail(quoteId));
      
      // Optimistic update
      queryClient.setQueryData(
        queryKeys.quotes.detail(quoteId),
        (oldData) => oldData ? { 
          ...oldData, 
          status: 'rejected',
          updatedAt: new Date().toISOString()
        } : oldData
      );
      
      return { previousQuote, quoteId };
    },
    onError: (error, variables, context) => {
      // Don't show error for user cancellation
      if (error.message === 'CANCELLED') {
        return;
      }
      
      // Rollback optimistic update on error
      if (context?.previousQuote && context?.quoteId) {
        queryClient.setQueryData(
          queryKeys.quotes.detail(context.quoteId), 
          context.previousQuote
        );
      }
      
      handleQueryError(error, 'rejectQuote');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao rejeitar cotação' 
        }
      }));
    },
    onSuccess: (rejectedQuote, { quoteId }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), rejectedQuote);
      
      // Invalidate related queries
      invalidateQueries.quotes();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Cotação rejeitada' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for converting quote to order
 */
export const useConvertQuoteToOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, orderData = {} }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      return await apiService.convertQuoteToOrder(quoteId, orderData);
    },
    onSuccess: (newOrder, { quoteId }) => {
      // Update quote status
      queryClient.setQueryData(
        queryKeys.quotes.detail(quoteId),
        (oldData) => oldData ? { 
          ...oldData, 
          status: 'converted',
          orderId: newOrder.id,
          updatedAt: new Date().toISOString()
        } : oldData
      );
      
      // Add new order to orders cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          if (Array.isArray(oldData)) {
            return [newOrder, ...oldData];
          }
          
          if (oldData.orders && Array.isArray(oldData.orders)) {
            return {
              ...oldData,
              orders: [newOrder, ...oldData.orders],
              pagination: oldData.pagination ? {
                ...oldData.pagination,
                total: (oldData.pagination.total || 0) + 1
              } : undefined
            };
          }
          
          return oldData;
        }
      );
      
      // Invalidate related queries
      invalidateQueries.quotes();
      invalidateQueries.orders();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Cotação convertida em pedido com sucesso!' 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, 'convertQuoteToOrder');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao converter cotação em pedido' 
        }
      }));
    },
    ...options,
  });
};

// =================== UTILITY HOOKS ===================

/**
 * Hook to prefetch quote details for better UX
 */
export const usePrefetchQuote = () => {
  const queryClient = useQueryClient();

  return {
    prefetchQuote: (id) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.quotes.detail(id),
        queryFn: () => apiService.getQuote(id),
        staleTime: 30 * 1000,
      });
    },
    prefetchBuyerQuotes: (filters) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.quotes.buyer(),
        queryFn: () => apiService.getBuyerQuotes(filters),
        staleTime: 15 * 1000,
      });
    },
    prefetchSupplierQuotes: (filters) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.quotes.supplier(),
        queryFn: () => apiService.getSupplierQuotes(filters),
        staleTime: 15 * 1000,
      });
    },
  };
};

/**
 * Hook for quote state management
 */
export const useQuoteState = (quoteId) => {
  const { data: quote } = useQuoteQuery(quoteId);
  
  const canRespond = quote?.status === 'pending' && quote?.userRole === 'supplier';
  const canAccept = quote?.status === 'responded' && quote?.userRole === 'buyer';
  const canReject = ['pending', 'responded'].includes(quote?.status);
  const canConvertToOrder = quote?.status === 'accepted';
  const isExpired = quote?.expiresAt && new Date(quote.expiresAt) < new Date();
  const isPending = quote?.status === 'pending';
  const isResponded = quote?.status === 'responded';
  const isAccepted = quote?.status === 'accepted';
  const isRejected = quote?.status === 'rejected';
  const isConverted = quote?.status === 'converted';
  
  return {
    quote,
    canRespond,
    canAccept,
    canReject,
    canConvertToOrder,
    isExpired,
    isPending,
    isResponded,
    isAccepted,
    isRejected,
    isConverted,
    statusColor: {
      pending: 'yellow',
      responded: 'blue',
      accepted: 'green',
      rejected: 'red',
      converted: 'purple',
      expired: 'gray',
    }[quote?.status] || 'gray'
  };
};