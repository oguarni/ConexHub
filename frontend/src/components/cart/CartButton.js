import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLegacyAppContext } from "../../contexts/AppProvider";

const CartButton = () => {
  const { getItemsCount } = useCart();
  const { showModal } = useLegacyAppContext();
  const itemsCount = getItemsCount();

  return (
    <button
      onClick={() => showModal('showCart')}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      title="Ver carrinho"
    >
      <ShoppingCart size={24} />
      {itemsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
          {itemsCount > 99 ? '99+' : itemsCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;