import React, { memo, useMemo, useCallback } from 'react';
import { FileText, Building, Package } from 'lucide-react';
import SecuritySanitizer from '../../utils/sanitizer';

const SecureProductCard = memo(({ product, onRequestQuote, user }) => {
  // ✅ Sanitização segura dos dados
  const sanitizedProduct = useMemo(() => ({
    ...product,
    name: SecuritySanitizer.sanitizeText(product.name || ''),
    description: SecuritySanitizer.sanitizeHTML(product.description || ''),
    supplier: SecuritySanitizer.sanitizeText(product.supplier || 'Fornecedor Industrial'),
    category: SecuritySanitizer.sanitizeText(product.category || ''),
    image: SecuritySanitizer.sanitizeProductIcon(product.image)
  }), [product]);

  const userPermissions = useMemo(() => ({
    canRequest: user && (user.role === 'buyer' || user.role === 'admin'),
    isSupplier: user && user.role === 'supplier',
    isOwner: user && user.role === 'supplier' && product.supplierId === user.id
  }), [user?.role, user?.id, product.supplierId]);

  const handleQuoteClick = useCallback(() => {
    onRequestQuote(sanitizedProduct);
  }, [onRequestQuote, sanitizedProduct]);

  const formattedPrice = useMemo(() => {
    const price = parseFloat(product.price);
    if (isNaN(price)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, [product.price]);

  // ✅ Melhor acessibilidade
  const ariaLabel = `Produto ${sanitizedProduct.name}, categoria ${sanitizedProduct.category}, preço ${formattedPrice}`;
  const buttonAriaLabel = userPermissions.canRequest 
    ? `Solicitar cotação para ${sanitizedProduct.name}`
    : 'Fazer login para solicitar cotação';

  const renderActionButton = useCallback(() => {
    if (userPermissions.canRequest && !userPermissions.isOwner) {
      return (
        <button
          onClick={handleQuoteClick}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-medium"
          aria-label={buttonAriaLabel}
          role="button"
          tabIndex={0}
        >
          <FileText size={18} aria-hidden="true" />
          <span>Solicitar Cotação</span>
        </button>
      );
    }

    if (userPermissions.isOwner) {
      return (
        <div 
          className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg text-center text-sm font-medium"
          role="status"
          aria-label="Este é seu produto"
        >
          Seu Produto
        </div>
      );
    }

    if (userPermissions.isSupplier) {
      return (
        <div 
          className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg text-center text-sm font-medium"
          role="status"
          aria-label="Produto de outro fornecedor"
        >
          Produto de outro fornecedor
        </div>
      );
    }

    return (
      <button
        onClick={handleQuoteClick}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-medium"
        aria-label="Fazer login para solicitar cotação"
        role="button"
        tabIndex={0}
      >
        <FileText size={18} aria-hidden="true" />
        <span>Login para Cotar</span>
      </button>
    );
  }, [userPermissions, handleQuoteClick, buttonAriaLabel]);

  // ✅ Renderização condicional segura
  if (!sanitizedProduct.id || !sanitizedProduct.name) {
    return (
      <div 
        className="bg-gray-100 rounded-lg p-4 text-center text-gray-500"
        role="status"
        aria-label="Produto inválido"
      >
        Produto indisponível
      </div>
    );
  }

  return (
    <article 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col focus-within:ring-2 focus-within:ring-blue-500"
      aria-label={ariaLabel}
      role="article"
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* ✅ Ícone seguro do produto */}
        <div 
          className="text-4xl mb-3 text-center bg-gradient-to-br from-gray-50 to-gray-100 py-4 rounded-lg"
          role="img"
          aria-label={`Ícone do produto: ${sanitizedProduct.name}`}
        >
          {sanitizedProduct.image}
        </div>
        
        {/* ✅ Informações do produto */}
        <div className="mb-3 flex-1">
          <h3 
            className="font-semibold text-gray-800 mb-1 line-clamp-1" 
            title={sanitizedProduct.name}
            id={`product-name-${sanitizedProduct.id}`}
          >
            {sanitizedProduct.name}
          </h3>
          
          <div className="text-xs text-blue-600 mb-2">
            <span className="inline-flex items-center">
              <Building size={12} className="mr-1" aria-hidden="true" />
              <span aria-label={`Fornecedor: ${sanitizedProduct.supplier}`}>
                {sanitizedProduct.supplier}
              </span>
            </span>
          </div>
          
          <p 
            className="text-sm text-gray-600 line-clamp-2" 
            title={sanitizedProduct.description}
            // ✅ Renderização segura de HTML sanitizado
            dangerouslySetInnerHTML={{ 
              __html: sanitizedProduct.description 
            }}
            aria-describedby={`product-name-${sanitizedProduct.id}`}
          />
        </div>
        
        {/* ✅ Badge de categoria */}
        <div className="mb-3">
          <span 
            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
            role="badge"
            aria-label={`Categoria: ${sanitizedProduct.category}`}
          >
            {sanitizedProduct.category}
          </span>
        </div>
        
        {/* ✅ Seção de preço acessível */}
        <div className="flex items-baseline justify-between mb-3">
          <div role="group" aria-label="Informações de preço">
            <span 
              className="text-xl font-bold text-blue-600"
              aria-label={`Preço: ${formattedPrice}`}
            >
              {formattedPrice}
            </span>
            <span 
              className="text-sm text-gray-500 ml-1"
              aria-label={`por ${product.unit}`}
            >
              /{product.unit}
            </span>
          </div>
          
          {product.discount && (
            <span 
              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full"
              role="badge"
              aria-label={`Desconto de ${product.discount}%`}
            >
              -{product.discount}%
            </span>
          )}
        </div>
        
        {/* ✅ Detalhes do produto */}
        <div className="mb-4">
          <div 
            className="flex items-center text-sm text-gray-600"
            role="group"
            aria-label="Quantidade mínima"
          >
            <Package size={14} className="mr-1 flex-shrink-0" aria-hidden="true" />
            <span>
              Mín: {product.minQuantity || 1} {product.unit}
            </span>
          </div>
        </div>
        
        {/* ✅ Botão de ação */}
        {renderActionButton()}
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // ✅ Comparação otimizada para memo
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.supplierId === nextProps.product.supplierId &&
    prevProps.user?.role === nextProps.user?.role &&
    prevProps.user?.id === nextProps.user?.id
  );
});

SecureProductCard.displayName = 'SecureProductCard';

export default SecureProductCard;