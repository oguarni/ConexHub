import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, updateQueryData, handleQueryError } from '../../lib/queryClient';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

// =================== ORDER QUERIES ===================

/**
 * Hook for fetching orders based on user role (for modals/UI components)
 * This hook encapsulates all the logic for fetching orders with role-based API calls
 */
export const useOrdersModalQuery = () => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: ['orders', 'list', { userId: user?.id, role: user?.role }],
    queryFn: async () => {
      if (!user?.role) return [];
      
      try {
        const data = user.role === 'supplier'
          ? await apiService.getSupplierOrders()
          : await apiService.getUserOrders();
        
        // Handle both direct array and wrapped object API responses
        return Array.isArray(data) ? data : (data?.orders || []);
      } catch (apiError) {
        console.error('API Error fetching orders:', apiError);
        console.log('API not available, attempting to load sample orders as a fallback.');
        
        // Fallback to sample orders
        try {
          const response = await apiService.getSampleOrders(user.role);
          return response.orders || [];
        } catch (error) {
          console.error('Error loading sample orders from API:', error);
          // Final fallback to minimal local data
          return [{
            id: 1,
            orderNumber: 'SAMPLE-001',
            productName: 'Produto de Exemplo',
            quantity: 1,
            unit: 'un',
            supplierName: 'Fornecedor Exemplo',
            totalPrice: 100.00,
            status: 'pending',
            createdAt: new Date().toISOString()
          }];
        }
      }
    },
    enabled: !!user?.id && !!user?.role,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook for fetching orders with filters and pagination
 */
export const useOrdersQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters.userId || 'current'),
    queryFn: async () => {
      try {
        const response = await apiService.getOrders(filters);
        return response;
      } catch (error) {
        throw handleQueryError(error, 'useOrdersQuery');
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute (orders change frequently)
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook for infinite scroll orders
 */
export const useInfiniteOrdersQuery = (baseFilters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.orders.list({ ...baseFilters, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const filters = { ...baseFilters, page: pageParam, limit: 20 };
        const response = await apiService.getOrders(filters);
        return {
          ...response,
          nextCursor: response.pagination.hasNextPage ? pageParam + 1 : undefined,
        };
      } catch (error) {
        throw handleQueryError(error, 'useInfiniteOrdersQuery');
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrderQuery = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getOrder(id);
      } catch (error) {
        throw handleQueryError(error, 'useOrderQuery');
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual orders
    ...options,
  });
};

/**
 * Hook for fetching orders by status
 */
export const useOrdersByStatusQuery = (status, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.byStatus(status),
    queryFn: async () => {
      try {
        const response = await apiService.getOrders({ status });
        return response.orders || [];
      } catch (error) {
        throw handleQueryError(error, 'useOrdersByStatusQuery');
      }
    },
    enabled: !!status,
    staleTime: 30 * 1000, // 30 seconds for status-based orders
    ...options,
  });
};

/**
 * Hook for fetching order history
 */
export const useOrderHistoryQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.history(userId),
    queryFn: async () => {
      try {
        return await apiService.getOrderHistory(userId);
      } catch (error) {
        throw handleQueryError(error, 'useOrderHistoryQuery');
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for history
    ...options,
  });
};

/**
 * Hook for fetching order analytics
 */
export const useOrderAnalyticsQuery = (period = '30d', options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.analytics(period),
    queryFn: async () => {
      try {
        return await apiService.getOrderAnalytics(period);
      } catch (error) {
        throw handleQueryError(error, 'useOrderAnalyticsQuery');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for analytics
    ...options,
  });
};

// =================== ORDER MUTATIONS ===================

/**
 * Hook for creating a new order
 */
