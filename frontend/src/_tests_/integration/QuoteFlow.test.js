import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Mock API service
const mockApiService = {
  getProducts: jest.fn(),
  requestQuote: jest.fn(),
  getBuyerQuotes: jest.fn(),
  getSupplierQuotes: jest.fn(),
  submitQuote: jest.fn(),
  acceptQuote: jest.fn(),
  rejectQuote: jest.fn(),
  createOrder: jest.fn(),
};

jest.mock('../../services/api', () => ({
  apiService: mockApiService,
}));

// Mock components for quote flow testing
const MockProductCard = ({ product, onRequestQuote, userRole }) => (
  <div data-testid={`product-${product.id}`} className="product-card">
    <h3>{product.name}</h3>
    <p>R$ {product.price}</p>
    <p>Mín. pedido: {product.minimumOrder}</p>
    <p>Fornecedor: {product.supplier?.companyName}</p>
    {userRole === 'buyer' && (
      <button 
        onClick={() => onRequestQuote(product)} 
        data-testid={`request-quote-${product.id}`}
      >
        Solicitar Cotação
      </button>
    )}
  </div>
);

const MockQuoteRequestForm = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = React.useState({
    quantity: product?.minimumOrder || 1,
    maxPrice: '',
    deliveryDate: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      productId: product.id,
      ...formData,
      quantity: parseInt(formData.quantity),
      maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="quote-request-form">
      <h2>Solicitar Cotação - {product.name}</h2>
      
      <label>
        Quantidade:
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          data-testid="quantity-input"
          min={product.minimumOrder}
          required
        />
      </label>

      <label>
        Preço máximo (opcional):
        <input
          type="number"
          step="0.01"
          value={formData.maxPrice}
          onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
          data-testid="max-price-input"
        />
      </label>

      <label>
        Data desejada de entrega:
        <input
          type="date"
          value={formData.deliveryDate}
          onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
          data-testid="delivery-date-input"
          min={new Date().toISOString().split('T')[0]}
        />
      </label>

      <label>
        Observações:
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          data-testid="notes-input"
          placeholder="Requisitos específicos, condições especiais, etc."
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={loading} data-testid="submit-quote-request">
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-quote-request">
          Cancelar
        </button>
      </div>
    </form>
  );
};

