import React from 'react';
import { X, FileText, Check, Building, Package } from 'lucide-react';

const QuoteComparisonModal = ({ 
  show, 
  onClose, 
  quotes, 
  onAcceptQuote, 
  loading 
}) => {
  if (!show) return null;

  const handleAcceptQuote = async (quoteId) => {
    const success = await onAcceptQuote(quoteId, 'accepted');
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-backdrop">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold">Comparar Cotações</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma cotação para comparar
              </h3>
              <p className="text-gray-500">
                Aguarde as respostas dos fornecedores
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map(quote => (
                <div key={quote.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{quote.productImage || '📦'}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{quote.productName}</h3>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Building size={14} />
                            <span>{quote.supplierName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">Quantidade</div>
                          <div className="font-semibold flex items-center">
                            <Package size={16} className="mr-1" />
                            {quote.quantity} {quote.unit}
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">Preço Unitário</div>
                          <div className="font-semibold text-blue-600">
                            R$ {parseFloat(quote.unitPrice || 0).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="font-bold text-green-600 text-lg">
                            R$ {parseFloat(quote.totalPrice || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {quote.deliveryTime && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Prazo de entrega: </span>
                          <span className="font-medium">{quote.deliveryTime} dias</span>
                        </div>
                      )}
                      
                      {quote.notes && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-1">Observações:</div>
                          <div className="text-sm bg-white p-2 rounded border">
                            {quote.notes}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Cotação enviada em: {new Date(quote.updatedAt || quote.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {quote.status === 'responded' && (
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Check size={16} />
                          <span>Aceitar</span>
                        </button>
                      )}
                      
                      {quote.status === 'accepted' && (
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center space-x-1">
                          <Check size={14} />
                          <span>Aceita</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteComparisonModal;