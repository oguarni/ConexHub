import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { categories } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const SearchAndFilters = memo(({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
  const searchInputRef = useRef(null);
  
  // Debounce search input for better performance
  const debouncedSetSearchTerm = useDebounce((value) => {
    setSearchTerm(value);
  }, 300);
  
  // Handle search input with debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);
  
  // Memoized category click handler
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);
  
  // Memoized categories buttons to prevent re-rendering
  const categoryButtons = useMemo(() => 
    categories.map(category => (
      <button
        key={category}
        onClick={() => handleCategoryClick(category)}
        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
          selectedCategory === category
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {category}
      </button>
    )), 
    [selectedCategory, handleCategoryClick]
  );
  
  // Focus search input on mount for better UX
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  return (
    <div className="bg-white shadow-sm sticky top-14 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categoryButtons}
          </div>
        </div>
      </div>
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

export default SearchAndFilters;