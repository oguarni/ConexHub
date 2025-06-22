import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Calculator } from 'lucide-react';
import { useQuotation } from '../../contexts/QuotationContext';
import useUIStore from '../../stores/uiStore';

const QuotationModal = () => {
  const { modals, hideModal } = useUIStore();
  const {
    quotationItems,
    shippingCost,
    updateQuantity,
    removeFromQuotation,
    clearQuotation,
    calculateSubtotal,
    calculateTotal,
    calculateShipping,
    setIsCheckoutOpen
  } = useQuotation();

  const [cep, setCep] = useState('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const isOpen = modals.showQuotation;

  const handleClose = () => {
    hideModal('showQuotation');
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCalculateShipping = async () => {
    if (!cep || cep.length < 8) {
      alert('Por favor, digite um CEP válido (8 dígitos)');
      return;
    }

    setIsCalculatingShipping(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    calculateShipping(cep);
    setIsCalculatingShipping(false);
  };

  const handleProceedToCheckout = () => {
    if (quotationItems.length === 0) {
      alert('Adicione produtos à cotação primeiro');
      return;
    }
    
    handleClose();
    setIsCheckoutOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCep = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numericValue.length <= 5) {
      return numericValue;
    } else {
      return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }
  };

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Cotação ({quotationItems.length} {quotationItems.length === 1 ? 'item' : 'itens'})
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Items List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {quotationItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sua cotação está vazia
                </h3>
                <p className="text-gray-500">
                  Adicione produtos para começar a cotação
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotationItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="text-3xl bg-gray-50 p-3 rounded-lg">
                      {item.image || '📦'}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        {formatCurrency(item.price)} por {item.unit}
                      </p>
                      {item.minOrder > 1 && (
                        <p className="text-xs text-gray-400">
                          Mín: {item.minOrder} {item.unit}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= item.minOrder}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromQuotation(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Clear All Button */}
                {quotationItems.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={clearQuotation}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Limpar toda a cotação
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          {quotationItems.length > 0 && (
            <div className="lg:w-80 bg-gray-50 p-6 border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo da Cotação
              </h3>

              {/* Shipping Calculator */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calcular Frete
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCalculateShipping}
                    disabled={isCalculatingShipping || cep.length < 8}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isCalculatingShipping ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Calculator size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-medium">
                    {shippingCost > 0 ? formatCurrency(shippingCost) : 'A calcular'}
                  </span>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Finalizar Cotação
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>

              {/* Info Note */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  Esta é uma cotação simulada. Os preços podem variar conforme disponibilidade e condições comerciais.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;