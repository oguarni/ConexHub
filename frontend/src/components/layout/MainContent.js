// components/layout/MainContent.js
import React from 'react';
import SearchAndFilters from '../products/SearchAndFilters';
import ProductGrid from '../products/ProductGrid';
import ErrorMessage from '../common/ErrorMessage';
import { useAppContext } from '../../contexts';

const MainContent = () => {
  const { 
    products,
    auth,
    handleRequestQuote
  } = useAppContext();

  return (
    <main className="container mx-auto px-4 py-8">
      <SearchAndFilters />
      
      {products.error && (
        <ErrorMessage message={products.error} />
      )}
      
      <ProductGrid 
        products={products.products} 
        loading={products.loading}
        onRequestQuote={handleRequestQuote}
        user={auth.user}
      />
    </main>
  );
};

export default MainContent;