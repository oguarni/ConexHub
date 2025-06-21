import express from 'express';

const router = express.Router();

// Sample orders data for development/testing
const getSampleOrders = (userRole) => {
  if (userRole === 'supplier') {
    return [
      {
        id: 1,
        orderNumber: 'PED-2024-001',
        productName: 'Furadeira Industrial HD-2000',
        quantity: 2,
        unit: 'un',
        supplierName: 'Sua Empresa',
        totalPrice: 2599.98,
        status: 'pending',
        createdAt: new Date('2024-06-10').toISOString()
      },
      {
        id: 2,
        orderNumber: 'PED-2024-002',
        productName: 'Motor Elétrico Trifásico 5CV',
        quantity: 1,
        unit: 'un',
        supplierName: 'Sua Empresa',
        totalPrice: 2450.00,
        status: 'confirmed',
        createdAt: new Date('2024-06-08').toISOString()
      },
      {
        id: 5,
        orderNumber: 'PED-2024-005',
        productName: 'Compressor de Ar 50L',
        quantity: 3,
        unit: 'un',
        supplierName: 'Sua Empresa',
        totalPrice: 5550.00,
        status: 'shipped',
        createdAt: new Date('2024-06-07').toISOString()
      }
    ];
  } else {
    return [
      {
        id: 3,
        orderNumber: 'COT-2024-003',
        productName: 'Chapa de Aço Inox 304',
        quantity: 20,
        unit: 'm²',
        supplierName: 'Metalúrgica São Paulo',
        supplierEmail: 'vendas@metalsp.com.br',
        totalPrice: 1790.00,
        status: 'shipped',
        createdAt: new Date('2024-06-09').toISOString()
      },
      {
        id: 4,
        orderNumber: 'COT-2024-004',
        productName: 'Válvula Pneumática 1/2"',
        quantity: 10,
        unit: 'un',
        supplierName: 'Pneumática Industrial',
        supplierEmail: 'pedidos@pneumatica.com.br',
        totalPrice: 1567.50,
        status: 'delivered',
        createdAt: new Date('2024-06-05').toISOString()
      },
      {
        id: 6,
        orderNumber: 'COT-2024-006',
        productName: 'Torno CNC Compacto',
        quantity: 1,
        unit: 'un',
        supplierName: 'CNC Brasil Máquinas',
        supplierEmail: 'vendas@cncbrasil.com.br',
        totalPrice: 45000.00,
        status: 'pending',
        createdAt: new Date('2024-06-11').toISOString()
      },
      {
        id: 7,
        orderNumber: 'COT-2024-007',
        productName: 'Parafusos Inox M8 (Lote)',
        quantity: 100,
        unit: 'un',
        supplierName: 'Fixadores Industriais',
        supplierEmail: 'vendas@fixadores.com.br',
        totalPrice: 850.00,
        status: 'confirmed',
        createdAt: new Date('2024-06-06').toISOString()
      }
    ];
  }
};

// Sample products data
const getSampleProducts = () => [
  {
    id: 1,
    name: 'Furadeira Industrial HD-2000',
    description: 'Furadeira industrial de alta potência com velocidade variável e mandril de precisão.',
    price: 1299.99,
    category: 'Ferramentas Elétricas',
    unit: 'un',
    supplier: 'TechTools Industrial',
    stock: 15,
    minimumOrder: 1,
    featured: true
  },
  {
    id: 2,
    name: 'Chapa de Aço Inox 304',
    description: 'Chapa de aço inoxidável 304 com espessura de 2mm, ideal para aplicações industriais.',
    price: 89.50,
    category: 'Materiais',
    unit: 'm²',
    supplier: 'Metalúrgica São Paulo',
    stock: 250,
    minimumOrder: 10,
    featured: false
  },
  {
    id: 3,
    name: 'Motor Elétrico Trifásico 5CV',
    description: 'Motor elétrico trifásico de 5CV, 220V/380V, com certificação INMETRO.',
    price: 2450.00,
    category: 'Motores',
    unit: 'un',
    supplier: 'Eletro Motors Ltda',
    stock: 8,
    minimumOrder: 1,
    featured: true
  },
  {
    id: 4,
    name: 'Válvula Pneumática 1/2"',
    description: 'Válvula pneumática de 1/2 polegada com acionamento manual e retorno por mola.',
    price: 156.75,
    category: 'Pneumática',
    unit: 'un',
    supplier: 'Pneumática Industrial',
    stock: 42,
    minimumOrder: 5,
    featured: false
  },
  {
    id: 5,
    name: 'Torno CNC Compacto',
    description: 'Torno CNC compacto para usinagem de peças pequenas e médias, com controle Fanuc.',
    price: 45000.00,
    category: 'Máquinas CNC',
    unit: 'un',
    supplier: 'CNC Brasil Máquinas',
    stock: 2,
    minimumOrder: 1,
    featured: true
  },
  {
    id: 6,
    name: 'Compressor de Ar 50L',
    description: 'Compressor de ar de 50 litros, 2HP, com kit de acessórios incluído.',
    price: 1850.00,
    category: 'Compressores',
    unit: 'un',
    supplier: 'AirTech Compressores',
    stock: 12,
    minimumOrder: 1,
    featured: false
  }
];

