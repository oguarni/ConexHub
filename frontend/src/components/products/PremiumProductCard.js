import React, { useState } from 'react';
import { 
  Package, 
  Building, 
  MapPin, 
  Star, 
  Eye, 
  ShoppingCart,
  Truck,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const PremiumProductCard = ({ product, onRequestQuote, user }) => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  const canRequest = user && (user.role === 'buyer' || user.role === 'admin');
  const isOwner = user && user.role === 'supplier' && product.supplierId === user.id;

  // Enhanced product images with fallback
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [getProductImageUrl(product)];

  function getProductImageUrl(product) {
    // Map categories to professional images
    const imageMap = {
      'Machinery': `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&crop=center`,
      'Raw Materials': `https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&crop=center`,
      'Components': `https://images.unsplash.com/photo-1518709268805-4e9042af2ac5?w=400&h=300&fit=crop&crop=center`,
      'Tools': `https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&crop=center`,
      'Equipment': `https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=400&h=300&fit=crop&crop=center`
    };
    
    return imageMap[product.category] || `https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center`;
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getSupplierRating = () => {
    // Simulate supplier rating
    return 4.2 + Math.random() * 0.8;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Machinery': '🏭',
      'Raw Materials': '🔧',
      'Components': '⚙️',
      'Tools': '🔨',
      'Equipment': '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
      {/* Product Image Section */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Award size={12} className="mr-1" />
              {t('featured')}
            </div>
          </div>
        )}

        {/* Verified Supplier Badge */}
        {product.Supplier?.verified && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-green-500 text-white p-2 rounded-full">
              <Shield size={14} />
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full h-full">
          <img
            src={productImages[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center`;
            }}
          />
          
          {/* Image Navigation */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Image Dots */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700 flex items-center">
            <span className="mr-1">{getCategoryIcon(product.category)}</span>
            {t(product.category.toLowerCase().replace(' ', ''))}
          </div>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-5">
        {/* Product Title & Supplier */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Building size={14} className="mr-1" />
              <span className="font-medium">{product.Supplier?.companyName || t('supplier')}</span>
              
              {/* Supplier Rating */}
              <div className="flex items-center ml-2">
                <Star size={12} className="text-yellow-400 fill-current" />
                <span className="text-xs ml-1">{getSupplierRating().toFixed(1)}</span>
              </div>
            </div>
            
            {/* Stock Indicator */}
            <div className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-700' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {product.stock > 10 ? 'Em Estoque' : product.stock > 0 ? 'Pouco Estoque' : 'Sob Consulta'}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center">
            <Package size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-600">
              Min: {product.minOrder} {product.unit}
            </span>
          </div>
          
          <div className="flex items-center">
            <Truck size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Entrega: 7-15 dias</span>
          </div>
        </div>

        {/* Specifications Preview */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('specifications')}</span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 text-xs hover:underline flex items-center"
              >
                <Eye size={12} className="mr-1" />
                {showDetails ? 'Ocultar' : 'Ver mais'}
              </button>
            </div>
            
            {showDetails && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
            </div>
            
            {/* Price per quantity calculator */}
            <div className="text-right text-xs text-gray-500">
              <div>Min. {formatPrice(product.price * product.minOrder)}</div>
              <div>({product.minOrder} {product.unit})</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isOwner ? (
            <div className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg text-center text-sm font-medium flex items-center justify-center">
              <Package size={16} className="mr-2" />
              Seu Produto
            </div>
          ) : canRequest ? (
            <button
              onClick={() => onRequestQuote(product)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium flex items-center justify-center group"
            >
              <ShoppingCart size={16} className="mr-2 group-hover:scale-110 transition-transform" />
              {t('requestQuote')}
            </button>
          ) : (
            <button
              onClick={() => onRequestQuote(product)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <ShoppingCart size={16} className="mr-2" />
              {t('login')} para Cotar
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <MapPin size={12} className="mr-1" />
            <span>São Paulo, SP</span>
          </div>
          <div>
            ID: {product.id.slice(-8)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumProductCard;