import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Star, Clock, ShoppingCart, Eye } from 'lucide-react';
import { apiService } from '../../services/api';

const ProductCard = ({ product, onAddToCart, onViewDetails, onTrackInteraction }) => {
  const handleCardClick = () => {
    onTrackInteraction(product.id, 'view');
    onViewDetails(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onTrackInteraction(product.id, 'add_to_cart');
    onAddToCart(product);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{product.image || '📦'}</span>
        {product.reason && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {product.reason}
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-green-600">
          R$ {parseFloat(product.price).toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">/{product.unit}</span>
      </div>
      
      <button
        onClick={handleAddToCart}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
      >
        <ShoppingCart size={16} />
        <span>Solicitar Cotação</span>
      </button>
    </div>
  );
};

const RecommendationSection = ({ 
  title, 
  icon: Icon, 
  products, 
  loading, 
  onAddToCart, 
  onViewDetails, 
  onTrackInteraction 
}) => {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="text-blue-600" size={20} />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
            onTrackInteraction={onTrackInteraction}
          />
        ))}
      </div>
      {products.length > 4 && (
        <div className="text-center mt-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Ver mais recomendações
          </button>
        </div>
      )}
    </div>
  );
};

const RelatedProducts = ({ productId, onAddToCart, onViewDetails, onTrackInteraction }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadRelatedProducts();
    }
  }, [productId]);

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/recommendations/related/${productId}`);
      setRelatedProducts(response.relatedProducts || []);
    } catch (error) {
      console.error('Erro ao carregar produtos relacionados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecommendationSection
      title="Produtos Relacionados"
      icon={Star}
      products={relatedProducts}
      loading={loading}
      onAddToCart={onAddToCart}
      onViewDetails={onViewDetails}
      onTrackInteraction={onTrackInteraction}
    />
  );
};

const RecommendationEngine = ({ 
  user, 
  productId, 
  onAddToCart, 
  onViewDetails,
  showPersonalized = true,
  showTrending = true,
  showNew = true,
  showRelated = false
}) => {
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState({
    personalized: false,
    trending: false,
    new: false
  });

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    try {
      if (showPersonalized && user) {
        setLoading(prev => ({ ...prev, personalized: true }));
        try {
          const personalizedResponse = await apiService.get('/recommendations/personalized');
          setPersonalizedProducts(personalizedResponse.recommendations || []);
        } catch (error) {
          console.error('Erro ao carregar recomendações personalizadas:', error);
        } finally {
          setLoading(prev => ({ ...prev, personalized: false }));
        }
      }

      if (showTrending) {
        setLoading(prev => ({ ...prev, trending: true }));
        try {
          const trendingResponse = await apiService.get('/recommendations/trending');
          setTrendingProducts(trendingResponse.trendingProducts || []);
        } catch (error) {
          console.error('Erro ao carregar produtos em alta:', error);
        } finally {
          setLoading(prev => ({ ...prev, trending: false }));
        }
      }

      if (showNew) {
        setLoading(prev => ({ ...prev, new: true }));
        try {
          const newResponse = await apiService.get('/recommendations/new');
          setNewProducts(newResponse.newProducts || []);
        } catch (error) {
          console.error('Erro ao carregar produtos novos:', error);
        } finally {
          setLoading(prev => ({ ...prev, new: false }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    }
  };

  const trackInteraction = async (productId, action) => {
    try {
      if (user) {
        await apiService.post('/recommendations/track-interaction', {
          productId,
          action
        });
      }
    } catch (error) {
      console.error('Erro ao rastrear interação:', error);
    }
  };

  const handleAddToCart = (product) => {
    trackInteraction(product.id, 'add_to_cart');
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewDetails = (product) => {
    trackInteraction(product.id, 'view_details');
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div className="space-y-8">
      {showPersonalized && user && (
        <RecommendationSection
          title="Recomendado para Você"
          icon={Sparkles}
          products={personalizedProducts}
          loading={loading.personalized}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onTrackInteraction={trackInteraction}
        />
      )}

      {showRelated && productId && (
        <RelatedProducts
          productId={productId}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onTrackInteraction={trackInteraction}
        />
      )}

      {showTrending && (
        <RecommendationSection
          title="Produtos em Alta"
          icon={TrendingUp}
          products={trendingProducts}
          loading={loading.trending}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onTrackInteraction={trackInteraction}
        />
      )}

      {showNew && (
        <RecommendationSection
          title="Produtos Recém-Adicionados"
          icon={Clock}
          products={newProducts}
          loading={loading.new}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onTrackInteraction={trackInteraction}
        />
      )}
    </div>
  );
};

export default RecommendationEngine;
export { RelatedProducts };