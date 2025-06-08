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
    
    // Messages
    loginSuccess: 'Login realizado com sucesso!',
    logoutSuccess: 'Logout realizado com sucesso!',
    quoteRequestSuccess: 'Cotação solicitada com sucesso!',
    quoteRequestError: 'Erro ao solicitar cotação. Tente novamente.',
    loginRequired: 'Faça login para solicitar cotações',
    suppliersCannotRequest: 'Fornecedores não podem solicitar cotações',
    noProductsFound: 'Nenhum produto encontrado',
    noProductsRegistered: 'Nenhum produto cadastrado ainda. Use o botão "Popular DB" para adicionar dados de exemplo.',
    adjustFilters: 'Tente ajustar os filtros ou termos de pesquisa.',
    loadingProducts: 'Carregando produtos...',
    seedSuccess: 'Dados populados com sucesso!',
    seedError: 'Erro ao popular dados',
    yourProduct: 'Seu Produto',
    loginToQuote: 'Login para Cotar',
    admin: 'Administrador',
    
    // PIX Payment
    pixPayment: 'Pagamento PIX',
    paymentAmount: 'Valor do Pagamento',
    pixKeyType: 'Tipo de Chave PIX',
    pixKey: 'Chave PIX',
    receiverName: 'Nome do Recebedor',
    receiverDocument: 'Documento do Recebedor',
    expirationTime: 'Tempo de Expiração',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    generatePixPayment: 'Gerar Pagamento PIX',
    generating: 'Gerando...',
    pixCode: 'Código PIX',
    copyAndPaste: 'copiar e colar',
    scanQrCodeToPay: 'Escaneie o QR Code para pagar',
    copiedToClipboard: 'Copiado para a área de transferência!',
    paymentInstructions: 'Instruções de Pagamento',
    instruction1: 'Abra o app do seu banco',
    instruction2: 'Escaneie o QR Code ou cole o código PIX',
    instruction3: 'Confirme o pagamento',
    checkPaymentStatus: 'Verificar Status do Pagamento',
    paymentConfirmed: 'Pagamento Confirmado!',
    paymentProcessedSuccessfully: 'Seu pagamento foi processado com sucesso.',
    expiresIn: 'Expira em',
    enterPixKey: 'Digite sua chave PIX',
    enterReceiverName: 'Digite o nome do recebedor',
    enterReceiverDocument: 'Digite o CPF/CNPJ do recebedor',
    invalidPixKeyFormat: 'Formato de chave PIX inválido',
    receiverNameRequired: 'Nome do recebedor é obrigatório',
    receiverDocumentRequired: 'Documento do recebedor é obrigatório',
    failedToCreatePixPayment: 'Falha ao criar pagamento PIX',
    randomKey: 'Chave Aleatória',
    payWithPix: 'Pagar com PIX',
    quote: 'Cotação',
    order: 'Pedido',
    close: 'Fechar',
    
    // About Page
    aboutTitle: 'Sobre o ConexHub',
    aboutDescription: 'Plataforma líder em comércio eletrônico B2B para indústrias locais',
    industrialSolutions: 'Soluções Industriais',
    aboutSubtitle: 'Conectando indústrias com eficiência, segurança e inovação desde 2020.',
    mission: 'Nossa Missão',
    vision: 'Nossa Visão',
    missionText: 'Democratizar o acesso ao comércio B2B, conectando pequenas e médias empresas a fornecedores qualificados, proporcionando transparência, eficiência e crescimento sustentável para todos os participantes do ecossistema industrial brasileiro.',
    visionText: 'Ser a principal plataforma de comércio B2B da América Latina, reconhecida pela excelência em conectar empresas, promover inovação e impulsionar o crescimento econômico regional através da tecnologia.',
    
    // Stats
    registeredCompanies: 'Empresas Cadastradas',
    availableProducts: 'Produtos Disponíveis', 
    transactionsCompleted: 'Transações Realizadas',
    customerSatisfaction: 'Satisfação do Cliente',
    
    // Features
    whyChooseUs: 'Por que escolher nossa plataforma?',
    whyChooseDescription: 'Oferecemos uma experiência completa e segura para empresas que buscam excelência em seus processos de compra e venda B2B.',
    guaranteedSecurity: 'Segurança Garantida',
    securityDescription: 'Todas as transações são protegidas por criptografia de ponta e verificação rigorosa de fornecedores.',
    integratedLogistics: 'Logística Integrada',
    logisticsDescription: 'Parceria com principais transportadoras para garantir entregas rápidas e seguras em todo o Brasil.',
    certifiedQuality: 'Qualidade Certificada',
    qualityDescription: 'Todos os fornecedores passam por processo de verificação e certificação de qualidade.',
    specializedSupport: 'Suporte Especializado',
    supportDescription: 'Equipe de especialistas em B2B disponível para auxiliar em todas as etapas do processo.',
    
    // Team
    ourTeam: 'Nossa Equipe',
    teamDescription: 'Profissionais experientes dedicados ao seu sucesso',
    ceoFounder: 'CEO & Fundador',
    commercialDirector: 'Diretor Comercial',
    carlosDescription: '20+ anos de experiência em comércio B2B',
    anaDescription: 'Especialista em tecnologia e inovação',
    joaoDescription: 'Expert em desenvolvimento de negócios B2B',
    
    // Contact
    contactDescription: 'Entre em contato conosco para começar sua jornada B2B',
    support247: 'Atendimento 24/7',
    businessHours: 'Horário de Atendimento',
    technicalSupport: 'Suporte Técnico',
    salesCommercial: 'Vendas & Comercial',
    mondayToFriday: 'Segunda a Sexta',
    saturday: 'Sábado',
    
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
    address: 'Address',
    role: 'Account Type',
    buyer: 'Buyer',
    
    // Messages
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful!',
    quoteRequestSuccess: 'Quote requested successfully!',
    quoteRequestError: 'Error requesting quote. Please try again.',
    loginRequired: 'Please login to request quotes',
    suppliersCannotRequest: 'Suppliers cannot request quotes',
    noProductsFound: 'No products found',
    noProductsRegistered: 'No products registered yet. Use the "Seed DB" button to add sample data.',
    adjustFilters: 'Try adjusting the filters or search terms.',
    loadingProducts: 'Loading products...',
    seedSuccess: 'Data populated successfully!',
    seedError: 'Error populating data',
    yourProduct: 'Your Product',
    loginToQuote: 'Login to Quote',
    admin: 'Administrator',
    
    // PIX Payment
    pixPayment: 'PIX Payment',
    paymentAmount: 'Payment Amount',
    pixKeyType: 'PIX Key Type',
    pixKey: 'PIX Key',
    receiverName: 'Receiver Name',
    receiverDocument: 'Receiver Document',
    expirationTime: 'Expiration Time',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    generatePixPayment: 'Generate PIX Payment',
    generating: 'Generating...',
    pixCode: 'PIX Code',
    copyAndPaste: 'copy and paste',
    scanQrCodeToPay: 'Scan QR Code to pay',
    copiedToClipboard: 'Copied to clipboard!',
    paymentInstructions: 'Payment Instructions',
    instruction1: 'Open your bank app',
    instruction2: 'Scan the QR Code or paste the PIX code',
    instruction3: 'Confirm the payment',
    checkPaymentStatus: 'Check Payment Status',
    paymentConfirmed: 'Payment Confirmed!',
    paymentProcessedSuccessfully: 'Your payment has been processed successfully.',
    expiresIn: 'Expires in',
    enterPixKey: 'Enter your PIX key',
    enterReceiverName: 'Enter receiver name',
    enterReceiverDocument: 'Enter receiver CPF/CNPJ',
    invalidPixKeyFormat: 'Invalid PIX key format',
    receiverNameRequired: 'Receiver name is required',
    receiverDocumentRequired: 'Receiver document is required',
    failedToCreatePixPayment: 'Failed to create PIX payment',
    randomKey: 'Random Key',
    payWithPix: 'Pay with PIX',
    quote: 'Quote',
    order: 'Order',
    close: 'Close',
    
    // About Page
    aboutTitle: 'About ConexHub',
    aboutDescription: 'Leading B2B e-commerce platform for local industries',
    industrialSolutions: 'Industrial Solutions',
    aboutSubtitle: 'Connecting industries with efficiency, security and innovation since 2020.',
    mission: 'Our Mission',
    vision: 'Our Vision',
    missionText: 'To democratize access to B2B commerce, connecting small and medium enterprises to qualified suppliers, providing transparency, efficiency and sustainable growth for all participants in the Brazilian industrial ecosystem.',
    visionText: 'To be the main B2B commerce platform in Latin America, recognized for excellence in connecting companies, promoting innovation and driving regional economic growth through technology.',
    
    // Stats
    registeredCompanies: 'Registered Companies',
    availableProducts: 'Available Products',
    transactionsCompleted: 'Transactions Completed',
    customerSatisfaction: 'Customer Satisfaction',
    
    // Features
    whyChooseUs: 'Why choose our platform?',
    whyChooseDescription: 'We offer a complete and secure experience for companies seeking excellence in their B2B buying and selling processes.',
    guaranteedSecurity: 'Guaranteed Security',
    securityDescription: 'All transactions are protected by end-to-end encryption and rigorous supplier verification.',
    integratedLogistics: 'Integrated Logistics',
    logisticsDescription: 'Partnership with major carriers to ensure fast and secure deliveries throughout Brazil.',
    certifiedQuality: 'Certified Quality',
    qualityDescription: 'All suppliers go through a quality verification and certification process.',
    specializedSupport: 'Specialized Support',
    supportDescription: 'Team of B2B specialists available to assist in all stages of the process.',
    
    // Team
    ourTeam: 'Our Team',
    teamDescription: 'Experienced professionals dedicated to your success',
    ceoFounder: 'CEO & Founder',
    commercialDirector: 'Commercial Director',
    carlosDescription: '20+ years of experience in B2B commerce',
    anaDescription: 'Technology and innovation specialist',
    joaoDescription: 'Expert in B2B business development',
    
    // Contact
    contactDescription: 'Contact us to start your B2B journey',
    phone: 'Phone',
    email: 'Email',
    support247: '24/7 Support',
    businessHours: 'Business Hours',
    technicalSupport: 'Technical Support',
    salesCommercial: 'Sales & Commercial',
    mondayToFriday: 'Monday to Friday',
    saturday: 'Saturday',
    
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