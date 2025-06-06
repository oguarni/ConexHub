import '@testing-library/jest-dom';

// setupTests.js - Configuração correta para testes

// ✅ Configuração global para testes
global.console = {
    ...console,
    // Silenciar warnings específicos em testes
    warn: jest.fn(),
    error: jest.fn(),
};

// ✅ Mock para IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
};

// ✅ Mock para ResizeObserver  
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
};

// ✅ Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// ✅ Mock para localStorage/sessionStorage
const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
});

Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
});

// ✅ Mock para fetch
global.fetch = jest.fn();

// ✅ Mock para performance.memory
Object.defineProperty(performance, 'memory', {
    value: {
        usedJSHeapSize: 10485760, // 10MB
        totalJSHeapSize: 20971520, // 20MB
        jsHeapSizeLimit: 2147483648 // 2GB
    },
    configurable: true
});

// ✅ Mock para screen
Object.defineProperty(screen, 'width', { value: 1920, configurable: true });
Object.defineProperty(screen, 'height', { value: 1080, configurable: true });

// ✅ Mock para navigator
Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    configurable: true
});

Object.defineProperty(navigator, 'onLine', {
    value: true,
    configurable: true
});

// ✅ Mock para window dimensions
Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

// ✅ Limpar mocks após cada teste
afterEach(() => {
    jest.clearAllMocks();
});

// ✅ Reset environment após cada teste
afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.REACT_APP_VERSION;
});

// ✅ Configuração para DOMPurify em ambiente de teste
jest.mock('dompurify', () => ({
    sanitize: jest.fn((input) => input),
}));

// ✅ Mock para CSS imports
jest.mock('./App.css', () => ({}));