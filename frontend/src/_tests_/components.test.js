// __tests__/components.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SecureProductCard from '../src/components/products/SecureProductCard';
import SecuritySanitizer from '../src/utils/sanitizer';
import { useDebounceSearch } from '../src/hooks/useDebounceSearch';
import { ButtonLoading, ProductsSkeleton } from '../src/components/common/LoadingStates';

// ✅ Mock dados de teste
const mockProduct = {
  id: '1',
  name: 'Torno Industrial CNC',
  description: 'Torno de alta precisão para usinagem',
  price: 15000.99,
  unit: 'unidade',
  category: 'Maquinário',
  image: '⚙️',
  supplier: 'Metalúrgica Silva',
  supplierId: 'supplier-1',
  minQuantity: 1
};

const mockUser = {
  id: 'user-1',
  role: 'buyer',
  name: 'João Silva'
};

// ✅ Tests para SecuritySanitizer
describe('SecuritySanitizer', () => {
  describe('sanitizeText', () => {
    test('deve remover scripts maliciosos', () => {
      const malicious = '<script>alert("xss")</script>Produto';
      const result = SecuritySanitizer.sanitizeText(malicious);
      expect(result).toBe('Produto');
      expect(result).not.toContain('script');
    });

    test('deve remover event handlers', () => {
      const malicious = 'onclick=alert("xss") Produto';
      const result = SecuritySanitizer.sanitizeText(malicious);
      expect(result).toBe('Produto');
      expect(result).not.toContain('onclick');
    });

    test('deve lidar com valores não-string', () => {
      expect(SecuritySanitizer.sanitizeText(null)).toBe('');
      expect(SecuritySanitizer.sanitizeText(undefined)).toBe('');
      expect(SecuritySanitizer.sanitizeText(123)).toBe('');
    });
  });

  describe('sanitizeProductIcon', () => {
    test('deve aceitar emojis válidos', () => {
      expect(SecuritySanitizer.sanitizeProductIcon('⚙️')).toBe('⚙️');
      expect(SecuritySanitizer.sanitizeProductIcon('🔧')).toBe('🔧');
    });

    test('deve retornar default para ícones inválidos', () => {
      expect(SecuritySanitizer.sanitizeProductIcon('<script>')).toBe('📦');
      expect(SecuritySanitizer.sanitizeProductIcon('invalid')).toBe('📦');
      expect(SecuritySanitizer.sanitizeProductIcon(null)).toBe('📦');
    });
  });

  describe('sanitizeFormData', () => {
    test('deve sanitizar todos os campos string', () => {
      const dirtyData = {
        name: '<script>alert("xss")</script>Produto',
        description: 'Descrição <b>válida</b>',
        price: 100.50,
        malicious: 'onclick=alert("xss")'
      };

      const result = SecuritySanitizer.sanitizeFormData(dirtyData);
      
      expect(result.name).toBe('Produto');
      expect(result.description).toContain('<b>válida</b>'); // HTML permitido
      expect(result.price).toBe(100.50); // Números inalterados
      expect(result.malicious).toBe('');
    });
  });
});