// Application constants and configuration
const getAppConstants = () => ({
  categories: [
    'Ferramentas Elétricas',
    'Materiais',
    'Motores',
    'Pneumática',
    'Máquinas CNC',
    'Compressores',
    'Equipamentos de Segurança',
    'Eletrônicos'
  ],
  
  industrialSectors: [
    { value: 'manufacturing', label: 'Manufatura' },
    { value: 'automotive', label: 'Automotivo' },
    { value: 'construction', label: 'Construção Civil' },
    { value: 'energy', label: 'Energia' },
    { value: 'food', label: 'Alimentício' },
    { value: 'textile', label: 'Têxtil' },
    { value: 'chemical', label: 'Químico' },
    { value: 'pharmaceutical', label: 'Farmacêutico' },
    { value: 'electronics', label: 'Eletrônicos' },
    { value: 'metallurgy', label: 'Metalurgia' },
    { value: 'agriculture', label: 'Agropecuário' },
    { value: 'logistics', label: 'Logística' }
  ],

  urgencyLevels: {
    low: { label: 'Baixa', color: 'green', days: 30 },
    medium: { label: 'Média', color: 'yellow', days: 15 },
    high: { label: 'Alta', color: 'orange', days: 7 },
    urgent: { label: 'Urgente', color: 'red', days: 3 }
  },

  quoteStatuses: {
    draft: { 
      label: 'Rascunho', 
      color: 'gray', 
      icon: 'FileText',
      description: 'Cotação em elaboração'
    },
    pending: { 
      label: 'Pendente', 
      color: 'yellow', 
      icon: 'Clock',
      description: 'Aguardando resposta dos fornecedores'
    },
    received: { 
      label: 'Recebida', 
      color: 'blue', 
      icon: 'Mail',
      description: 'Propostas recebidas dos fornecedores'
    },
    accepted: { 
      label: 'Aceita', 
      color: 'green', 
      icon: 'CheckCircle',
      description: 'Cotação aceita e convertida em pedido'
    },
    rejected: { 
      label: 'Rejeitada', 
      color: 'red', 
      icon: 'XCircle',
      description: 'Cotação rejeitada pelo solicitante'
    },
    expired: { 
      label: 'Expirada', 
      color: 'gray', 
      icon: 'AlertTriangle',
      description: 'Prazo da cotação expirado'
    }
  },

  userRoles: {
    admin: {
      label: 'Administrador',
      permissions: ['read', 'write', 'delete', 'admin'],
      description: 'Acesso total ao sistema'
    },
    supplier: {
      label: 'Fornecedor',
      permissions: ['read', 'write'],
      description: 'Pode visualizar cotações e enviar propostas'
    },
    buyer: {
      label: 'Comprador',
      permissions: ['read', 'write'],
      description: 'Pode criar cotações e aceitar propostas'
    }
  },

  orderStatuses: {
    pending: { label: 'Pendente', color: 'yellow' },
    confirmed: { label: 'Confirmado', color: 'blue' },
    shipped: { label: 'Enviado', color: 'purple' },
    delivered: { label: 'Entregue', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'red' }
  },

  shippingZones: {
    '0': { region: 'São Paulo', multiplier: 1.8, baseDays: 2 },
    '1': { region: 'São Paulo Interior', multiplier: 1.5, baseDays: 3 },
    '2': { region: 'Rio de Janeiro', multiplier: 1.3, baseDays: 3 },
    '3': { region: 'Minas Gerais', multiplier: 1.4, baseDays: 4 },
    '4': { region: 'Bahia', multiplier: 1.6, baseDays: 6 },
    '5': { region: 'Paraná', multiplier: 1.7, baseDays: 4 },
    '6': { region: 'Pernambuco', multiplier: 1.9, baseDays: 7 },
    '7': { region: 'Ceará', multiplier: 1.8, baseDays: 8 },
    '8': { region: 'Pará', multiplier: 2.0, baseDays: 10 },
    '9': { region: 'Rondônia', multiplier: 2.2, baseDays: 12 }
  },

  minimumOrderValues: {
    manufacturing: 500.00,
    construction: 300.00,
    automotive: 1000.00,
    electronics: 200.00,
    default: 250.00
  },

  leadTimes: {
    'Ferramentas Elétricas': { min: 2, max: 5 },
    'Materiais': { min: 1, max: 3 },
    'Motores': { min: 5, max: 15 },
    'Máquinas CNC': { min: 30, max: 90 },
    'default': { min: 3, max: 10 }
  }
});

