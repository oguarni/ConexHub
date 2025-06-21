import React, { memo, useMemo, useCallback } from 'react';
import { FileText, Building, Package, ShoppingCart } from 'lucide-react';
import { useQuotation } from '../../contexts/QuotationContext';
import { useLegacyAppContext } from "../../contexts/AppProvider";

const ProductCard = memo(({ product, onRequestQuote, user }) => {
  const { addToQuotation } = useQuotation();
  const { addNotification, updateUI } = useLegacyAppContext();
  
  const userPermissions = useMemo(() => ({
    canRequest: user && (user.role === 'buyer' || user.role === 'admin'),
    isSupplier: user && user.role === 'supplier',
    isOwner: user && user.role === 'supplier' && product.supplierId === user.id
  }), [user?.role, user?.id, product.supplierId]);

  const handleQuoteClick = useCallback(() => {
    console.log('Quote button clicked');
    onRequestQuote(product);
  }, [onRequestQuote, product.id]);

  const handleAddToQuotation = useCallback(() => {
    console.log('📋 Add to Quotation clicked!', product.name, 'User:', user?.email);
    
    if (!user) {
      addNotification({
        type: 'error',
        message: 'Faça login para adicionar produtos à cotação'
      });
      return;
    }

    if (product.stock <= 0) {
      addNotification({
        type: 'error',
        message: 'Produto fora de estoque'
      });
      return;
    }

    console.log('📦 Adding to quotation:', product.name, 'Quantity:', product.minOrder || 1);
    addToQuotation(product, product.minOrder || 1);
    addNotification({
      type: 'success',
      message: `${product.name} adicionado à cotação!`
    });
  }, [addToQuotation, product, user, addNotification]);

  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(product.price), 
    [product.price]
  );

  const renderActionButton = useCallback(() => {
    if (userPermissions.canRequest && !userPermissions.isOwner) {
      return (
        <button
          onClick={handleQuoteClick}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center space-x-2 font-medium"
          aria-label={`Solicitar cotação para ${product.name}`}
        >
          <FileText size={18} />
          <span>Solicitar Cotação</span>
        </button>
      );
    }

    if (userPermissions.isOwner) {
      return (
        <div className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg text-center text-sm font-medium">
          Seu Produto
        </div>
      );
    }

    if (userPermissions.isSupplier) {
      return (
        <div className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg text-center text-sm font-medium">
          Produto de outro fornecedor
        </div>
      );
    }

    return (
      <button
        onClick={handleQuoteClick}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center space-x-2 font-medium"
        aria-label="Fazer login para solicitar cotação"
      >
        <FileText size={18} />
        <span>Login para Cotar</span>
      </button>
    );
  }, [userPermissions, handleQuoteClick, product.name]);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* Product Image */}
        <div className="text-4xl mb-3 text-center bg-gradient-to-br from-gray-50 to-gray-100 py-4 rounded-lg">
          {product.image}
        </div>
        
        {/* Product Info */}
        <div className="mb-3 flex-1">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <p className="text-xs text-blue-600 mb-2">
            <span className="inline-flex items-center">
              <Building size={12} className="mr-1" />
              {product.Supplier?.companyName || product.supplier || 'Fornecedor Industrial'}
            </span>
          </p>
          <p className="text-sm text-gray-600 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        </div>
        
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-blue-600">
              {formattedPrice}
            </span>
            <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
          </div>
          {product.discount && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>
        
        {/* Product Details */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package size={14} className="mr-1 flex-shrink-0" />
            <span>Mín: {product.minOrder || 1} {product.unit}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Add to Quotation Button */}
          {user && user.role === 'buyer' && (
            <button
              onClick={handleAddToQuotation}
              disabled={product.stock <= 0}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Adicionar ${product.name} à cotação`}
            >
              <ShoppingCart size={18} />
              <span>{product.stock <= 0 ? 'Sem Estoque' : 'Adicionar à Cotação'}</span>
            </button>
          )}
          
          {/* Quote Button */}
          {renderActionButton()}
        </div>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // Comparação otimizada para evitar re-renders desnecessários
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.supplierId === nextProps.product.supplierId &&
    prevProps.user?.role === nextProps.user?.role &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.onRequestQuote === nextProps.onRequestQuote
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;