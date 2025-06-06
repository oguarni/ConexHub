import React from 'react';
import { X, FileText, Clock, CheckCircle, Building } from 'lucide-react';

const QuotesSidebar = ({ 
  showQuotes, 
  setShowQuotes, 
  quotes, 
  loading, 
  user,
  setShowQuoteComparison,
  setShowAuth 
}) => {
  if (!showQuotes) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'responded':
        return <FileText size={16} className="text-blue-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Aguardando resposta';
      case 'responded':
        return 'Cotação recebida';
      case 'accepted':
        return 'Cotação aceita';
      case 'rejected':
        return 'Cotação rejeitada';
      default:
        return status;
    }
  };

  const respondedQuotes = quotes.filter(q => q.status === 'responded');

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <FileText size={20} />
              <span>Minhas Cotações</span>
            </h2>
            <button onClick={() => setShowQuotes(false)}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto cart-scroll p-4">
          {!user ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-600 mb-4">Faça login para ver suas cotações</p>
              <button
                onClick={() => {
                  setShowQuotes(false);
                  setShowAuth(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Fazer Login
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Carregando cotações...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-600">Nenhuma cotação solicitada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map(quote => (
                <div key={quote.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{quote.productName}</h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                        <Building size={12} />
                        <span>{quote.supplierName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(quote.status)}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Quantidade:</span>
                      <span>{quote.quantity} {quote.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{getStatusText(quote.status)}</span>
                    </div>
                    {quote.totalPrice && (
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>R$ {parseFloat(quote.totalPrice).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Solicitado em: {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && respondedQuotes.length > 0 && (
          <div className="p-4 border-t">
            <button
              onClick={() => {
                setShowQuotes(false);
                setShowQuoteComparison(true);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <FileText size={18} />
              <span>Comparar Cotações ({respondedQuotes.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesSidebar;