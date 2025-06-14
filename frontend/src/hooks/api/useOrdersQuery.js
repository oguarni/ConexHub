import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { queryKeys, invalidateQueries } from '../../config/queryClient';
import { useErrorHandler } from '../useErrorHandler';

// Get user orders
export const useOrdersQuery = (userId, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.orders.list(userId),
    queryFn: async () => {
      try {
        const data = await apiService.getUserOrders();
        return data.orders || [];
      } catch (error) {
        handleError(error, 'loadOrders');
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Get single order by ID
export const useOrderQuery = (id, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      try {
        return await apiService.getOrder(id);
      } catch (error) {
        handleError(error, 'getOrder');
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get orders by status
export const useOrdersByStatusQuery = (status, options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: queryKeys.orders.byStatus(status),
    queryFn: async () => {
      try {
        const data = await apiService.getOrdersByStatus(status);
        return data.orders || [];
      } catch (error) {
        handleError(error, 'getOrdersByStatus');
        throw error;
      }
    },
    enabled: !!status,
    staleTime: 1 * 60 * 1000, // 1 minute for status-based queries
    ...options,
  });
};

// Create order mutation
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async (orderData) => {
      // Validate order data
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Itens do pedido são obrigatórios');
      }
      
      if (!orderData.shippingAddress) {
        throw new Error('Endereço de entrega é obrigatório');
      }
      
      if (!orderData.paymentMethod) {
        throw new Error('Método de pagamento é obrigatório');
      }
      
      // Validate each item
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          throw new Error(`Item ${index + 1}: ID do produto é obrigatório`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item ${index + 1}: Quantidade deve ser maior que zero`);
        }
        if (!item.price || item.price <= 0) {
          throw new Error(`Item ${index + 1}: Preço deve ser maior que zero`);
        }
      });
      
      const data = await apiService.createOrder(orderData);
      return data.order;
    },
    onSuccess: (newOrder, variables) => {
      // Add to user's order list
      queryClient.setQueryData(
        queryKeys.orders.list(variables.userId),
        (oldData) => {
          if (Array.isArray(oldData)) {
            return [newOrder, ...oldData];
          }
          return [newOrder];
        }
      );
      
      // Invalidate order queries
      invalidateQueries.orders();
      
      // Update product stock optimistically
      variables.items.forEach(item => {
        queryClient.setQueryData(
          queryKeys.products.detail(item.productId),
          (oldProduct) => {
            if (oldProduct && oldProduct.stock) {
              return {
                ...oldProduct,
                stock: Math.max(0, oldProduct.stock - item.quantity)
              };
            }
            return oldProduct;
          }
        );
      });
      
      handleSuccess(`Pedido ${newOrder.orderNumber} criado com sucesso!`);
    },
    onError: (error) => {
      handleError(error, 'createOrder');
    },
  });
};

// Update order status mutation
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      if (!id) throw new Error('ID do pedido é obrigatório');
      if (!status) throw new Error('Status é obrigatório');
      
      const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status inválido');
      }
      
      const data = await apiService.updateOrderStatus(id, { status, notes });
      return { id, order: data.order };
    },
    onMutate: async ({ id, status, notes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(id) });
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(queryKeys.orders.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.orders.detail(id), (old) => ({
        ...old,
        status,
        notes: notes || old.notes,
        updatedAt: new Date().toISOString(),
      }));
      
      // Update in lists too
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.map(order => 
              order.id === id ? { 
                ...order, 
                status, 
                notes: notes || order.notes,
                updatedAt: new Date().toISOString()
              } : order
            );
          }
          return oldData;
        }
      );
      
      return { previousOrder };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(queryKeys.orders.detail(id), context.previousOrder);
      }
      handleError(error, 'updateOrderStatus');
    },
    onSuccess: ({ id, order }) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.orders.detail(id), order);
      invalidateQueries.orders();
      
      const statusMap = {
        confirmed: 'confirmado',
        processing: 'em processamento',
        shipped: 'enviado',
        delivered: 'entregue',
        cancelled: 'cancelado'
      };
      
      handleSuccess(`Pedido ${order.orderNumber} foi ${statusMap[order.status]}!`);
    },
  });
};

// Cancel order mutation
export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async ({ id, reason, requireConfirmation = true }) => {
      if (!id) throw new Error('ID do pedido é obrigatório');
      
      if (requireConfirmation) {
        const confirmed = window.confirm('Tem certeza que deseja cancelar este pedido?');
        if (!confirmed) {
          throw new Error('Operação cancelada pelo usuário');
        }
      }
      
      const data = await apiService.updateOrderStatus(id, { 
        status: 'cancelled',
        notes: reason || 'Cancelado pelo usuário'
      });
      return { id, order: data.order };
    },
    onSuccess: ({ id, order }) => {
      // Update order status
      queryClient.setQueryData(queryKeys.orders.detail(id), order);
      invalidateQueries.orders();
      
      // Restore product stock optimistically
      if (order.items) {
        order.items.forEach(item => {
          queryClient.setQueryData(
            queryKeys.products.detail(item.productId),
            (oldProduct) => {
              if (oldProduct) {
                return {
                  ...oldProduct,
                  stock: (oldProduct.stock || 0) + item.quantity
                };
              }
              return oldProduct;
            }
          );
        });
      }
      
      handleSuccess(`Pedido ${order.orderNumber} foi cancelado!`);
    },
    onError: (error) => {
      if (error.message !== 'Operação cancelada pelo usuário') {
        handleError(error, 'cancelOrder');
      }
    },
  });
};

// Generate invoice mutation
export const useGenerateInvoiceMutation = () => {
  const { handleError, handleSuccess } = useErrorHandler();
  
  return useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) throw new Error('ID do pedido é obrigatório');
      
      const data = await apiService.generateInvoice(orderId);
      return data;
    },
    onSuccess: (data) => {
      handleSuccess('Nota fiscal gerada com sucesso!');
      
      // Download invoice if URL is provided
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
      }
    },
    onError: (error) => {
      handleError(error, 'generateInvoice');
    },
  });
};

// Order analytics hook
export const useOrderAnalyticsQuery = (period = '30d', options = {}) => {
  const { handleError } = useErrorHandler();
  
  return useQuery({
    queryKey: ['analytics', 'orders', period],
    queryFn: async () => {
      try {
        const data = await apiService.getOrderAnalytics(period);
        return data;
      } catch (error) {
        handleError(error, 'getOrderAnalytics');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};