// ✅ Tests para SecureProductCard
describe('SecureProductCard', () => {
  const mockOnRequestQuote = jest.fn();

  beforeEach(() => {
    mockOnRequestQuote.mockClear();
  });

  test('deve renderizar informações básicas do produto', () => {
    render(
      <SecureProductCard 
        product={mockProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    expect(screen.getByText('Torno Industrial CNC')).toBeInTheDocument();
    expect(screen.getByText('Metalúrgica Silva')).toBeInTheDocument();
    expect(screen.getByText('Maquinário')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 15\.000,99/)).toBeInTheDocument();
  });

  test('deve sanitizar dados maliciosos', () => {
    const maliciousProduct = {
      ...mockProduct,
      name: '<script>alert("xss")</script>Produto Malicioso',
      description: 'onclick=alert("xss") Descrição'
    };

    render(
      <SecureProductCard 
        product={maliciousProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    expect(screen.getByText('Produto Malicioso')).toBeInTheDocument();
    expect(screen.queryByText(/script/)).not.toBeInTheDocument();
    expect(screen.queryByText(/onclick/)).not.toBeInTheDocument();
  });

  test('deve mostrar botão de cotação para compradores', () => {
    render(
      <SecureProductCard 
        product={mockProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    const button = screen.getByRole('button', { name: /solicitar cotação/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('deve chamar onRequestQuote ao clicar no botão', async () => {
    const user = userEvent.setup();
    
    render(
      <SecureProductCard 
        product={mockProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    const button = screen.getByRole('button', { name: /solicitar cotação/i });
    await user.click(button);

    expect(mockOnRequestQuote).toHaveBeenCalledTimes(1);
    expect(mockOnRequestQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name
      })
    );
  });

  test('deve mostrar "Seu Produto" para o próprio fornecedor', () => {
    const supplierUser = {
      ...mockUser,
      role: 'supplier',
      id: 'supplier-1'
    };

    render(
      <SecureProductCard 
        product={mockProduct} 
        user={supplierUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    expect(screen.getByText('Seu Produto')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /solicitar cotação/i })).not.toBeInTheDocument();
  });

  test('deve ter acessibilidade adequada', () => {
    render(
      <SecureProductCard 
        product={mockProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    // Verificar aria-labels
    expect(screen.getByRole('article')).toHaveAttribute('aria-label');
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
    
    // Verificar estrutura semântica
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2); // Preço e quantidade
  });

  test('deve lidar com produto inválido', () => {
    const invalidProduct = { id: '', name: '' };

    render(
      <SecureProductCard 
        product={invalidProduct} 
        user={mockUser}
        onRequestQuote={mockOnRequestQuote}
      />
    );

    expect(screen.getByText('Produto indisponível')).toBeInTheDocument();
  });
});

// ✅ Tests para useDebounceSearch Hook
describe('useDebounceSearch', () => {
  const TestComponent = ({ onSearch, delay = 300 }) => {
    const { searchTerm, debouncedValue, updateSearchTerm, isSearching } = useDebounceSearch('', delay);
    
    React.useEffect(() => {
      if (onSearch) onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    return (
      <div>
        <input 
          value={searchTerm}
          onChange={(e) => updateSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        <div data-testid="current-search">{searchTerm}</div>
        <div data-testid="debounced-search">{debouncedValue}</div>
        <div data-testid="is-searching">{isSearching.toString()}</div>
      </div>
    );
  };

  test('deve fazer debounce do valor de busca', async () => {
    const mockOnSearch = jest.fn();
    
    render(<TestComponent onSearch={mockOnSearch} delay={100} />);
    
    const input = screen.getByPlaceholderText('Search...');
    
    // Digitar rapidamente
    await userEvent.type(input, 'test');
    
    // Valor atual deve mudar imediatamente
    expect(screen.getByTestId('current-search')).toHaveTextContent('test');
    
    // Valor debounced ainda não deve ter mudado
    expect(screen.getByTestId('debounced-search')).toHaveTextContent('');
    
    // Aguardar debounce
    await waitFor(() => {
      expect(screen.getByTestId('debounced-search')).toHaveTextContent('test');
    }, { timeout: 200 });

    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  test('deve cancelar debounce anterior', async () => {
    const mockOnSearch = jest.fn();
    
    render(<TestComponent onSearch={mockOnSearch} delay={100} />);
    
    const input = screen.getByPlaceholderText('Search...');
    
    // Primeira digitação
    await userEvent.type(input, 'tes');
    
    // Segunda digitação antes do debounce
    await userEvent.type(input, 't');
    
    // Aguardar debounce
    await waitFor(() => {
      expect(screen.getByTestId('debounced-search')).toHaveTextContent('test');
    }, { timeout: 200 });

    // Deve ter sido chamado apenas uma vez com valor final
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });
});

// ✅ Tests para Loading Components
describe('Loading Components', () => {
  test('ButtonLoading deve ter acessibilidade', () => {
    render(<ButtonLoading text="Salvando..." />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Salvando...')).toBeInTheDocument();
    expect(screen.getByText('Carregando')).toHaveClass('sr-only');
  });

  test('ProductsSkeleton deve renderizar número correto de items', () => {
    render(<ProductsSkeleton count={4} />);
    
    const skeletonItems = screen.getByRole('status').children;
    expect(skeletonItems).toHaveLength(4);
  });

  test('Loading components devem ter aria-live', () => {
    render(<ButtonLoading />);
    
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});

// ✅ Tests de integração
describe('Integration Tests', () => {
  test('ProductCard + Loading devem funcionar juntos', () => {
    const { rerender } = render(
      <ProductsSkeleton count={1} />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <SecureProductCard 
        product={mockProduct} 
        user={mockUser}
        onRequestQuote={() => {}}
      />
    );

    expect(screen.getByText('Torno Industrial CNC')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

// ✅ Setup e helpers para testes
export const renderWithUser = (component, user = mockUser) => {
  return render(
    React.cloneElement(component, { user })
  );
};

export const mockProduct as const = mockProduct;
export const mockUser as const = mockUser;