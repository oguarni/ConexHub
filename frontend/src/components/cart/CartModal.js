import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAppContext } from '../../contexts/AppProvider';

const CartModal = () => {
  const { 
    items, 
    shipping, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    setShipping,
    calculateShipping,
    getSubtotal, 
    getItemsCount, 
    getTotal 
  } = useCart();
  
  const { uiState, hideModal, showModal, addNotification } = useAppContext();
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState(null);
  const [cepInput, setCepInput] = useState(shipping.cep || '');

  if (!uiState.showCart) return null;

  console.log('🛒 CartModal render:', { 
    itemsCount: items.length, 
    items: items,
    shipping: shipping 
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCalculateShipping = async () => {
    if (cepInput.length !== 8) {
      addNotification({
        type: 'error',
        message: 'CEP deve ter 8 dígitos'
      });
      return;
    }

    setShippingLoading(true);
    try {
      const options = await calculateShipping(cepInput);
      setShippingOptions(options);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao calcular frete'
      });
    }
    setShippingLoading(false);
  };

  const handleSelectShipping = (option, optionData) => {
    setShipping({
      cep: cepInput,
      method: option,
      cost: optionData.cost,
      estimatedDays: optionData.days,
      name: optionData.name
    });
    addNotification({
      type: 'success',
      message: `Frete ${optionData.name} selecionado`
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      addNotification({
        type: 'error',
        message: 'Carrinho vazio'
      });
      return;
    }

    hideModal('showCart');
    showModal('showCheckout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div className="flex items-center">
            <ShoppingCart className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Carrinho ({getItemsCount()} {getItemsCount() === 1 ? 'item' : 'itens'})
            </h2>
          </div>
          <button
            onClick={() => hideModal('showCart')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm mt-2">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)} / {item.unit}</p>
                      <p className="text-xs text-gray-400">Estoque: {item.stock}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-4"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="ml-4 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Calculator */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <Truck className="text-blue-600 mr-2" size={20} />
                  <h3 className="font-medium">Calcular Frete</h3>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="CEP (somente números)"
                    value={cepInput}
                    onChange={(e) => setCepInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCalculateShipping}
                    disabled={shippingLoading || cepInput.length !== 8}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {shippingLoading ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>

                {shippingOptions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(shippingOptions).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => handleSelectShipping(key, option)}
                        className={`p-3 border rounded-lg text-left hover:bg-blue-50 ${
                          shipping.method === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-600">
                          {option.cost === 0 ? 'Grátis' : formatPrice(option.cost)} - {option.days} dias
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border-t pt-6 bg-gray-50 -mx-6 px-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Frete ({shipping.name || 'Não calculado'}):</span>
                    <span>
                      {shipping.cost === 0 ? 'Grátis' : formatPrice(shipping.cost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Limpar Carrinho
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;