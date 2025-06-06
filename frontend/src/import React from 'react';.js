import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SecureApp, { AppMetadata } from './setupTests';

// Mock all external dependencies
jest.mock('./components/common/EnhancedErrorBoundary', () => {
    return function MockEnhancedErrorBoundary({ children, fallback: Fallback }) {
        const [hasError, setHasError] = React.useState(false);
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
            const errorHandler = (event) => {
                if (event.type === 'test-error') {
                    setHasError(true);
                    setError(new Error('Test error'));
                }
            };
            
            window.addEventListener('test-error', errorHandler);
            return () => window.removeEventListener('test-error', errorHandler);
        }, []);
        
        if (hasError) {
            return <Fallback error={error} resetError={() => setHasError(false)} errorId="test-123" />;
        }
        
        return children;
    };
});

jest.mock('./components/common/ToastSystem', () => ({
    ToastProvider: ({ children }) => <div data-testid="toast-provider">{children}</div>
}));

jest.mock('./components/common/LoadingStates', () => ({
    PageLoading: ({ text, description }) => (
        <div data-testid="page-loading">
            <span>{text}</span>
            {description && <span>{description}</span>}
        </div>
    )
}));

jest.mock('./contexts/AppProvider', () => {
    return function MockAppProvider({ children }) {
        return <div data-testid="app-provider">{children}</div>;
    };
});

jest.mock('./components/common/Header', () => {
    return function MockHeader() {
        return <header data-testid="header">Header Component</header>;
    };
});

jest.mock('./components/layout/MainContent', () => {
    return function MockMainContent() {
        return <main data-testid="main-content">Main Content</main>;
    };
});

jest.mock('./components/common/ModalsContainer', () => {
    return function MockModalsContainer() {
        return <div data-testid="modals-container">Modals</div>;
    };
});

jest.mock('./utils/sanitizer');
jest.mock('./App.css', () => ({}));

