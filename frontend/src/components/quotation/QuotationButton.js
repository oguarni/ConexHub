import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useQuotation } from '../../contexts/QuotationContext';
import { useLegacyAppContext } from "../../contexts/AppProvider";

const QuotationButton = () => {
  const { quotationItems, getQuotationCount } = useQuotation();
  const { updateUI } = useLegacyAppContext();
  
  const itemCount = getQuotationCount();

  const handleClick = () => {
    updateUI({ showQuotation: true });
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
      aria-label={`Cotação - ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
    >
      <ShoppingCart size={20} />
      <span className="hidden sm:inline text-sm">Cotação</span>
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default QuotationButton;