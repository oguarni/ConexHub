import React, { memo, useCallback, useMemo } from 'react';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { useOptimizedSearch } from '../../hooks/useDebounceSearch';
import { categories } from '../../utils/constants';
import SecuritySanitizer from '../../utils/sanitizer';

const OptimizedSearchAndFilters = memo(({ 
  onFiltersChange, 
  initialFilters = {},
  showAdvancedFilters = false,
  className = ''
}) => {
  // ✅ Hook otimizado com debounce
  const {
    searchTerm,
    updateSearchTerm,
    clearSearch,
    filters,
    updateFilter,
    clearFilters,
    clearAll,
    isLoading,
    hasActiveSearch,
    hasActiveFilters
  } = useOptimizedSearch(onFiltersChange, {
    category: 'Todas',
    minPrice: '',
    maxPrice: '',
    supplier: '',
    ...initialFilters
  });

  // ✅ Categorias sanitizadas
  const sanitizedCategories = useMemo(() => 
    categories.map(cat => SecuritySanitizer.sanitizeText(cat)),
    []
  );

  // ✅ Handler otimizado para input de busca
  const handleSearchChange = useCallback((e) => {
    const value = SecuritySanitizer.sanitizeText(e.target.value);
    updateSearchTerm(value);
  }, [updateSearchTerm]);

  // ✅ Handler para seleção de categoria
  const handleCategoryChange = useCallback((category) => {
    const sanitizedCategory = SecuritySanitizer.sanitizeText(category);
    updateFilter('category', sanitizedCategory);
  }, [updateFilter]);

  // ✅ Handler para filtros de preço
  const handlePriceChange = useCallback((field, value) => {
    const numericValue = value.replace(/[^\d.,]/g, '');
    updateFilter(field, numericValue);
  }, [updateFilter]);

  // ✅ Limpar filtros específicos
  const clearSearchOnly = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  const clearFiltersOnly = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // ✅ Verificar se há filtros ativos
  const hasActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (hasActiveSearch) count++;
    if (filters.category !== 'Todas') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.supplier) count++;
    return count;
  }, [hasActiveSearch, filters]);

  return (
    <div className={`bg-white shadow-sm sticky top-14 z-30 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        {/* ✅ Linha principal de busca */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* ✅ Campo de busca acessível */}
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">
              Buscar produtos
            </label>
            
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              size={20} 
              aria-hidden="true"
            />
            
            <input
              id="product-search"
              type="search"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-describedby="search-help"
              autoComplete="off"
              maxLength={100}
            />
            
            {/* ✅ Loading indicator */}
            {isLoading && (
              <Loader2 
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" 
                size={16}
                aria-hidden="true"
              />
            )}
            
            {/* ✅ Botão limpar busca */}
            {hasActiveSearch && (
              <button
                onClick={clearSearchOnly}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Limpar busca"
                tabIndex={0}
              >
                <X size={16} />
              </button>
            )}
            
            <div id="search-help" className="sr-only">
              Digite pelo menos 2 caracteres para buscar produtos
            </div>
          </div>
          
          {/* ✅ Filtros de categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {sanitizedCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={filters.category === category}
                role="button"
                tabIndex={0}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Filtros avançados */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <Filter size={16} className="mr-2 text-gray-600" aria-hidden="true" />
              <h3 className="text-sm font-medium text-gray-700">Filtros Avançados</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ✅ Filtro de preço mínimo */}
              <div>
                <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Mínimo
                </label>
                <input
                  id="min-price"
                  type="text"
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  aria-describedby="min-price-help"
                />
                <div id="min-price-help" className="sr-only">
                  Digite o valor mínimo em reais
                </div>
              </div>
              
              {/* ✅ Filtro de preço máximo */}
              <div>
                <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Máximo
                </label>
                <input
                  id="max-price"
                  type="text"
                  placeholder="R$ 999.999,99"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  aria-describedby="max-price-help"
                />
                <div id="max-price-help" className="sr-only">
                  Digite o valor máximo em reais
                </div>
              </div>
              
              {/* ✅ Filtro de fornecedor */}
              <div>
                <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <input
                  id="supplier-filter"
                  type="text"
                  placeholder="Nome do fornecedor"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.supplier}
                  onChange={(e) => updateFilter('supplier', SecuritySanitizer.sanitizeText(e.target.value))}
                  maxLength={50}
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ Indicadores e ações */}
        <div className="flex items-center justify-between mt-4">
          {/* ✅ Indicador de filtros ativos */}
          <div className="flex items-center space-x-4">
            {hasActiveFiltersCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {hasActiveFiltersCount} filtro{hasActiveFiltersCount !== 1 ? 's' : ''} ativo{hasActiveFiltersCount !== 1 ? 's' : ''}
                </span>
                
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  aria-label={`Limpar todos os ${hasActiveFiltersCount} filtros`}
                >
                  Limpar todos
                </button>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                <span>Buscando produtos...</span>
              </div>
            )}
          </div>

          {/* ✅ Resultados info */}
          <div className="text-sm text-gray-500">
            {hasActiveSearch && (
              <span>Resultados para "{searchTerm}"</span>
            )}
          </div>
        </div>

        {/* ✅ Tags de filtros ativos */}
        {(hasActiveSearch || hasActiveFilters) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hasActiveSearch && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Busca: "{searchTerm}"
                <button 
                  onClick={clearSearchOnly}
                  className="ml-1 hover:text-blue-900 focus:outline-none"
                  aria-label="Remover filtro de busca"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.category !== 'Todas' && (
              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Categoria: {filters.category}
                <button 
                  onClick={() => updateFilter('category', 'Todas')}
                  className="ml-1 hover:text-green-900 focus:outline-none"
                  aria-label="Remover filtro de categoria"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.minPrice && (
              <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Min: R$ {filters.minPrice}
                <button 
                  onClick={() => updateFilter('minPrice', '')}
                  className="ml-1 hover:text-purple-900 focus:outline-none"
                  aria-label="Remover filtro de preço mínimo"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.maxPrice && (
              <span className="inline-flex items-center bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                Max: R$ {filters.maxPrice}
                <button 
                  onClick={() => updateFilter('maxPrice', '')}
                  className="ml-1 hover:text-orange-900 focus:outline-none"
                  aria-label="Remover filtro de preço máximo"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedSearchAndFilters.displayName = 'OptimizedSearchAndFilters';

export default OptimizedSearchAndFilters;