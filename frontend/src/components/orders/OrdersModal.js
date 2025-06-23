import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, Truck, CheckCircle, Clock, Calculator, MapPin } from 'lucide-react';
import { useOrdersModalQuery, useShippingConfigQuery, useOrdersModalStatusMutation } from '../../hooks/queries/useOrdersQuery';

const OrdersModal = ({ show, onClose, user }) => {
  const [shippingCalculations, setShippingCalculations] = useState({});
  const [calculatingShipping, setCalculatingShipping] = useState({});
  const [shippingCeps, setShippingCeps] = useState({});

  // React Query for Orders using custom hook
  const {
    data: orders = [],
    isLoading: loading,
    error,
    refetch: refetchOrders
  } = useOrdersModalQuery();

  // React Query for Shipping Config using custom hook
  const { data: shippingConfig } = useShippingConfigQuery({
    enabled: show && !!user,
  });

  // Mutation for updating order status using custom hook
  const updateOrderStatusMutation = useOrdersModalStatusMutation(refetchOrders);

  useEffect(() => {
    if (show && user) {
      // Load saved shipping calculations
      const savedShippingCalculations = localStorage.getItem('shippingCalculations');
      if (savedShippingCalculations) {
        try {
          setShippingCalculations(JSON.parse(savedShippingCalculations));
        } catch (error) {
          console.error('Error loading shipping calculations:', error);
        }
      }
    }
  }, [show, user]);

  // Save shipping calculations to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(shippingCalculations).length > 0) {
      localStorage.setItem('shippingCalculations', JSON.stringify(shippingCalculations));
    }
  }, [shippingCalculations]);

  // loadSampleOrders is now handled by the custom hook

  // Shipping config is now handled by React Query above

  const updateOrderStatus = async (orderId, status) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Shipping calculation functions
  const calculateShipping = (order, cep) => {
    if (!cep || cep.length < 8 || !shippingConfig) return 0;

    const config = shippingConfig;
    const productWeight = order.quantity * 0.5; // 0.5kg por unidade
    const productValue = order.totalPrice || 0;
    
    // Multiplicador baseado na região (primeiro dígito do CEP)
    const region = cep.charAt(0);
    const regionData = config.zones[region] || { multiplier: 1.5 };
    
    // Cálculo do frete usando configuração do backend
    let shippingCost = config.baseShipping + (productWeight * config.weightMultiplier);
    shippingCost *= regionData.multiplier;
    
    // Taxa adicional para produtos caros (seguro)
    if (productValue > 1000) {
      shippingCost += productValue * config.insuranceRate;
    }
    
    // Desconto para grandes quantidades
    if (order.quantity >= config.bulkThreshold) {
      shippingCost *= (1 - config.bulkDiscount);
    }
    
    return Math.round(shippingCost * 100) / 100;
  };

  const handleCalculateShipping = async (orderId, cep) => {
    if (!cep || cep.length < 8) {
      setError('CEP deve ter 8 dígitos');
      return;
    }

    setCalculatingShipping(prev => ({ ...prev, [orderId]: true }));
    setError('');

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const shippingCost = calculateShipping(order, cep);
        const estimatedDays = getEstimatedDeliveryDays(cep);
        
        setShippingCalculations(prev => ({
          ...prev,
          [orderId]: {
            cost: shippingCost,
            estimatedDays,
            cep,
            calculatedAt: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      setError('Erro ao calcular frete');
    } finally {
      setCalculatingShipping(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getEstimatedDeliveryDays = (cep) => {
    if (!shippingConfig) return 5;
    
    const region = cep.charAt(0);
    const regionData = shippingConfig.zones[region];
    
    return regionData?.baseDays || 5;
  };

  const formatCep = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 5) {
      return numericValue;
    } else {
      return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }
  };

  const handleCepChange = (orderId, value) => {
    const formatted = formatCep(value);
    setShippingCeps(prev => ({ ...prev, [orderId]: formatted }));
  };

  const clearShippingCalculation = (orderId) => {
    setShippingCalculations(prev => {
      const newCalculations = { ...prev };
      delete newCalculations[orderId];
      return newCalculations;
    });
    setShippingCeps(prev => {
      const newCeps = { ...prev };
      delete newCeps[orderId];
      return newCeps;
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
              {error.message || 'Erro ao carregar pedidos'}
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

                  {/* Shipping Calculator */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium flex items-center">
                        <Truck className="mr-2 text-blue-600" size={16} />
                        Calcular Frete
                      </h5>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Digite o CEP de destino"
                          value={shippingCeps[order.id] || ''}
                          onChange={(e) => handleCepChange(order.id, e.target.value)}
                          maxLength={9}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleCalculateShipping(order.id, shippingCeps[order.id]?.replace(/\D/g, ''))}
                        disabled={calculatingShipping[order.id] || !shippingCeps[order.id] || shippingCeps[order.id].length < 8}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                      >
                        {calculatingShipping[order.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Calculator size={16} />
                        )}
                        <span>{calculatingShipping[order.id] ? 'Calculando...' : 'Calcular'}</span>
                      </button>
                    </div>

                    {/* Shipping Result */}
                    {shippingCalculations[order.id] && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <MapPin className="mr-2 text-blue-600" size={14} />
                            <span className="text-sm font-medium">CEP: {shippingCalculations[order.id].cep}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              Calculado em {new Date(shippingCalculations[order.id].calculatedAt).toLocaleString('pt-BR')}
                            </span>
                            <button
                              onClick={() => clearShippingCalculation(order.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                              title="Recalcular frete"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Custo do Frete:</span>
                            <div className="font-bold text-blue-600">
                              {formatPrice(shippingCalculations[order.id].cost)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Prazo de Entrega:</span>
                            <div className="font-bold text-green-600">
                              {shippingCalculations[order.id].estimatedDays} dias úteis
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total com Frete:</span>
                            <span className="font-bold text-lg text-green-600">
                              {formatPrice(order.totalPrice + shippingCalculations[order.id].cost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Valor do Produto:</div>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(order.totalPrice || 0)}
                      </span>
                      {shippingCalculations[order.id] && (
                        <div className="text-xs text-gray-500 mt-1">
                          + {formatPrice(shippingCalculations[order.id].cost)} frete
                        </div>
                      )}
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