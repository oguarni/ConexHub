import React from 'react';
import { FileText } from 'lucide-react';

const QuoteSuccessMessage = ({ show, quoteId }) => {
  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm fade-in">
      <div className="flex items-center space-x-2 mb-2">
        <FileText size={24} />
        <span className="font-semibold">Cotação solicitada com sucesso!</span>
      </div>
      <p className="text-sm">ID da Cotação: {quoteId}</p>
      <p className="text-xs mt-1">O fornecedor responderá em até 48 horas.</p>
    </div>
  );
};

export default QuoteSuccessMessage;