// Company and static content
const getStaticContent = () => ({
  company: {
    name: 'B2B Marketplace',
    description: 'Plataforma de cotações industriais',
    contact: {
      email: 'contato@b2bmarketplace.com.br',
      phone: '(11) 3000-0000',
      address: 'Av. Paulista, 1000 - São Paulo, SP'
    }
  },
  
  features: [
    {
      id: 1,
      title: 'Cotações Rápidas',
      description: 'Solicite cotações e receba propostas de múltiplos fornecedores em minutos.',
      icon: 'Zap'
    },
    {
      id: 2,
      title: 'Fornecedores Verificados',
      description: 'Todos os fornecedores passam por processo de verificação e certificação.',
      icon: 'Shield'
    },
    {
      id: 3,
      title: 'Gestão Completa',
      description: 'Acompanhe todo o processo desde a cotação até a entrega do produto.',
      icon: 'Truck'
    },
    {
      id: 4,
      title: 'Preços Competitivos',
      description: 'Compare preços e condições para conseguir as melhores ofertas do mercado.',
      icon: 'DollarSign'
    },
    {
      id: 5,
      title: 'Suporte Especializado',
      description: 'Equipe especializada para te ajudar em todas as etapas do processo.',
      icon: 'Users'
    },
    {
      id: 6,
      title: 'Pagamento Seguro',
      description: 'Transações protegidas com as mais avançadas tecnologias de segurança.',
      icon: 'CreditCard'
    }
  ],

  stats: [
    { value: '10K+', label: 'Produtos Cadastrados' },
    { value: '500+', label: 'Fornecedores Ativos' },
    { value: '2K+', label: 'Empresas Conectadas' },
    { value: '50K+', label: 'Cotações Realizadas' }
  ],

  team: [
    {
      id: 1,
      name: 'Carlos Silva',
      role: 'CEO & Fundador',
      photo: '/images/team/carlos.jpg',
      bio: 'Especialista em gestão empresarial com 15 anos de experiência no setor industrial.'
    },
    {
      id: 2,
      name: 'Ana Santos',
      role: 'CTO',
      photo: '/images/team/ana.jpg',
      bio: 'Engenheira de software com expertise em desenvolvimento de plataformas B2B.'
    },
    {
      id: 3,
      name: 'Roberto Lima',
      role: 'Diretor Comercial',
      photo: '/images/team/roberto.jpg',
      bio: 'Profissional com vasta experiência em vendas B2B e relacionamento com fornecedores.'
    }
  ]
});

// API Endpoints

// Get sample orders for development/testing
router.get('/sample-orders', (req, res) => {
  try {
    const { role = 'buyer' } = req.query;
    const orders = getSampleOrders(role);
    
    res.json({
      success: true,
      data: { orders },
      meta: {
        total: orders.length,
        generated_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating sample orders',
      error: error.message
    });
  }
});

// Get sample products for development/testing
router.get('/sample-products', (req, res) => {
  try {
    const products = getSampleProducts();
    
    res.json({
      success: true,
      data: { products },
      meta: {
        total: products.length,
        generated_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating sample products',
      error: error.message
    });
  }
});

// Get application constants
router.get('/app-constants', (req, res) => {
  try {
    const constants = getAppConstants();
    
    res.json({
      success: true,
      data: constants,
      meta: {
        generated_at: new Date().toISOString(),
        cache_duration: '1h'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving app constants',
      error: error.message
    });
  }
});

// Get static content
router.get('/static-content', (req, res) => {
  try {
    const content = getStaticContent();
    
    res.json({
      success: true,
      data: content,
      meta: {
        generated_at: new Date().toISOString(),
        cache_duration: '24h'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving static content',
      error: error.message
    });
  }
});

// Get shipping zones configuration
router.get('/shipping-zones', (req, res) => {
  try {
    const constants = getAppConstants();
    
    res.json({
      success: true,
      data: {
        zones: constants.shippingZones,
        baseShipping: 25.50,
        weightMultiplier: 2.5,
        insuranceRate: 0.01,
        bulkDiscount: 0.15,
        bulkThreshold: 10
      },
      meta: {
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving shipping configuration',
      error: error.message
    });
  }
});

export default router;