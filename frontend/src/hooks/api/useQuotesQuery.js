import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { queryKeys, invalidateQueries } from '../../config/queryClient';
import { useErrorHandler } from '../useErrorHandler';

// Get quotes for buyer
export const useBuyerQuotesQuery = (options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.quotes.list('buyer'),
    queryFn: async () => {
      try {
        const data = await apiService.getBuyerQuotes();
        return data.quotes || [];
      } catch (error) {
        handleError(error, 'loadBuyerQuotes');
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// Get quotes for supplier
export const useSupplierQuotesQuery = (options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.quotes.list('supplier'),
    queryFn: async () => {
      try {
        const data = await apiService.getSupplierQuotes();
        return data.quotes || [];
      } catch (error) {
        handleError(error, 'loadSupplierQuotes');
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// Get single quote by ID
export const useQuoteQuery = (id, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getQuote(id);
      } catch (error) {
        handleError(error, 'getQuote');
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Get quotes for specific product
export const useProductQuotesQuery = (productId, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.quotes.byProduct(productId),
    queryFn: async () => {
      try {
        const data = await apiService.getProductQuotes(productId);
        return data.quotes || [];
      } catch (error) {
        handleError(error, 'getProductQuotes');
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Request quote mutation
export const useRequestQuoteMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async (quoteData) => {
      // Validate quote data
      if (!quoteData.productId) {
        throw new Error('ID do produto é obrigatório');
      }
      
      if (!quoteData.quantity || quoteData.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      if (quoteData.quantity < 1) {
        throw new Error('Quantidade mínima é 1');
      }
      
      if (quoteData.maxPrice && quoteData.maxPrice <= 0) {
        throw new Error('Preço máximo deve ser maior que zero');
      }
      
      const data = await apiService.requestQuote(quoteData);
      return data.quote;
    },
    onSuccess: (newQuote) => {
      // Add to buyer quotes list
      queryClient.setQueryData(
        queryKeys.quotes.list('buyer'),
        (oldData) => {
          if (Array.isArray(oldData)) {
            return [newQuote, ...oldData];
          }
          return [newQuote];
        }
      );
      
      // Add to product quotes
      queryClient.setQueryData(
        queryKeys.quotes.byProduct(newQuote.productId),
        (oldData) => {
          if (Array.isArray(oldData)) {
            return [newQuote, ...oldData];
          }
          return [newQuote];
        }
      );
      
      // Invalidate quotes
      invalidateQueries.quotes();
      
      handleSuccess('Cotação solicitada com sucesso!');
    },
    onError: (error) => {
      handleError(error, 'requestQuote');
    },
  });
};

// Submit quote response mutation (for suppliers)
export const useSubmitQuoteMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ quoteId, quoteResponse }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      // Validate quote response
      if (!quoteResponse.unitPrice || quoteResponse.unitPrice <= 0) {
        throw new Error('Preço unitário deve ser maior que zero');
      }
      
      if (quoteResponse.deliveryDays && quoteResponse.deliveryDays <= 0) {
        throw new Error('Prazo de entrega deve ser maior que zero');
      }
      
      if (quoteResponse.minimumQuantity && quoteResponse.minimumQuantity <= 0) {
        throw new Error('Quantidade mínima deve ser maior que zero');
      }
      
      const data = await apiService.submitQuote(quoteId, quoteResponse);
      return { quoteId, quote: data.quote };
    },
    onMutate: async ({ quoteId, quoteResponse }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId) });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData(queryKeys.quotes.detail(quoteId));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), (old) => ({
        ...old,
        status: 'responded',
        supplierResponse: {
          ...quoteResponse,
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      }));
      
      // Update in supplier quotes list
      queryClient.setQueriesData(
        { queryKey: queryKeys.quotes.list('supplier') },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.map(quote => 
              quote.id === quoteId ? { 
                ...quote, 
                status: 'responded',
                supplierResponse: {
                  ...quoteResponse,
                  submittedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString()
              } : quote
            );
          }
          return oldData;
        }
      );
      
      return { previousQuote };
    },
    onError: (error, { quoteId }, context) => {
      // Rollback on error
      if (context?.previousQuote) {
        queryClient.setQueryData(queryKeys.quotes.detail(quoteId), context.previousQuote);
      }
      handleError(error, 'submitQuote');
    },
    onSuccess: ({ quoteId, quote }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), quote);
      invalidateQueries.quotes();
      
      handleSuccess('Cotação respondida com sucesso!');
    },
  });
};

// Accept quote mutation (for buyers)
export const useAcceptQuoteMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ quoteId, acceptanceData }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      const data = await apiService.acceptQuote(quoteId, acceptanceData);
      return { quoteId, quote: data.quote, order: data.order };
    },
    onSuccess: ({ quoteId, quote, order }) => {
      // Update quote status
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), quote);
      
      // Add order to buyer's orders if created
      if (order) {
        queryClient.setQueryData(
          queryKeys.orders.list(order.buyerId),
          (oldData) => {
            if (Array.isArray(oldData)) {
              return [order, ...oldData];
            }
            return [order];
          }
        );
      }
      
      // Invalidate related queries
      invalidateQueries.quotes();
      if (order) {
        invalidateQueries.orders();
      }
      
      handleSuccess('Cotação aceita com sucesso! Pedido criado.');
    },
    onError: (error) => {
      handleError(error, 'acceptQuote');
    },
  });
};

// Reject quote mutation (for buyers)
export const useRejectQuoteMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ quoteId, reason }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      const data = await apiService.rejectQuote(quoteId, { reason });
      return { quoteId, quote: data.quote };
    },
    onSuccess: ({ quoteId, quote }) => {
      // Update quote status
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), quote);
      
      // Update in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.quotes.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.map(q => q.id === quoteId ? quote : q);
          }
          return oldData;
        }
      );
      
      invalidateQueries.quotes();
      handleSuccess('Cotação rejeitada.');
    },
    onError: (error) => {
      handleError(error, 'rejectQuote');
    },
  });
};

// Cancel quote request mutation (for buyers)
export const useCancelQuoteMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ quoteId, reason, requireConfirmation = true }) => {
      if (!quoteId) throw new Error('ID da cotação é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja cancelar esta cotação?');
        if (!confirmed) {
          throw new Error('Operação cancelada pelo usuário');
        }
      }
      
      const data = await apiService.cancelQuote(quoteId, { reason });
      return { quoteId, quote: data.quote };
    },
    onSuccess: ({ quoteId, quote }) => {
      // Update quote status
      queryClient.setQueryData(queryKeys.quotes.detail(quoteId), quote);
      invalidateQueries.quotes();
      
      handleSuccess('Cotação cancelada.');
    },
    onError: (error) => {
      if (error.message !== 'Operação cancelada pelo usuário') {
        handleError(error, 'cancelQuote');
      }
    },
  });
};