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
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Products API</h1>
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff0000',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {rawResponse && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Raw API Response:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
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