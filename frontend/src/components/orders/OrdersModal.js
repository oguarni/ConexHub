import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../services/api';

const OrdersModal = ({ show, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && user) {
      loadOrders();
    }
  }, [show, user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = user.role === 'supplier' 
        ? await apiService.getSupplierOrders()
        : await apiService.getUserOrders();
      setOrders(data.orders || []);
    } catch (error) {
      setError('Erro ao carregar pedidos');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      setError('Erro ao atualizar status do pedido');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'confirmed':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={16} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Package className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold">Meus Pedidos</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-500">
                Aceite cotações para gerar pedidos automaticamente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Pedido #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Produto</h4>
                      <p className="text-sm">{order.productName}</p>
                      <p className="text-xs text-gray-600">
                        Quantidade: {order.quantity} {order.unit}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fornecedor</h4>
                      <p className="text-sm">{order.supplierName}</p>
                      {order.supplierEmail && (
                        <p className="text-xs text-gray-600">{order.supplierEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        R$ {parseFloat(order.totalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                    {user.role === 'supplier' && order.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {user.role === 'supplier' && order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                      >
                        Marcar como Enviado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;