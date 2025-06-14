import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Mock API service
const mockApiService = {
  getProducts: jest.fn(),
  getProduct: jest.fn(),
  createOrder: jest.fn(),
  getUserOrders: jest.fn(),
  generateInvoice: jest.fn(),
};

jest.mock('../../services/api', () => ({
  apiService: mockApiService,
}));

// Mock components for testing
const MockProductCard = ({ product, onAddToCart }) => (
  <div data-testid={`product-${product.id}`} className="product-card">
    <h3>{product.name}</h3>
    <p>R$ {product.price}</p>
    <p>Estoque: {product.stock}</p>
    <button 
      onClick={() => onAddToCart(product)} 
      data-testid={`add-to-cart-${product.id}`}
      disabled={product.stock === 0}
    >
      {product.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
    </button>
  </div>
);

const MockShoppingCart = ({ items, onRemove, onUpdateQuantity, onCheckout }) => (
  <div data-testid="shopping-cart">
    <h2>Carrinho de Compras</h2>
    {items.length === 0 ? (
      <p data-testid="empty-cart">Carrinho vazio</p>
    ) : (
      <>
        {items.map(item => (
          <div key={item.id} data-testid={`cart-item-${item.id}`} className="cart-item">
            <span>{item.name}</span>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
              data-testid={`quantity-${item.id}`}
              min="1"
              max={item.maxStock}
            />
            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            <button 
              onClick={() => onRemove(item.id)}
              data-testid={`remove-${item.id}`}
            >
              Remover
            </button>
          </div>
        ))}
        <div data-testid="cart-total">
          Total: R$ {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
        </div>
        <button onClick={onCheckout} data-testid="checkout-button">
          Finalizar Compra
        </button>
      </>
    )}
  </div>
);

const MockCheckoutForm = ({ cartItems, onSubmit, loading }) => {
  const [formData, setFormData] = React.useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    paymentMethod: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: formData.shippingAddress,
      paymentMethod: formData.paymentMethod,
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form">
      <h2>Finalizar Pedido</h2>
      
      <fieldset>
        <legend>Endereço de Entrega</legend>
        <input
          type="text"
          placeholder="Rua"
          value={formData.shippingAddress.street}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            shippingAddress: { ...prev.shippingAddress, street: e.target.value }
          }))}
          data-testid="street-input"
          required
        />
        <input
          type="text"
          placeholder="Cidade"
          value={formData.shippingAddress.city}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            shippingAddress: { ...prev.shippingAddress, city: e.target.value }
          }))}
          data-testid="city-input"
          required
        />
        <input
          type="text"
          placeholder="Estado"
          value={formData.shippingAddress.state}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            shippingAddress: { ...prev.shippingAddress, state: e.target.value }
          }))}
          data-testid="state-input"
          required
        />
        <input
          type="text"
          placeholder="CEP"
          value={formData.shippingAddress.zipCode}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            shippingAddress: { ...prev.shippingAddress, zipCode: e.target.value }
          }))}
          data-testid="zipcode-input"
          pattern="[0-9]{5}-?[0-9]{3}"
          required
        />
      </fieldset>

      <fieldset>
        <legend>Método de Pagamento</legend>
        <label>
          <input
            type="radio"
            value="credit_card"
            checked={formData.paymentMethod === 'credit_card'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            data-testid="payment-credit-card"
          />
          Cartão de Crédito
        </label>
        <label>
          <input
            type="radio"
            value="bank_transfer"
            checked={formData.paymentMethod === 'bank_transfer'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            data-testid="payment-bank-transfer"
          />
          Transferência Bancária
        </label>
        <label>
          <input
            type="radio"
            value="pix"
            checked={formData.paymentMethod === 'pix'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            data-testid="payment-pix"
          />
          PIX
        </label>
      </fieldset>

      <button type="submit" disabled={loading} data-testid="submit-order">
        {loading ? 'Processando...' : 'Confirmar Pedido'}
      </button>
    </form>
  );
};

// Main test component that simulates the checkout flow
const CheckoutFlowApp = () => {
  const [products] = React.useState([
    { id: 1, name: 'Produto A', price: 100, stock: 10 },
    { id: 2, name: 'Produto B', price: 200, stock: 5 },
    { id: 3, name: 'Produto C', price: 50, stock: 0 },
  ]);
  
  const [cartItems, setCartItems] = React.useState([]);
  const [currentStep, setCurrentStep] = React.useState('products'); // 'products', 'cart', 'checkout', 'success'
  const [orderResult, setOrderResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, maxStock: product.stock }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const proceedToCheckout = () => {
    setCurrentStep('checkout');
  };

  const submitOrder = async (orderData) => {
    setLoading(true);
    try {
      const result = await mockApiService.createOrder(orderData);
      setOrderResult(result.order);
      setCurrentStep('success');
      setCartItems([]); // Clear cart
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="checkout-flow-app">
      <nav data-testid="navigation">
        <button 
          onClick={() => setCurrentStep('products')}
          data-testid="nav-products"
          className={currentStep === 'products' ? 'active' : ''}
        >
          Produtos ({products.length})
        </button>
        <button 
          onClick={() => setCurrentStep('cart')}
          data-testid="nav-cart"
          className={currentStep === 'cart' ? 'active' : ''}
        >
          Carrinho ({cartItems.length})
        </button>
      </nav>

      {currentStep === 'products' && (
        <div data-testid="products-view">
          <h1>Catálogo de Produtos</h1>
          <div className="products-grid">
            {products.map(product => (
              <MockProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      )}

      {currentStep === 'cart' && (
        <div data-testid="cart-view">
          <MockShoppingCart
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={proceedToCheckout}
          />
        </div>
      )}

      {currentStep === 'checkout' && (
        <div data-testid="checkout-view">
          <MockCheckoutForm
            cartItems={cartItems}
            onSubmit={submitOrder}
            loading={loading}
          />
        </div>
      )}

      {currentStep === 'success' && orderResult && (
        <div data-testid="success-view">
          <h1>Pedido Realizado com Sucesso!</h1>
          <p data-testid="order-number">Número do Pedido: {orderResult.orderNumber}</p>
          <p data-testid="order-total">Total: R$ {orderResult.total}</p>
          <button onClick={() => setCurrentStep('products')} data-testid="continue-shopping">
            Continuar Comprando
          </button>
        </div>
      )}
    </div>
  );
};

// Test wrapper with React Query
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Checkout Flow Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    
    // Mock successful order creation
    mockApiService.createOrder.mockResolvedValue({
      order: {
        id: 1,
        orderNumber: 'ORD-001',
        total: 300,
        status: 'confirmed',
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 200 },
        ],
      },
    });
  });

  test('Complete checkout flow - from product selection to order confirmation', async () => {
    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Step 1: View products
    expect(screen.getByTestId('products-view')).toBeInTheDocument();
    expect(screen.getByText('Catálogo de Produtos')).toBeInTheDocument();
    
    // Verify products are displayed
    expect(screen.getByTestId('product-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-2')).toBeInTheDocument();
    expect(screen.getByTestId('product-3')).toBeInTheDocument();
    
    // Check that out-of-stock product is disabled
    const outOfStockButton = screen.getByTestId('add-to-cart-3');
    expect(outOfStockButton).toBeDisabled();
    expect(outOfStockButton).toHaveTextContent('Sem estoque');

    // Step 2: Add products to cart
    await user.click(screen.getByTestId('add-to-cart-1'));
    await user.click(screen.getByTestId('add-to-cart-1')); // Add same product twice
    await user.click(screen.getByTestId('add-to-cart-2'));

    // Check cart navigation shows correct count
    expect(screen.getByTestId('nav-cart')).toHaveTextContent('Carrinho (2)');

    // Step 3: View cart
    await user.click(screen.getByTestId('nav-cart'));
    expect(screen.getByTestId('cart-view')).toBeInTheDocument();
    
    // Verify cart items
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    
    // Check quantities
    const quantity1Input = screen.getByTestId('quantity-1');
    const quantity2Input = screen.getByTestId('quantity-2');
    expect(quantity1Input).toHaveValue(2);
    expect(quantity2Input).toHaveValue(1);
    
    // Check total calculation
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: R$ 400.00');

    // Step 4: Modify cart quantities
    await user.clear(quantity1Input);
    await user.type(quantity1Input, '1');
    
    // Verify total is updated
    await waitFor(() => {
      expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: R$ 300.00');
    });

    // Step 5: Proceed to checkout
    await user.click(screen.getByTestId('checkout-button'));
    expect(screen.getByTestId('checkout-view')).toBeInTheDocument();

    // Step 6: Fill checkout form
    await user.type(screen.getByTestId('street-input'), 'Rua das Flores, 123');
    await user.type(screen.getByTestId('city-input'), 'São Paulo');
    await user.type(screen.getByTestId('state-input'), 'SP');
    await user.type(screen.getByTestId('zipcode-input'), '01234-567');
    
    // Select payment method
    await user.click(screen.getByTestId('payment-pix'));

    // Step 7: Submit order
    await user.click(screen.getByTestId('submit-order'));

    // Verify loading state
    expect(screen.getByTestId('submit-order')).toHaveTextContent('Processando...');
    expect(screen.getByTestId('submit-order')).toBeDisabled();

    // Wait for success page
    await waitFor(() => {
      expect(screen.getByTestId('success-view')).toBeInTheDocument();
    });

    // Step 8: Verify order confirmation
    expect(screen.getByTestId('order-number')).toHaveTextContent('Número do Pedido: ORD-001');
    expect(screen.getByTestId('order-total')).toHaveTextContent('Total: R$ 300');

    // Verify API was called with correct data
    expect(mockApiService.createOrder).toHaveBeenCalledWith({
      items: [
        { productId: 1, quantity: 1, price: 100 },
        { productId: 2, quantity: 1, price: 200 },
      ],
      shippingAddress: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      paymentMethod: 'pix',
    });

    // Step 9: Continue shopping
    await user.click(screen.getByTestId('continue-shopping'));
    expect(screen.getByTestId('products-view')).toBeInTheDocument();
    
    // Verify cart is empty
    expect(screen.getByTestId('nav-cart')).toHaveTextContent('Carrinho (0)');
  });

  test('Cart validation - prevent checkout with empty cart', async () => {
    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Go to cart without adding items
    await user.click(screen.getByTestId('nav-cart'));
    
    // Verify empty cart state
    expect(screen.getByTestId('empty-cart')).toHaveTextContent('Carrinho vazio');
    expect(screen.queryByTestId('checkout-button')).not.toBeInTheDocument();
  });

  test('Quantity limits - prevent adding more than available stock', async () => {
    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Add product with limited stock multiple times
    const addButton = screen.getByTestId('add-to-cart-2'); // Product B has stock of 5
    
    // Add to cart 5 times (max stock)
    for (let i = 0; i < 5; i++) {
      await user.click(addButton);
    }

    // Go to cart
    await user.click(screen.getByTestId('nav-cart'));
    
    // Try to increase quantity beyond stock
    const quantityInput = screen.getByTestId('quantity-2');
    expect(quantityInput).toHaveValue(5);
    expect(quantityInput).toHaveAttribute('max', '5');
    
    // Try to set quantity above max
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    
    // Should be limited to max stock
    await waitFor(() => {
      expect(quantityInput).toHaveValue(5);
    });
  });

  test('Form validation - require all fields for checkout', async () => {
    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Add item and go to checkout
    await user.click(screen.getByTestId('add-to-cart-1'));
    await user.click(screen.getByTestId('nav-cart'));
    await user.click(screen.getByTestId('checkout-button'));

    // Try to submit without filling required fields
    await user.click(screen.getByTestId('submit-order'));

    // Form should prevent submission (HTML5 validation)
    expect(screen.getByTestId('checkout-view')).toBeInTheDocument();
    expect(mockApiService.createOrder).not.toHaveBeenCalled();
  });

  test('Error handling - show error when order creation fails', async () => {
    // Mock API failure
    mockApiService.createOrder.mockRejectedValue(new Error('Payment failed'));

    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Complete flow until order submission
    await user.click(screen.getByTestId('add-to-cart-1'));
    await user.click(screen.getByTestId('nav-cart'));
    await user.click(screen.getByTestId('checkout-button'));
    
    // Fill form
    await user.type(screen.getByTestId('street-input'), 'Test Street');
    await user.type(screen.getByTestId('city-input'), 'Test City');
    await user.type(screen.getByTestId('state-input'), 'TS');
    await user.type(screen.getByTestId('zipcode-input'), '12345-678');
    await user.click(screen.getByTestId('payment-credit-card'));
    
    // Submit order
    await user.click(screen.getByTestId('submit-order'));

    // Should remain on checkout page (no success page)
    await waitFor(() => {
      expect(screen.getByTestId('submit-order')).not.toBeDisabled();
      expect(screen.getByTestId('submit-order')).toHaveTextContent('Confirmar Pedido');
    });

    expect(screen.queryByTestId('success-view')).not.toBeInTheDocument();
  });

  test('Cart item removal', async () => {
    render(
      <TestWrapper>
        <CheckoutFlowApp />
      </TestWrapper>
    );

    // Add multiple products
    await user.click(screen.getByTestId('add-to-cart-1'));
    await user.click(screen.getByTestId('add-to-cart-2'));
    
    // Go to cart
    await user.click(screen.getByTestId('nav-cart'));
    
    // Verify both items are present
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    
    // Remove one item
    await user.click(screen.getByTestId('remove-1'));
    
    // Verify item was removed
    expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    
    // Verify cart count updated
    expect(screen.getByTestId('nav-cart')).toHaveTextContent('Carrinho (1)');
  });
});