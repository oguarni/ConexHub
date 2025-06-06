import { useState } from 'react';
import { apiService } from '../services/api';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastOrderId, setLastOrderId] = useState('');

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.createOrder(orderData);
      setLastOrderId(data.order.orderNumber);
      return { success: true, order: data.order };
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar pedido');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return {
    loading,
    error,
    lastOrderId,
    createOrder,
    clearError
  };
};