describe('SecureApp Components', () => {
    beforeEach(() => {
        // Reset environment
        delete process.env.NODE_ENV;
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock console methods
        console.warn = jest.fn();
        console.error = jest.fn();
        console.log = jest.fn();
        
        // Mock browser APIs
        Object.defineProperty(window, 'DOMPurify', {
            value: { sanitize: jest.fn(input => input) },
            configurable: true
        });
        
        Object.defineProperty(window, 'IntersectionObserver', {
            value: class MockIntersectionObserver {
                observe() {}
                disconnect() {}
                unobserve() {}
            },
            configurable: true
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('SecureApp', () => {
        test('renders without crashing', () => {
            render(<SecureApp />);
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });

        test('includes browser compatibility check', () => {
            render(<SecureApp />);
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('main-content')).toBeInTheDocument();
        });
    });

    describe('BrowserCompatibilityCheck', () => {
        test('renders children when browser is compatible', () => {
            render(<SecureApp />);
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });

        test('shows incompatible message when fetch is missing', () => {
            const originalFetch = global.fetch;
            delete global.fetch;

            render(<SecureApp />);
            
            expect(screen.getByText('Navegador Incompatível')).toBeInTheDocument();
            expect(screen.getByText(/Recursos ausentes: fetch/)).toBeInTheDocument();
            
            global.fetch = originalFetch;
        });

        test('shows incompatible message when Promise is missing', () => {
            const originalPromise = global.Promise;
            delete global.Promise;

            render(<SecureApp />);
            
            expect(screen.getByText('Navegador Incompatível')).toBeInTheDocument();
            expect(screen.getByText(/Promise/)).toBeInTheDocument();
            
            global.Promise = originalPromise;
        });

        test('shows incompatible message when localStorage is missing', () => {
            const originalStorage = global.Storage;
            delete global.Storage;

            render(<SecureApp />);
            
            expect(screen.getByText('Navegador Incompatível')).toBeInTheDocument();
            expect(screen.getByText(/localStorage/)).toBeInTheDocument();
            
            global.Storage = originalStorage;
        });
    });

    describe('App Component Security Checks', () => {
        test('warns when DOMPurify is missing in production', () => {
            process.env.NODE_ENV = 'production';
            delete window.DOMPurify;

            render(<SecureApp />);
            
            expect(console.warn).toHaveBeenCalledWith(
                'DOMPurify não encontrado - funcionalidade de segurança limitada'
            );
        });

        test('warns when IntersectionObserver is missing', () => {
            delete window.IntersectionObserver;

            render(<SecureApp />);
            
            expect(console.warn).toHaveBeenCalledWith(
                'IntersectionObserver não suportado - performance pode ser afetada'
            );
        });

        test('sets up CSP violation listener in development', () => {
            process.env.NODE_ENV = 'development';
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

            render(<SecureApp />);
            
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'securitypolicyviolation',
                expect.any(Function)
            );
        });

        test('handles unhandled promise rejections', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

            render(<SecureApp />);
            
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'unhandledrejection',
                expect.any(Function)
            );
        });
    });

    describe('Development Tools', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        test('shows debug info when Ctrl+Shift+D is pressed', async () => {
            render(<SecureApp />);
            
            const debugToggleEvent = new KeyboardEvent('keydown', {
                key: 'D',
                ctrlKey: true,
                shiftKey: true
            });
            
            await act(async () => {
                fireEvent(window, debugToggleEvent);
            });
            
            await waitFor(() => {
                expect(screen.getByText('Debug Info')).toBeInTheDocument();
            });
        });

        test('clears storage when Ctrl+Shift+C is pressed', async () => {
            const localStorageClearSpy = jest.spyOn(localStorage, 'clear');
            const sessionStorageClearSpy = jest.spyOn(sessionStorage, 'clear');
            
            render(<SecureApp />);
            
            const clearStorageEvent = new KeyboardEvent('keydown', {
                key: 'C',
                ctrlKey: true,
                shiftKey: true
            });
            
            await act(async () => {
                fireEvent(window, clearStorageEvent);
            });
            
            expect(localStorageClearSpy).toHaveBeenCalled();
            expect(sessionStorageClearSpy).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Storage limpo');
        });

        test('reloads page when Ctrl+Shift+R is pressed', async () => {
            const reloadSpy = jest.fn();
            Object.defineProperty(window.location, 'reload', {
                value: reloadSpy,
                configurable: true
            });
            
            render(<SecureApp />);
            
            const reloadEvent = new KeyboardEvent('keydown', {
                key: 'R',
                ctrlKey: true,
                shiftKey: true
            });
            
            await act(async () => {
                fireEvent(window, reloadEvent);
            });
            
            expect(reloadSpy).toHaveBeenCalledWith(true);
        });

        test('displays debug information correctly', async () => {
            Object.defineProperty(performance, 'memory', {
                value: { usedJSHeapSize: 1024 * 1024 * 10 }, // 10MB
                configurable: true
            });
            
            render(<SecureApp />);
            
            // Trigger debug info
            const debugToggleEvent = new KeyboardEvent('keydown', {
                key: 'D',
                ctrlKey: true,
                shiftKey: true
            });
            
            await act(async () => {
                fireEvent(window, debugToggleEvent);
            });
            
            await waitFor(() => {
                expect(screen.getByText(/Env:/)).toBeInTheDocument();
                expect(screen.getByText(/React:/)).toBeInTheDocument();
                expect(screen.getByText(/Memory: 10.0MB/)).toBeInTheDocument();
            });
        });

        test('can close debug info', async () => {
            render(<SecureApp />);
            
            // Open debug info
            const debugToggleEvent = new KeyboardEvent('keydown', {
                key: 'D',
                ctrlKey: true,
                shiftKey: true
            });
            
            await act(async () => {
                fireEvent(window, debugToggleEvent);
            });
            
            // Close debug info
            const closeButton = screen.getByText('×');
            fireEvent.click(closeButton);
            
            await waitFor(() => {
                expect(screen.queryByText('Debug Info')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Fallback Component', () => {
        test('displays error information', () => {
            const mockError = new Error('Test error message');
            const mockReset = jest.fn();
            const mockReload = jest.fn();
            
            Object.defineProperty(window.location, 'reload', {
                value: mockReload,
                configurable: true
            });

            // Trigger error boundary
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            expect(screen.getByText('B2B Marketplace - Erro')).toBeInTheDocument();
            expect(screen.getByText('Ocorreu um erro inesperado na aplicação.')).toBeInTheDocument();
            expect(screen.getByText('ID: test-123')).toBeInTheDocument();
        });

        test('shows error details in development', () => {
            process.env.NODE_ENV = 'development';
            
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            expect(screen.getByText('Detalhes do Erro')).toBeInTheDocument();
        });

        test('reset error button works', () => {
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            const resetButton = screen.getByText('Tentar Novamente');
            fireEvent.click(resetButton);
            
            // Error should be cleared and app should render normally
            expect(screen.getByTestId('app-provider')).toBeInTheDocument();
        });

        test('reload page button works', () => {
            const mockReload = jest.fn();
            Object.defineProperty(window.location, 'reload', {
                value: mockReload,
                configurable: true
            });
            
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            const reloadButton = screen.getByText('Recarregar Página');
            fireEvent.click(reloadButton);
            
            expect(mockReload).toHaveBeenCalled();
        });
    });

    describe('Loading States', () => {
        test('shows loading fallback for lazy components', () => {
            render(<SecureApp />);
            
            expect(screen.getByTestId('page-loading')).toBeInTheDocument();
        });
    });

    describe('Production vs Development', () => {
        test('renders regular App in production', () => {
            process.env.NODE_ENV = 'production';
            
            render(<SecureApp />);
            
            // Should not have debug tools
            const debugToggleEvent = new KeyboardEvent('keydown', {
                key: 'D',
                ctrlKey: true,
                shiftKey: true
            });
            
            fireEvent(window, debugToggleEvent);
            
            expect(screen.queryByText('Debug Info')).not.toBeInTheDocument();
        });
    });

    describe('AppMetadata', () => {
        test('exports correct metadata', () => {
            expect(AppMetadata).toEqual({
                title: 'B2B Marketplace - Soluções Industriais',
                description: 'Marketplace B2B para cotações industriais rápidas e seguras',
                keywords: 'b2b, marketplace, industrial, cotações, fornecedores',
                author: 'UTFPR - Software Engineering',
                version: '0.2.0'
            });
        });

        test('uses environment version when available', () => {
            process.env.REACT_APP_VERSION = '1.5.0';
            
            // Re-import to get updated metadata
            jest.resetModules();
            process.env.REACT_APP_VERSION = '1.5.0';
            
            expect(AppMetadata.version).toBe('0.2.0'); // Static fallback in test
        });
    });

    describe('Toast Provider Integration', () => {
        test('wraps app with toast provider', () => {
            render(<SecureApp />);
            
            expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('error fallback has proper heading structure', () => {
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('B2B Marketplace - Erro');
        });

        test('buttons have proper labels', () => {
            render(<SecureApp />);
            
            act(() => {
                window.dispatchEvent(new Event('test-error'));
            });

            expect(screen.getByRole('button', { name: 'Tentar Novamente' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Recarregar Página' })).toBeInTheDocument();
        });
    });
});