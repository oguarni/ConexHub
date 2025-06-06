import React, { memo, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Package, TrendingUp } from 'lucide-react';
import SecureProductCard from './SecureProductCard';
import { ProductsSkeleton } from '../common/LoadingStates';

const ITEM_HEIGHT = 420;
const ITEM_PADDING = 12;
const MIN_COLUMN_WIDTH = 280;

// ✅ Grid item memoizado com error boundary
const GridItem = memo(({ columnIndex, rowIndex, style, data }) => {
  const { products, onRequestQuote, user, itemsPerRow } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const product = products[index];

  if (!product) {
    return <div style={style} />;
  }

  return (
    <div 
      style={{ 
        ...style, 
        padding: ITEM_PADDING / 2,
        display: 'flex',
        alignItems: 'stretch'
      }}
      role="gridcell"
      aria-rowindex={rowIndex + 1}
      aria-colindex={columnIndex + 1}
    >
      <SecureProductCard 
        product={product} 
        onRequestQuote={onRequestQuote} 
        user={user} 
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Comparação otimizada
  const prevProduct = prevProps.data.products[
    prevProps.rowIndex * prevProps.data.itemsPerRow + prevProps.columnIndex
  ];
  const nextProduct = nextProps.data.products[
    nextProps.rowIndex * nextProps.data.itemsPerRow + nextProps.columnIndex
  ];
  
  return (
    prevProduct?.id === nextProduct?.id &&
    prevProduct?.price === nextProduct?.price &&
    prevProps.data.user?.id === nextProps.data.user?.id &&
    prevProps.style.height === nextProps.style.height &&
    prevProps.style.width === nextProps.style.width
  );
});

// ✅ Hook para dimensões responsivas
const useResponsiveDimensions = (containerRef) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 600,
    itemsPerRow: 1
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = Math.min(rect.height || 600, 800);
      
      // ✅ Calcular items por row baseado na largura
      const itemsPerRow = Math.max(1, Math.floor(width / MIN_COLUMN_WIDTH));
      
      setDimensions({ width, height, itemsPerRow });
    };

    // ✅ ResizeObserver para responsividade suave
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    // ✅ Update inicial
    updateDimensions();

    return () => resizeObserver.disconnect();
  }, []);

  return dimensions;
};

// ✅ Hook para métricas de performance
const usePerformanceMetrics = (products, isVirtualized) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    itemCount: 0,
    isOptimized: false
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // ✅ Medir tempo de render na próxima frame
    requestAnimationFrame(() => {
      const endTime = performance.now();
      
      setMetrics({
        renderTime: endTime - startTime,
        itemCount: products.length,
        isOptimized: isVirtualized
      });
    });
  }, [products.length, isVirtualized]);

  return metrics;
};

// ✅ Empty state otimizado
const EmptyState = memo(({ searchTerm, selectedCategory, onClearFilters }) => {
  const hasFilters = searchTerm || selectedCategory !== 'Todas';
  
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4"
      role="status"
      aria-live="polite"
    >
      <Package className="w-20 h-20 text-gray-300 mb-6" aria-hidden="true" />
      
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {hasFilters ? 'Nenhum produto encontrado' : 'Catálogo em carregamento'}
      </h3>
      
      <p className="text-gray-500 text-center max-w-md mb-4">
        {hasFilters 
          ? 'Não há produtos que correspondem aos seus critérios de busca.'
          : 'Os produtos industriais estão sendo carregados no sistema.'
        }
      </p>
      
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Limpar Filtros
        </button>
      )}
      
      <span className="sr-only">
        {hasFilters ? 'Nenhum resultado para os filtros aplicados' : 'Carregando produtos'}
      </span>
    </div>
  );
});

