import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock, Calculator, MapPin } from 'lucide-react';
import { apiService } from '../../services/api';

const OrdersModal = ({ show, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingCalculations, setShippingCalculations] = useState({});
  const [calculatingShipping, setCalculatingShipping] = useState({});
  const [shippingCeps, setShippingCeps] = useState({});

  useEffect(() => {
    if (show && user) {
      loadOrders();
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to load from API first
      try {
        const data = user.role === 'supplier' 
          ? await apiService.getSupplierOrders()
          : await apiService.getUserOrders();
        setOrders(data.orders || []);
      } catch (apiError) {
        // If API fails, use sample data
        console.log('API not available, using sample orders');
        const sampleOrders = generateSampleOrders(user);
        setOrders(sampleOrders);
      }
    } catch (error) {
      setError('Erro ao carregar pedidos');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleOrders = (user) => {
    if (user.role === 'supplier') {
      return [
        {
          id: 1,
          orderNumber: 'PED-2024-001',
          productName: 'Furadeira Industrial HD-2000',
          quantity: 2,
          unit: 'un',
          supplierName: user.companyName || 'Sua Empresa',
          supplierEmail: user.email,
          totalPrice: 2599.98,
          status: 'pending',
          createdAt: new Date('2024-06-10').toISOString()
        },
        {
          id: 2,
          orderNumber: 'PED-2024-002',
          productName: 'Motor Elétrico Trifásico 5CV',
          quantity: 1,
          unit: 'un',
          supplierName: user.companyName || 'Sua Empresa',
          supplierEmail: user.email,
          totalPrice: 2450.00,
          status: 'confirmed',
          createdAt: new Date('2024-06-08').toISOString()
        },
        {
          id: 5,
          orderNumber: 'PED-2024-005',
          productName: 'Compressor de Ar 50L',
          quantity: 3,
          unit: 'un',
          supplierName: user.companyName || 'Sua Empresa',
          supplierEmail: user.email,
          totalPrice: 5550.00,
          status: 'shipped',
          createdAt: new Date('2024-06-07').toISOString()
        }
      ];
    } else {
      return [
        {
          id: 3,
          orderNumber: 'COT-2024-003',
          productName: 'Chapa de Aço Inox 304',
          quantity: 20,
          unit: 'm²',
          supplierName: 'Metalúrgica São Paulo',
          supplierEmail: 'vendas@metalsp.com.br',
          totalPrice: 1790.00,
          status: 'shipped',
          createdAt: new Date('2024-06-09').toISOString()
        },
        {
          id: 4,
          orderNumber: 'COT-2024-004',
          productName: 'Válvula Pneumática 1/2"',
          quantity: 10,
          unit: 'un',
          supplierName: 'Pneumática Industrial',
          supplierEmail: 'pedidos@pneumatica.com.br',
          totalPrice: 1567.50,
          status: 'delivered',
          createdAt: new Date('2024-06-05').toISOString()
        },
        {
          id: 6,
          orderNumber: 'COT-2024-006',
          productName: 'Torno CNC Compacto',
          quantity: 1,
          unit: 'un',
          supplierName: 'CNC Brasil Máquinas',
          supplierEmail: 'vendas@cncbrasil.com.br',
          totalPrice: 45000.00,
          status: 'pending',
          createdAt: new Date('2024-06-11').toISOString()
        },
        {
          id: 7,
          orderNumber: 'COT-2024-007',
          productName: 'Parafusos Inox M8 (Lote)',
          quantity: 100,
          unit: 'un',
          supplierName: 'Fixadores Industriais',
          supplierEmail: 'vendas@fixadores.com.br',
          totalPrice: 850.00,
          status: 'confirmed',
          createdAt: new Date('2024-06-06').toISOString()
        }
      ];
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      try {
        await apiService.updateOrderStatus(orderId, status);
      } catch (apiError) {
        // If API fails, update locally
        console.log('API not available, updating status locally');
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status } 
              : order
          )
        );
        return; // Don't reload orders if updating locally
      }
      await loadOrders();
    } catch (error) {
      setError('Erro ao atualizar status do pedido');
    }
  };

  // Shipping calculation functions
  const calculateShipping = (order, cep) => {
    if (!cep || cep.length < 8) return 0;

    // Simular diferentes custos baseado no CEP e características do pedido
    const baseShipping = 25.50;
    const productWeight = order.quantity * 0.5; // 0.5kg por unidade
    const productValue = order.totalPrice || 0;
    
    // Multiplicador baseado na região (primeiro dígito do CEP)
    const region = cep.charAt(0);
    const regionMultipliers = {
      '0': 1.8, // São Paulo
      '1': 1.5, // São Paulo interior
      '2': 1.3, // Rio de Janeiro
      '3': 1.4, // Minas Gerais
      '4': 1.6, // Bahia
      '5': 1.7, // Paraná
      '6': 1.9, // Pernambuco
      '7': 1.8, // Ceará
      '8': 2.0, // Pará
      '9': 2.2  // Rondônia
    };
    
    const regionMultiplier = regionMultipliers[region] || 1.5;
    
    // Cálculo do frete
    let shippingCost = baseShipping + (productWeight * 2.5);
    shippingCost *= regionMultiplier;
    
    // Taxa adicional para produtos caros (seguro)
    if (productValue > 1000) {
      shippingCost += productValue * 0.01; // 1% do valor como seguro
    }
    
    // Desconto para grandes quantidades
    if (order.quantity >= 10) {
      shippingCost *= 0.85; // 15% de desconto
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
    const region = cep.charAt(0);
    const deliveryDays = {
      '0': 2, // São Paulo
      '1': 3, // São Paulo interior
      '2': 3, // Rio de Janeiro
      '3': 4, // Minas Gerais
      '4': 6, // Bahia
      '5': 4, // Paraná
      '6': 7, // Pernambuco
      '7': 8, // Ceará
      '8': 10, // Pará
      '9': 12  // Rondônia
    };
    
    return deliveryDays[region] || 5;
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