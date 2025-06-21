import React, { useState } from 'react';
import { apiService } from '../services/api';

const DebugProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setRawResponse('');
    
    try {
      console.log('Testing API directly...');
      const response = await apiService.getProducts();
      console.log('API Response:', response);
      setRawResponse(JSON.stringify(response, null, 2));
      setProducts(response.products || []);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debug-container debug-page">
      <h1 className="debug-title">Debug Products API</h1>
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        className="debug-button"
        style={{ marginBottom: '20px' }}
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>

      {error && (
        <div className="debug-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {rawResponse && (
        <div className="debug-section">
          <h3>Raw API Response:</h3>
          <pre className="debug-response">
            {rawResponse}
          </pre>
        </div>
      )}

      <div>
        <h3>Products Array ({products.length} items):</h3>
        {products.length > 0 ? (
          <ul>
            {products.map((product, index) => (
              <li key={product.id || index} style={{ marginBottom: '10px' }}>
                <strong>{product.name}</strong> - {product.category} - R$ {product.price}
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
};

export default DebugProducts;