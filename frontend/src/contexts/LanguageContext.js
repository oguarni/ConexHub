import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation dictionary
const translations = {
  'pt-BR': {
    // Navigation
    login: 'Login',
    logout: 'Sair',
    register: 'Registrar',
    quotes: 'Cotações',
    orders: 'Pedidos',
    products: 'Produtos',
    about: 'Sobre',
    
    // Product Interface
    requestQuote: 'Solicitar Cotação',
    price: 'Preço',
    minOrder: 'Pedido Mínimo',
    category: 'Categoria',
    supplier: 'Fornecedor',
    description: 'Descrição',
    specifications: 'Especificações',
    stock: 'Estoque',
    featured: 'Destaque',
    
    // Categories
    machinery: 'Máquinas',
    rawMaterials: 'Matérias-Primas',
    components: 'Componentes',
    tools: 'Ferramentas',
    equipment: 'Equipamentos',
    all: 'Todas',
    
    // Quote System
    quantity: 'Quantidade',
    urgency: 'Urgência',
    deliveryAddress: 'Endereço de Entrega',
    additionalSpecs: 'Especificações Adicionais',
    message: 'Mensagem',
    submitQuote: 'Enviar Cotação',
    quoteRequested: 'Cotação Solicitada',
    
    // Status
    pending: 'Pendente',
    quoted: 'Cotado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregue',
    
    // Company Registration
    companyName: 'Nome da Empresa',
    cnpj: 'CNPJ',
    email: 'Email',
    password: 'Senha',
    phone: 'Telefone',
    address: 'Endereço',
    role: 'Tipo de Conta',
    buyer: 'Comprador',
    supplier: 'Fornecedor',
    
    // Messages
    loginSuccess: 'Login realizado com sucesso!',
    quoteRequestSuccess: 'Cotação solicitada com sucesso!',
    loginRequired: 'Faça login para solicitar cotações',
    noProductsFound: 'Nenhum produto encontrado',
    loadingProducts: 'Carregando produtos...',
    
    // About Page
    aboutTitle: 'Sobre o B2B Marketplace',
    aboutDescription: 'Plataforma líder em comércio eletrônico B2B para indústrias locais',
    mission: 'Nossa Missão',
    vision: 'Nossa Visão',
    
    // Footer
    contact: 'Contato',
    location: 'Localização',
    support: 'Suporte',
    
    // Search
    searchProducts: 'Buscar produtos...',
    filterBy: 'Filtrar por',
    sortBy: 'Ordenar por',
    
    // Buttons
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    submit: 'Enviar',
    edit: 'Editar',
    delete: 'Excluir',
    view: 'Visualizar'
  },
  
  'en': {
    // Navigation
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    quotes: 'Quotes',
    orders: 'Orders',
    products: 'Products',
    about: 'About',
    
    // Product Interface
    requestQuote: 'Request Quote',
    price: 'Price',
    minOrder: 'Min. Order',
    category: 'Category',
    supplier: 'Supplier',
    description: 'Description',
    specifications: 'Specifications',
    stock: 'Stock',
    featured: 'Featured',
    
    // Categories
    machinery: 'Machinery',
    rawMaterials: 'Raw Materials',
    components: 'Components',
    tools: 'Tools',
    equipment: 'Equipment',
    all: 'All',
    
    // Quote System
    quantity: 'Quantity',
    urgency: 'Urgency',
    deliveryAddress: 'Delivery Address',
    additionalSpecs: 'Additional Specifications',
    message: 'Message',
    submitQuote: 'Submit Quote',
    quoteRequested: 'Quote Requested',
    
    // Status
    pending: 'Pending',
    quoted: 'Quoted',
    accepted: 'Accepted',
    rejected: 'Rejected',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    
    // Company Registration
    companyName: 'Company Name',
    cnpj: 'Tax ID',
    email: 'Email',
    password: 'Password',
    phone: 'Phone',
    address: 'Address',
    role: 'Account Type',
    buyer: 'Buyer',
    supplier: 'Supplier',
    
    // Messages
    loginSuccess: 'Login successful!',
    quoteRequestSuccess: 'Quote requested successfully!',
    loginRequired: 'Please login to request quotes',
    noProductsFound: 'No products found',
    loadingProducts: 'Loading products...',
    
    // About Page
    aboutTitle: 'About B2B Marketplace',
    aboutDescription: 'Leading B2B e-commerce platform for local industries',
    mission: 'Our Mission',
    vision: 'Our Vision',
    
    // Footer
    contact: 'Contact',
    location: 'Location',
    support: 'Support',
    
    // Search
    searchProducts: 'Search products...',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    
    // Buttons
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');

  // Load language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;