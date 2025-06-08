import React from 'react';
import { X, FileText, Package, Building } from 'lucide-react';

const QuoteModal = ({ 
  show, 
  onClose, 
  product, 
  user, 
  quoteForm, 
  setQuoteForm, 
  onSubmitQuote, 
  loading 
}) => {
  if (!show || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmitQuote();
  };

  const calculateTotal = () => {
    return (product.price * quoteForm.quantity).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-backdrop">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="text-green-600" size={24} />
              <h2 className="text-xl font-bold">Solicitar Cotação</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Informações do produto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{product.image}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Building size={14} className="mr-1" />
                    {product.Supplier?.companyName || 'Fornecedor'}
                  </span>
                  <span className="flex items-center">
                    <Package size={14} className="mr-1" />
                    Min: {product.minOrder || 1} {product.unit}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    R$ {parseFloat(product.price).toFixed(2)} /{product.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min={product.minOrder || 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={quoteForm.quantity || 1}
                  onChange={(e) => setQuoteForm({...quoteForm, quantity: parseInt(e.target.value) || 1})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo: {product.minOrder || 1} {product.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgência
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={quoteForm.urgency || 'normal'}
                  onChange={(e) => setQuoteForm({...quoteForm, urgency: e.target.value})}
                >
                  <option value="normal">Normal (30 dias)</option>
                  <option value="urgent">Urgente (15 dias)</option>
                  <option value="express">Express (7 dias)</option>
                </select>
              </div>
            </div>

            {/* Endereço de entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de entrega
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                value={quoteForm.deliveryAddress || ''}
                onChange={(e) => setQuoteForm({...quoteForm, deliveryAddress: e.target.value})}
                placeholder="Endereço completo para entrega"
              />
            </div>

            {/* Especificações adicionais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações adicionais
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                value={quoteForm.specifications || ''}
                onChange={(e) => setQuoteForm({...quoteForm, specifications: e.target.value})}
                placeholder="Certificações, normas técnicas, especificações especiais, etc."
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem adicional
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                value={quoteForm.message || ''}
                onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                placeholder="Informações adicionais para o fornecedor"
              />
            </div>

            {/* Resumo */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Resumo da Cotação</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{quoteForm.quantity || 1} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço unitário base:</span>
                  <span>R$ {parseFloat(product.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Valor estimado:</span>
                  <span>R$ {calculateTotal()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  * Valor estimado. O fornecedor enviará cotação oficial com preços finais.
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Solicitar Cotação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;