// ✅ Componente principal otimizado
const OptimizedProductGrid = memo(({ 
  products = [], 
  loading = false, 
  onRequestQuote, 
  user,
  searchTerm = '',
  selectedCategory = 'Todas',
  onClearFilters,
  virtualizationThreshold = 20,
  showMetrics = false
}) => {
  const containerRef = useRef();
  const gridRef = useRef();
  const { width, height, itemsPerRow } = useResponsiveDimensions(containerRef);
  
  // ✅ Decidir se usar virtualização
  const shouldVirtualize = products.length >= virtualizationThreshold;
  const performanceMetrics = usePerformanceMetrics(products, shouldVirtualize);

  // ✅ Dados memoizados para o grid
  const gridData = useMemo(() => ({
    products: products.filter(Boolean),
    onRequestQuote,
    user,
    itemsPerRow
  }), [products, onRequestQuote, user, itemsPerRow]);

  // ✅ Callback memoizado
  const memoizedOnRequestQuote = useCallback((product) => {
    if (typeof onRequestQuote === 'function') {
      onRequestQuote(product);
    }
  }, [onRequestQuote]);

  // ✅ Calcular dimensões do grid
  const { rowCount, columnWidth } = useMemo(() => {
    if (width === 0) return { rowCount: 0, columnWidth: 0 };
    
    return {
      rowCount: Math.ceil(products.length / itemsPerRow),
      columnWidth: width / itemsPerRow
    };
  }, [products.length, itemsPerRow, width]);

  // ✅ Scroll to top quando produtos mudarem
  useEffect(() => {
    if (gridRef.current && shouldVirtualize) {
      gridRef.current.scrollToItem({ rowIndex: 0, columnIndex: 0 });
    }
  }, [products.length, shouldVirtualize]);

  // ✅ Grid tradicional para poucos items
  const renderTraditionalGrid = useCallback(() => (
    <div 
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`
      }}
      role="grid"
      aria-label={`Grade de produtos com ${products.length} itens`}
    >
      {products.map((product, index) => (
        <div 
          key={product.id}
          role="gridcell"
          aria-rowindex={Math.floor(index / itemsPerRow) + 1}
          aria-colindex={(index % itemsPerRow) + 1}
        >
          <SecureProductCard 
            product={product} 
            onRequestQuote={memoizedOnRequestQuote} 
            user={user} 
          />
        </div>
      ))}
    </div>
  ), [products, itemsPerRow, memoizedOnRequestQuote, user]);

  // ✅ Grid virtualizado para muitos items
  const renderVirtualizedGrid = useCallback(() => {
    if (width === 0 || rowCount === 0) return null;

    return (
      <Grid
        ref={gridRef}
        columnCount={itemsPerRow}
        rowCount={rowCount}
        columnWidth={columnWidth}
        rowHeight={ITEM_HEIGHT}
        width={width}
        height={height}
        itemData={gridData}
        overscanRowCount={2}
        overscanColumnCount={1}
        style={{ outline: 'none' }}
        role="grid"
        aria-label={`Grade virtualizada com ${products.length} produtos`}
        aria-rowcount={rowCount}
        aria-colcount={itemsPerRow}
      >
        {GridItem}
      </Grid>
    );
  }, [
    width, height, rowCount, columnWidth, itemsPerRow, 
    gridData, products.length
  ]);

  // ✅ Header com informações
  const headerInfo = useMemo(() => {
    if (loading || products.length === 0) return null;
    
    const count = products.length;
    return {
      count,
      text: `${count} produto${count !== 1 ? 's' : ''}`,
      virtualized: shouldVirtualize,
      category: selectedCategory !== 'Todas' ? selectedCategory : null,
      searchActive: searchTerm.length > 0
    };
  }, [loading, products.length, shouldVirtualize, selectedCategory, searchTerm]);

  // ✅ Loading state
  if (loading) {
    return <ProductsSkeleton count={8} />;
  }

  // ✅ Empty state
  if (products.length === 0) {
    return (
      <EmptyState 
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ✅ Header com informações e métricas */}
      {(headerInfo || showMetrics) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {headerInfo && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Package size={16} className="text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">
                  {headerInfo.text}
                </span>
              </div>
              
              {headerInfo.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {headerInfo.category}
                </span>
              )}
              
              {headerInfo.searchActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Busca ativa
                </span>
              )}
              
              {headerInfo.virtualized && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  <TrendingUp size={12} className="mr-1" />
                  Otimizado
                </span>
              )}
            </div>
          )}
          
          {showMetrics && performanceMetrics.renderTime > 0 && (
            <div className="text-xs text-gray-500 space-x-4">
              <span>Render: {performanceMetrics.renderTime.toFixed(1)}ms</span>
              <span>Items: {performanceMetrics.itemCount}</span>
              {performanceMetrics.isOptimized && <span>Virtualizado</span>}
            </div>
          )}
        </div>
      )}
      
      {/* ✅ Grid Container */}
      <div 
        ref={containerRef} 
        className="w-full"
        style={{ 
          minHeight: shouldVirtualize ? height : 'auto',
          position: 'relative'
        }}
        role="region"
        aria-label="Lista de produtos"
      >
        {shouldVirtualize ? renderVirtualizedGrid() : renderTraditionalGrid()}
      </div>
      
      {/* ✅ Footer info para grids grandes */}
      {products.length > 50 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-blue-700">
              <Package size={16} />
              <span>
                Exibindo {products.length} produtos com otimização de performance
              </span>
            </div>
            
            <div className="text-blue-600">
              {shouldVirtualize ? 'Virtualização ativa' : 'Grid tradicional'}
            </div>
          </div>
          
          {performanceMetrics.renderTime > 100 && (
            <div className="mt-2 text-xs text-blue-600">
              💡 Dica: Use filtros para melhorar a performance com muitos produtos
            </div>
          )}
        </div>
      )}
    </div>
  );
});

GridItem.displayName = 'GridItem';
EmptyState.displayName = 'EmptyState';
OptimizedProductGrid.displayName = 'OptimizedProductGrid';

export default OptimizedProductGrid;