export const useCreateOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      // Client-side validation
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Pedido deve conter pelo menos um item');
      }

      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (totalAmount <= 0) {
        throw new Error('Valor total do pedido deve ser maior que zero');
      }

      if (!orderData.shippingAddress?.street?.trim()) {
        throw new Error('Endereço de entrega é obrigatório');
      }

      return await apiService.createOrder(orderData);
    },
    onSuccess: (newOrder, variables) => {
      // Add to order lists
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
      invalidateQueries.orders();
      
      // Show success notification
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Pedido criado com sucesso!' 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, 'createOrder');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao criar pedido' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for updating order status
 */
export const useUpdateOrderStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      if (!id) throw new Error('ID do pedido é obrigatório');
      if (!status) throw new Error('Status é obrigatório');
      
      return await apiService.updateOrderStatus(id, status, notes);
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(id) });
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(queryKeys.orders.detail(id));
      
      // Optimistic update
      updateQueryData.updateOrderStatus(id, status);
      
      return { previousOrder, id };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousOrder && context?.id) {
        queryClient.setQueryData(
          queryKeys.orders.detail(context.id), 
          context.previousOrder
        );
      }
      
      handleQueryError(error, 'updateOrderStatus');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao atualizar status do pedido' 
        }
      }));
    },
    onSuccess: (updatedOrder, { id }) => {
      // Update with server response
      updateQueryData.updateOrderStatus(id, updatedOrder.status);
      
      // Invalidate related queries
      invalidateQueries.orderDetails(id);
      invalidateQueries.orderLists();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Status do pedido atualizado com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for canceling an order
 */
export const useCancelOrderMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason, requireConfirmation = true }) => {
      if (!id) throw new Error('ID do pedido é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja cancelar este pedido?');
        if (!confirmed) {
          throw new Error('CANCELLED');
        }
      }
      
      return await apiService.cancelOrder(id, reason);
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(id) });
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(queryKeys.orders.detail(id));
      
      // Optimistic update
      updateQueryData.updateOrderStatus(id, 'cancelled');
      
      return { previousOrder, id };
    },
    onError: (error, variables, context) => {
      // Don't show error for user cancellation
      if (error.message === 'CANCELLED') {
        return;
      }
      
      // Rollback optimistic update on error
      if (context?.previousOrder && context?.id) {
        queryClient.setQueryData(
          queryKeys.orders.detail(context.id), 
          context.previousOrder
        );
      }
      
      handleQueryError(error, 'cancelOrder');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao cancelar pedido' 
        }
      }));
    },
    onSuccess: (cancelledOrder, { id }) => {
      // Update with server response
      updateQueryData.updateOrderStatus(id, 'cancelled');
      
      // Invalidate related queries
      invalidateQueries.orders();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Pedido cancelado com sucesso!' 
        }
      }));
    },
    ...options,
  });
};

/**
 * Hook for processing payment
 */
export const useProcessPaymentMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentData }) => {
      if (!orderId) throw new Error('ID do pedido é obrigatório');
      if (!paymentData) throw new Error('Dados de pagamento são obrigatórios');
      
      return await apiService.processOrderPayment(orderId, paymentData);
    },
    onSuccess: (paymentResult, { orderId }) => {
      // Update order status to paid
      updateQueryData.updateOrderStatus(orderId, 'paid');
      
      // Invalidate related queries
      invalidateQueries.orderDetails(orderId);
      invalidateQueries.orders();
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'success', 
          message: 'Pagamento processado com sucesso!' 
        }
      }));
    },
    onError: (error) => {
      handleQueryError(error, 'processPayment');
      
      window.dispatchEvent(new CustomEvent('notification:show', {
        detail: { 
          type: 'error', 
          message: error.message || 'Erro ao processar pagamento' 
        }
      }));
    },
    ...options,
  });
};

// =================== UTILITY HOOKS ===================

/**
 * Hook to prefetch order details for better UX
 */
export const usePrefetchOrder = () => {
  const queryClient = useQueryClient();

  return {
    prefetchOrder: (id) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.orders.detail(id),
        queryFn: () => apiService.getOrder(id),
        staleTime: 1 * 60 * 1000,
      });
    },
    prefetchOrders: (filters) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.orders.list(filters.userId || 'current'),
        queryFn: () => apiService.getOrders(filters),
        staleTime: 30 * 1000,
      });
    },
  };
};

/**
 * Hook for order state management
 */
export const useOrderState = (orderId) => {
  const { data: order } = useOrderQuery(orderId);
  
  const canCancel = order?.status === 'pending' || order?.status === 'confirmed';
  const canPay = order?.status === 'confirmed' && order?.paymentStatus !== 'paid';
  const isProcessing = ['processing', 'shipping'].includes(order?.status);
  const isCompleted = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled';
  
  return {
    order,
    canCancel,
    canPay,
    isProcessing,
    isCompleted,
    isCancelled,
    statusColor: {
      pending: 'yellow',
      confirmed: 'blue',
      processing: 'purple',
      shipping: 'indigo',
      delivered: 'green',
      cancelled: 'red',
    }[order?.status] || 'gray'
  };
};