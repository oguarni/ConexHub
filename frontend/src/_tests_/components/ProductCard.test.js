import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../src/components/products/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    supplier: 'Test Supplier'
  };

  test('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  test('should call onRequestQuote when clicked', () => {
    const mockOnRequest = jest.fn();
    render(
      <ProductCard 
        product={mockProduct} 
        onRequestQuote={mockOnRequest}
        user={{ role: 'buyer' }}
      />
    );
    
    fireEvent.click(screen.getByText('Solicitar Cotação'));
    expect(mockOnRequest).toHaveBeenCalledWith(mockProduct);
  });
});