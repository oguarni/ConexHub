import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ Hook otimizado para busca com debounce
export const useDebounceSearch = (
  initialValue = '',
  delay = 300,
  minLength = 2
) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  // ✅ Limpar timeout anterior e criar novo
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(() => {
      // Só atualizar se atender critério mínimo
      if (searchTerm.length === 0 || searchTerm.length >= minLength) {
        setDebouncedValue(searchTerm);
      }
      setIsSearching(false);
    }, delay);

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, delay, minLength]);

  // ✅ Atualizar termo de busca
  const updateSearchTerm = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // ✅ Limpar busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedValue('');
    setIsSearching(false);
  }, []);

  // ✅ Busca imediata (bypass debounce)
  const searchImmediately = useCallback((value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchTerm(value);
    setDebouncedValue(value);
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    debouncedValue,
    isSearching,
    updateSearchTerm,
    clearSearch,
    searchImmediately,
    hasValue: debouncedValue.length > 0,
    meetsMinLength: searchTerm.length >= minLength
  };
};

// ✅ Hook para múltiplos filtros com debounce
export const useDebounceFilters = (initialFilters = {}, delay = 300) => {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsFiltering(true);

    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsFiltering(false);
    }, delay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, delay]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setFilters(clearedFilters);
    setDebouncedFilters(clearedFilters);
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    isFiltering,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters: Object.values(debouncedFilters).some(v => v !== '')
  };
};

// ✅ SearchAndFilters otimizado
export const useOptimizedSearch = (onSearch, initialFilters = {}) => {
  const {
    searchTerm,
    debouncedValue: debouncedSearch,
    isSearching,
    updateSearchTerm,
    clearSearch
  } = useDebounceSearch('', 300, 2);

  const {
    filters,
    debouncedFilters,
    isFiltering,
    updateFilter,
    clearFilters
  } = useDebounceFilters(initialFilters, 300);

  // ✅ Executar busca quando valores debounceds mudarem
  useEffect(() => {
    const searchData = {
      search: debouncedSearch,
      ...debouncedFilters
    };

    onSearch(searchData);
  }, [debouncedSearch, debouncedFilters, onSearch]);

  const isLoading = isSearching || isFiltering;

  return {
    // Search
    searchTerm,
    updateSearchTerm,
    clearSearch,
    
    // Filters
    filters,
    updateFilter,
    clearFilters,
    
    // Combined
    clearAll: useCallback(() => {
      clearSearch();
      clearFilters();
    }, [clearSearch, clearFilters]),
    
    // State
    isLoading,
    hasActiveSearch: debouncedSearch.length > 0,
    hasActiveFilters: Object.values(debouncedFilters).some(v => v !== '')
  };
};

export default useDebounceSearch;