const MockQuoteCard = ({ quote, userRole, onSubmitResponse, onAccept, onReject }) => {
  const [showResponseForm, setShowResponseForm] = React.useState(false);
  const [responseData, setResponseData] = React.useState({
    unitPrice: '',
    deliveryDays: '',
    minimumQuantity: quote.quantity,
    notes: '',
  });

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    onSubmitResponse(quote.id, {
      ...responseData,
      unitPrice: parseFloat(responseData.unitPrice),
      deliveryDays: parseInt(responseData.deliveryDays),
      minimumQuantity: parseInt(responseData.minimumQuantity),
    });
    setShowResponseForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'responded': return 'blue';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div data-testid={`quote-${quote.id}`} className={`quote-card status-${quote.status}`}>
      <div className="quote-header">
        <h3>{quote.product?.name}</h3>
        <span 
          data-testid={`status-${quote.id}`}
          className={`status-badge ${getStatusColor(quote.status)}`}
        >
          {quote.status}
        </span>
      </div>

      <div className="quote-details">
        <p>Quantidade: {quote.quantity}</p>
        {quote.maxPrice && <p>Preço máximo: R$ {quote.maxPrice}</p>}
        {quote.deliveryDate && <p>Data desejada: {quote.deliveryDate}</p>}
        {quote.notes && <p>Observações: {quote.notes}</p>}
        
        {userRole === 'buyer' && (
          <p>Solicitado em: {new Date(quote.createdAt).toLocaleDateString()}</p>
        )}
        
        {userRole === 'supplier' && (
          <p>Solicitado por: {quote.buyer?.companyName}</p>
        )}
      </div>

      {/* Supplier response display */}
      {quote.supplierResponse && (
        <div className="supplier-response" data-testid={`response-${quote.id}`}>
          <h4>Resposta do Fornecedor:</h4>
          <p>Preço unitário: R$ {quote.supplierResponse.unitPrice}</p>
          <p>Prazo de entrega: {quote.supplierResponse.deliveryDays} dias</p>
          <p>Quantidade mínima: {quote.supplierResponse.minimumQuantity}</p>
          {quote.supplierResponse.notes && (
            <p>Observações: {quote.supplierResponse.notes}</p>
          )}
          <p>Total: R$ {(quote.supplierResponse.unitPrice * quote.quantity).toFixed(2)}</p>
        </div>
      )}

      {/* Actions based on user role and quote status */}
      <div className="quote-actions">
        {userRole === 'supplier' && quote.status === 'pending' && !showResponseForm && (
          <button 
            onClick={() => setShowResponseForm(true)}
            data-testid={`respond-quote-${quote.id}`}
          >
            Responder Cotação
          </button>
        )}

        {userRole === 'buyer' && quote.status === 'responded' && (
          <>
            <button 
              onClick={() => onAccept(quote.id)}
              data-testid={`accept-quote-${quote.id}`}
              className="accept-button"
            >
              Aceitar Cotação
            </button>
            <button 
              onClick={() => onReject(quote.id)}
              data-testid={`reject-quote-${quote.id}`}
              className="reject-button"
            >
              Rejeitar
            </button>
          </>
        )}
      </div>

      {/* Response form for suppliers */}
      {showResponseForm && (
        <form onSubmit={handleSubmitResponse} data-testid={`response-form-${quote.id}`}>
          <h4>Responder Cotação</h4>
          
          <label>
            Preço unitário (R$):
            <input
              type="number"
              step="0.01"
              value={responseData.unitPrice}
              onChange={(e) => setResponseData(prev => ({ ...prev, unitPrice: e.target.value }))}
              data-testid={`unit-price-${quote.id}`}
              required
            />
          </label>

          <label>
            Prazo de entrega (dias):
            <input
              type="number"
              value={responseData.deliveryDays}
              onChange={(e) => setResponseData(prev => ({ ...prev, deliveryDays: e.target.value }))}
              data-testid={`delivery-days-${quote.id}`}
              min="1"
              required
            />
          </label>

          <label>
            Quantidade mínima:
            <input
              type="number"
              value={responseData.minimumQuantity}
              onChange={(e) => setResponseData(prev => ({ ...prev, minimumQuantity: e.target.value }))}
              data-testid={`min-quantity-${quote.id}`}
              min="1"
              max={quote.quantity}
              required
            />
          </label>

          <label>
            Observações:
            <textarea
              value={responseData.notes}
              onChange={(e) => setResponseData(prev => ({ ...prev, notes: e.target.value }))}
              data-testid={`response-notes-${quote.id}`}
              placeholder="Condições especiais, detalhes técnicos, etc."
            />
          </label>

          <div className="form-actions">
            <button type="submit" data-testid={`submit-response-${quote.id}`}>
              Enviar Resposta
            </button>
            <button 
              type="button" 
              onClick={() => setShowResponseForm(false)}
              data-testid={`cancel-response-${quote.id}`}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Main quote flow application
const QuoteFlowApp = ({ userRole = 'buyer' }) => {
  const [products] = React.useState([
    {
      id: 1,
      name: 'Furadeira Industrial',
      price: 500,
      minimumOrder: 5,
      supplier: { id: 1, companyName: 'TechTools Ltda' }
    },
    {
      id: 2,
      name: 'Compressor de Ar',
      price: 1200,
      minimumOrder: 2,
      supplier: { id: 2, companyName: 'Industrial Supply' }
    },
  ]);

  const [quotes, setQuotes] = React.useState([]);
  const [currentView, setCurrentView] = React.useState('products'); // 'products', 'quotes', 'quote-form'
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Simulate quote request
  const requestQuote = async (quoteData) => {
    setLoading(true);
    try {
      const result = await mockApiService.requestQuote(quoteData);
      const newQuote = {
        id: Date.now(),
        ...quoteData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        product: products.find(p => p.id === quoteData.productId),
        buyer: { companyName: 'Empresa Compradora' },
        ...result.quote,
      };
      setQuotes(prev => [newQuote, ...prev]);
      setCurrentView('quotes');
    } catch (error) {
      console.error('Quote request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate supplier quote response
  const submitQuoteResponse = async (quoteId, responseData) => {
    setLoading(true);
    try {
      await mockApiService.submitQuote(quoteId, responseData);
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId
          ? { 
              ...quote, 
              status: 'responded',
              supplierResponse: {
                ...responseData,
                submittedAt: new Date().toISOString(),
              }
            }
          : quote
      ));
    } catch (error) {
      console.error('Quote response failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate quote acceptance
  const acceptQuote = async (quoteId) => {
    setLoading(true);
    try {
      const result = await mockApiService.acceptQuote(quoteId);
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: 'accepted' }
          : quote
      ));
    } catch (error) {
      console.error('Quote acceptance failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate quote rejection
  const rejectQuote = async (quoteId) => {
    setLoading(true);
    try {
      await mockApiService.rejectQuote(quoteId, { reason: 'Preço muito alto' });
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: 'rejected' }
          : quote
      ));
    } catch (error) {
      console.error('Quote rejection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = (product) => {
    setSelectedProduct(product);
    setCurrentView('quote-form');
  };

  const handleCancelQuoteForm = () => {
    setSelectedProduct(null);
    setCurrentView('products');
  };

  return (
    <div data-testid="quote-flow-app">
      <nav data-testid="navigation">
        <span data-testid="user-role">Usuário: {userRole}</span>
        <button 
          onClick={() => setCurrentView('products')}
          data-testid="nav-products"
          className={currentView === 'products' ? 'active' : ''}
        >
          Produtos
        </button>
        <button 
          onClick={() => setCurrentView('quotes')}
          data-testid="nav-quotes"
          className={currentView === 'quotes' ? 'active' : ''}
        >
          Cotações ({quotes.length})
        </button>
      </nav>

      {currentView === 'products' && (
        <div data-testid="products-view">
          <h1>Catálogo de Produtos</h1>
          <div className="products-grid">
            {products.map(product => (
              <MockProductCard
                key={product.id}
                product={product}
                userRole={userRole}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      )}

      {currentView === 'quotes' && (
        <div data-testid="quotes-view">
          <h1>
            {userRole === 'buyer' ? 'Minhas Cotações' : 'Cotações Recebidas'}
          </h1>
          {quotes.length === 0 ? (
            <p data-testid="no-quotes">Nenhuma cotação encontrada</p>
          ) : (
            <div className="quotes-list">
              {quotes.map(quote => (
                <MockQuoteCard
                  key={quote.id}
                  quote={quote}
                  userRole={userRole}
                  onSubmitResponse={submitQuoteResponse}
                  onAccept={acceptQuote}
                  onReject={rejectQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'quote-form' && selectedProduct && (
        <div data-testid="quote-form-view">
          <MockQuoteRequestForm
            product={selectedProduct}
            onSubmit={requestQuote}
            onCancel={handleCancelQuoteForm}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

// Test wrapper
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

describe('Quote Flow Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    // Setup default mock responses
    mockApiService.requestQuote.mockResolvedValue({
      quote: { id: 1, status: 'pending' }
    });

    mockApiService.submitQuote.mockResolvedValue({
      quote: { id: 1, status: 'responded' }
    });

    mockApiService.acceptQuote.mockResolvedValue({
      quote: { id: 1, status: 'accepted' },
      order: { id: 1, orderNumber: 'ORD-001' }
    });

    mockApiService.rejectQuote.mockResolvedValue({
      quote: { id: 1, status: 'rejected' }
    });
  });

  describe('Buyer Quote Flow', () => {
    test('Complete quote request flow - from product to quote submission', async () => {
      render(
        <TestWrapper>
          <QuoteFlowApp userRole="buyer" />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByTestId('user-role')).toHaveTextContent('Usuário: buyer');
      expect(screen.getByTestId('products-view')).toBeInTheDocument();

      // View available products
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();

      // Request quote for first product
      await user.click(screen.getByTestId('request-quote-1'));

      // Verify quote form is displayed
      expect(screen.getByTestId('quote-form-view')).toBeInTheDocument();
      expect(screen.getByTestId('quote-request-form')).toBeInTheDocument();

      // Fill quote request form
      const quantityInput = screen.getByTestId('quantity-input');
      expect(quantityInput).toHaveValue(5); // minimum order

      await user.clear(quantityInput);
      await user.type(quantityInput, '10');
      
      await user.type(screen.getByTestId('max-price-input'), '450');
      
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 30);
      await user.type(
        screen.getByTestId('delivery-date-input'),
        deliveryDate.toISOString().split('T')[0]
      );
      
      await user.type(
        screen.getByTestId('notes-input'),
        'Necessário certificado de qualidade'
      );

      // Submit quote request
      await user.click(screen.getByTestId('submit-quote-request'));

      // Verify loading state
      expect(screen.getByTestId('submit-quote-request')).toHaveTextContent('Enviando...');

      // Wait for redirect to quotes view
      await waitFor(() => {
        expect(screen.getByTestId('quotes-view')).toBeInTheDocument();
      });

      // Verify quote was created
      expect(screen.getByTestId('quote-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('pending');

      // Verify API was called with correct data
      expect(mockApiService.requestQuote).toHaveBeenCalledWith({
        productId: 1,
        quantity: 10,
        maxPrice: 450,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        notes: 'Necessário certificado de qualidade',
      });

      // Verify navigation shows quote count
      expect(screen.getByTestId('nav-quotes')).toHaveTextContent('Cotações (1)');
    });

    test('Quote acceptance flow - accept supplier response', async () => {
      // Start with a quote that has supplier response
      const QuoteFlowWithResponse = () => {
        const [quotes, setQuotes] = React.useState([
          {
            id: 1,
            productId: 1,
            quantity: 10,
            status: 'responded',
            createdAt: new Date().toISOString(),
            product: { id: 1, name: 'Furadeira Industrial' },
            buyer: { companyName: 'Empresa Compradora' },
            supplierResponse: {
              unitPrice: 450,
              deliveryDays: 15,
              minimumQuantity: 10,
              notes: 'Produto com garantia de 2 anos',
              submittedAt: new Date().toISOString(),
            }
          }
        ]);

        const acceptQuote = async (quoteId) => {
          await mockApiService.acceptQuote(quoteId);
          setQuotes(prev => prev.map(quote =>
            quote.id === quoteId ? { ...quote, status: 'accepted' } : quote
          ));
        };

        const rejectQuote = async (quoteId) => {
          await mockApiService.rejectQuote(quoteId);
          setQuotes(prev => prev.map(quote =>
            quote.id === quoteId ? { ...quote, status: 'rejected' } : quote
          ));
        };

        return (
          <div data-testid="quotes-view">
            <h1>Minhas Cotações</h1>
            {quotes.map(quote => (
              <MockQuoteCard
                key={quote.id}
                quote={quote}
                userRole="buyer"
                onAccept={acceptQuote}
                onReject={rejectQuote}
              />
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <QuoteFlowWithResponse />
        </TestWrapper>
      );

      // Verify quote with response is displayed
      expect(screen.getByTestId('quote-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('responded');
      expect(screen.getByTestId('response-1')).toBeInTheDocument();

      // Verify response details
      expect(screen.getByText('Preço unitário: R$ 450')).toBeInTheDocument();
      expect(screen.getByText('Prazo de entrega: 15 dias')).toBeInTheDocument();
      expect(screen.getByText('Total: R$ 4500.00')).toBeInTheDocument();

      // Accept the quote
      await user.click(screen.getByTestId('accept-quote-1'));

      // Verify status changed to accepted
      await waitFor(() => {
        expect(screen.getByTestId('status-1')).toHaveTextContent('accepted');
      });

      // Verify API was called
      expect(mockApiService.acceptQuote).toHaveBeenCalledWith(1);

      // Verify action buttons are no longer visible
      expect(screen.queryByTestId('accept-quote-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reject-quote-1')).not.toBeInTheDocument();
    });

    test('Quote rejection flow', async () => {
      const QuoteFlowWithResponse = () => {
        const [quotes, setQuotes] = React.useState([
          {
            id: 1,
            productId: 1,
            quantity: 10,
            status: 'responded',
            createdAt: new Date().toISOString(),
            product: { id: 1, name: 'Furadeira Industrial' },
            supplierResponse: {
              unitPrice: 600, // Higher than expected
              deliveryDays: 30,
              minimumQuantity: 10,
            }
          }
        ]);

        const rejectQuote = async (quoteId) => {
          await mockApiService.rejectQuote(quoteId);
          setQuotes(prev => prev.map(quote =>
            quote.id === quoteId ? { ...quote, status: 'rejected' } : quote
          ));
        };

        return (
          <div data-testid="quotes-view">
            {quotes.map(quote => (
              <MockQuoteCard
                key={quote.id}
                quote={quote}
                userRole="buyer"
                onReject={rejectQuote}
              />
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <QuoteFlowWithResponse />
        </TestWrapper>
      );

      // Reject the quote
      await user.click(screen.getByTestId('reject-quote-1'));

      // Verify status changed to rejected
      await waitFor(() => {
        expect(screen.getByTestId('status-1')).toHaveTextContent('rejected');
      });

      expect(mockApiService.rejectQuote).toHaveBeenCalledWith(1);
    });
  });

  describe('Supplier Quote Flow', () => {
    test('Supplier quote response flow', async () => {
      const SupplierQuoteFlow = () => {
        const [quotes, setQuotes] = React.useState([
          {
            id: 1,
            productId: 1,
            quantity: 10,
            maxPrice: 500,
            status: 'pending',
            createdAt: new Date().toISOString(),
            product: { id: 1, name: 'Furadeira Industrial' },
            buyer: { companyName: 'Empresa Compradora' },
            notes: 'Necessário certificado de qualidade'
          }
        ]);

        const submitResponse = async (quoteId, responseData) => {
          await mockApiService.submitQuote(quoteId, responseData);
          setQuotes(prev => prev.map(quote =>
            quote.id === quoteId
              ? { 
                  ...quote, 
                  status: 'responded',
                  supplierResponse: responseData
                }
              : quote
          ));
        };

        return (
          <div data-testid="quotes-view">
            <h1>Cotações Recebidas</h1>
            {quotes.map(quote => (
              <MockQuoteCard
                key={quote.id}
                quote={quote}
                userRole="supplier"
                onSubmitResponse={submitResponse}
              />
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <SupplierQuoteFlow />
        </TestWrapper>
      );

      // Verify pending quote is displayed
      expect(screen.getByTestId('quote-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('pending');
      expect(screen.getByText('Solicitado por: Empresa Compradora')).toBeInTheDocument();

      // Click to respond to quote
      await user.click(screen.getByTestId('respond-quote-1'));

      // Verify response form is displayed
      expect(screen.getByTestId('response-form-1')).toBeInTheDocument();

      // Fill response form
      await user.type(screen.getByTestId('unit-price-1'), '480');
      await user.type(screen.getByTestId('delivery-days-1'), '20');
      await user.type(screen.getByTestId('min-quantity-1'), '8');
      await user.type(
        screen.getByTestId('response-notes-1'),
        'Produto certificado ISO 9001'
      );

      // Submit response
      await user.click(screen.getByTestId('submit-response-1'));

      // Verify quote status changed
      await waitFor(() => {
        expect(screen.getByTestId('status-1')).toHaveTextContent('responded');
      });

      // Verify response details are displayed
      expect(screen.getByText('Preço unitário: R$ 480')).toBeInTheDocument();
      expect(screen.getByText('Prazo de entrega: 20 dias')).toBeInTheDocument();

      // Verify API was called with correct data
      expect(mockApiService.submitQuote).toHaveBeenCalledWith(1, {
        unitPrice: 480,
        deliveryDays: 20,
        minimumQuantity: 8,
        notes: 'Produto certificado ISO 9001',
      });
    });

    test('Cancel quote response form', async () => {
      const SupplierQuoteFlow = () => {
        const [quotes] = React.useState([
          {
            id: 1,
            status: 'pending',
            product: { id: 1, name: 'Furadeira Industrial' },
            quantity: 10,
          }
        ]);

        return (
          <div data-testid="quotes-view">
            {quotes.map(quote => (
              <MockQuoteCard
                key={quote.id}
                quote={quote}
                userRole="supplier"
                onSubmitResponse={() => {}}
              />
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <SupplierQuoteFlow />
        </TestWrapper>
      );

      // Open response form
      await user.click(screen.getByTestId('respond-quote-1'));
      expect(screen.getByTestId('response-form-1')).toBeInTheDocument();

      // Cancel form
      await user.click(screen.getByTestId('cancel-response-1'));

      // Verify form is hidden
      expect(screen.queryByTestId('response-form-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('respond-quote-1')).toBeInTheDocument();
    });
  });

  describe('Quote Validation', () => {
    test('Enforce minimum quantity in quote request', async () => {
      render(
        <TestWrapper>
          <QuoteFlowApp userRole="buyer" />
        </TestWrapper>
      );

      // Request quote for product with minimum order of 5
      await user.click(screen.getByTestId('request-quote-1'));

      const quantityInput = screen.getByTestId('quantity-input');
      expect(quantityInput).toHaveAttribute('min', '5');

      // Try to set quantity below minimum
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');

      // Form validation should prevent submission
      await user.click(screen.getByTestId('submit-quote-request'));

      // Should still be on form (HTML5 validation)
      expect(screen.getByTestId('quote-request-form')).toBeInTheDocument();
    });

    test('Handle API errors gracefully', async () => {
      // Mock API failure
      mockApiService.requestQuote.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <QuoteFlowApp userRole="buyer" />
        </TestWrapper>
      );

      // Request quote
      await user.click(screen.getByTestId('request-quote-1'));
      
      // Fill minimum required fields
      await user.type(screen.getByTestId('quantity-input'), '10');
      await user.click(screen.getByTestId('submit-quote-request'));

      // Should handle error gracefully (stay on form)
      await waitFor(() => {
        expect(screen.getByTestId('submit-quote-request')).not.toHaveTextContent('Enviando...');
      });

      expect(screen.getByTestId('quote-form-view')).toBeInTheDocument();
    });
  });
});