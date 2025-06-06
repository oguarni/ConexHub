import React, { memo, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Package } from 'lucide-react';
import ProductCard from './ProductCard';

// const ITEM_HEIGHT = 400;
// const ITEM_WIDTH = 300;
const ITEM_PADDING = 12;

// Grid item otimizado com memo
const GridItem = memo(({ columnIndex, rowIndex, style, data }) => {
  const { products, onRequestQuote, user, itemsPerRow } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const product = products[index];

  if (!product) return <div style={style} />;

  return (
    <div style={{ 
      ...style, 
      padding: ITEM_PADDING / 2,
      display: 'flex',
      alignItems: 'stretch'
    }}>
      <ProductCard 
        product={product} 
        onRequestQuote={onRequestQuote} 
        user={user} 
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';

// Skeleton otimizado para windowing
const ProductGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-96">
        <div className="p-4 h-full flex flex-col">
          <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mt-auto"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded mt-4"></div>
        </div>
      </div>
    ))}
  </div>
));

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

// Empty state otimizado
const EmptyState = memo(() => (
  <div className="text-center py-16">
    <Package className="mx-auto mb-4 text-gray-400" size={80} />
    <h3 className="text-xl font-medium text-gray-900 mb-2">
      Nenhum produto encontrado
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      Não há produtos que correspondem aos seus critérios de busca. 
      Tente ajustar os filtros ou termos de pesquisa.
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const ProductGrid = memo(({ products = [], loading = false, onRequestQuote, user }) => {
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [useWindowing, setUseWindowing] = useState(false);

  // ✅ Decidir quando usar windowing baseado na quantidade de produtos
  useEffect(() => {
    setUseWindowing(products.length > 20); // Windowing para 20+ produtos
  }, [products.length]);

  // ✅ Calcular items por linha responsivamente
  const itemsPerRow = useMemo(() => {
    if (containerWidth === 0) return 1;
    
    // Breakpoints responsivos
    if (containerWidth < 768) return 1;      // mobile
    if (containerWidth < 1024) return 2;     // tablet
    if (containerWidth < 1280) return 3;     // desktop small
    return 4;                                // desktop large
  }, [containerWidth]);

  // ✅ Calcular número de linhas
  const rowCount = useMemo(() => 
    Math.ceil(products.length / itemsPerRow), 
    [products.length, itemsPerRow]
  );

  // ✅ ResizeObserver para responsividade
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerWidth(width);
      setContainerHeight(Math.min(height, 800)); // Max height 800px
    });

    resizeObserver.observe(containerRef.current);
    
    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    setContainerWidth(rect.width);
    setContainerHeight(Math.min(rect.height || 600, 800));

    return () => resizeObserver.disconnect();
  }, []);

  // ✅ Dados memoizados para o grid
  const gridData = useMemo(() => ({
    products: products.filter(Boolean), // Remove null/undefined
    onRequestQuote,
    user,
    itemsPerRow
  }), [products, onRequestQuote, user, itemsPerRow]);

  // ✅ Callback memoizado para evitar re-renders
  const memoizedOnRequestQuote = useCallback((product) => {
    if (typeof onRequestQuote === 'function') {
      onRequestQuote(product);
    }
  }, [onRequestQuote]);

  // ✅ Fallback para grid tradicional (produtos < 20)
  const renderTraditionalGrid = useCallback(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product} 
          onRequestQuote={memoizedOnRequestQuote} 
          user={user} 
        />
      ))}
    </div>
  ), [products, memoizedOnRequestQuote, user]);

  // ✅ Render windowed grid para listas grandes
  const renderWindowedGrid = useCallback(() => {
    if (containerWidth === 0) return null;

    return (
      <Grid
        columnCount={itemsPerRow}
        rowCount={rowCount}
        columnWidth={containerWidth / itemsPerRow}
        rowHeight={ITEM_HEIGHT}
        width={containerWidth}
        height={containerHeight}
        itemData={gridData}
        overscanRowCount={2} // Pre-render 2 rows ahead
        overscanColumnCount={1}
        style={{ outline: 'none' }}
      >
        {GridItem}
      </Grid>
    );
  }, [containerWidth, containerHeight, itemsPerRow, rowCount, gridData]);

  // ✅ Header com informações
  const headerInfo = useMemo(() => {
    if (loading || products.length === 0) return null;
    
    const count = products.length;
    return {
      count,
      text: `Mostrando ${count} produto${count !== 1 ? 's' : ''}`,
      windowing: useWindowing
    };
  }, [loading, products.length, useWindowing]);

  // ✅ Loading state
  if (loading) {
    return <ProductGridSkeleton />;
  }

  // ✅ Empty state
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      {/* Header with product count and performance info */}
      {headerInfo && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              {headerInfo.text}
            </p>
            {headerInfo.windowing && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <Package size={12} className="mr-1" />
                Windowing ativo
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Package size={14} />
            <span>Produtos industriais certificados</span>
          </div>
        </div>
      )}
      
      {/* Grid Container */}
      <div 
        ref={containerRef} 
        className="w-full"
        style={{ 
          minHeight: useWindowing ? containerHeight : 'auto',
          position: 'relative'
        }}
      >
        {useWindowing ? renderWindowedGrid() : renderTraditionalGrid()}
      </div>
      
      {/* Performance hint */}
      {products.length > 50 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Package size={16} />
            <span>
              Mostrando {products.length} produtos com otimização de performance ativa
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;