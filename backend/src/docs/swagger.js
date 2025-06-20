import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'B2B Marketplace API',
      version: '1.0.0',
      description: 'API completa para marketplace B2B industrial com sistema de cotações, gestão de fornecedores e análises.',
      contact: {
        name: 'B2B Marketplace Team',
        email: 'dev@b2bmarketplace.com',
        url: 'https://b2bmarketplace.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.isDevelopment() 
          ? `http://localhost:${config.PORT}${config.API_PREFIX}` 
          : `${config.FRONTEND_URL}${config.API_PREFIX}`,
        description: config.isDevelopment() ? 'Development server' : 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer {token}'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'cpf'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@empresa.com'
            },
            cpf: {
              type: 'string',
              pattern: '^\\d{11}$',
              description: 'CPF do usuário (apenas números)',
              example: '12345678901'
            },
            role: {
              type: 'string',
              enum: ['buyer', 'supplier', 'admin'],
              description: 'Tipo de usuário'
            },
            isActive: {
              type: 'boolean',
              description: 'Status do usuário'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            }
          }
        },
        
        // Product Schemas
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock', 'categoryId', 'supplierId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do produto'
            },
            name: {
              type: 'string',
              description: 'Nome do produto',
              example: 'Furadeira Industrial 1200W'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              example: 'Furadeira industrial de alta potência com velocidade variável'
            },
            price: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço unitário do produto',
              example: 450.00
            },
            stock: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade em estoque',
              example: 15
            },
            unit: {
              type: 'string',
              description: 'Unidade de medida',
              example: 'unidade'
            },
            minOrder: {
              type: 'integer',
              minimum: 1,
              description: 'Quantidade mínima para pedido',
              example: 1
            },
            category: {
              type: 'string',
              description: 'Nome da categoria',
              example: 'Ferramentas'
            },
            featured: {
              type: 'boolean',
              description: 'Produto em destaque'
            },
            isActive: {
              type: 'boolean',
              description: 'Status do produto'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'URLs das imagens do produto'
            },
            supplierId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do fornecedor'
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'ID da categoria'
            }
          }
        },
        
        // Quote Schemas
        Quote: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da cotação'
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do produto'
            },
            buyerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do comprador'
            },
            supplierId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do fornecedor'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Quantidade solicitada',
              example: 10
            },
            unitPrice: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço unitário proposto',
              example: 420.00
            },
            totalPrice: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço total da cotação',
              example: 4200.00
            },
            status: {
              type: 'string',
              enum: ['pending', 'quoted', 'accepted', 'rejected', 'expired'],
              description: 'Status da cotação'
            },
            message: {
              type: 'string',
              description: 'Mensagem adicional',
              example: 'Preciso desta quantidade para projeto urgente'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de expiração da cotação'
            }
          }
        },
        
        // Order Schemas
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do pedido'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário que fez o pedido'
            },
            supplierId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do fornecedor'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              description: 'Subtotal do pedido'
            },
            shipping: {
              type: 'number',
              format: 'decimal',
              description: 'Valor do frete'
            },
            total: {
              type: 'number',
              format: 'decimal',
              description: 'Valor total do pedido'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Status do pedido'
            },
            paymentMethod: {
              type: 'string',
              enum: ['pix', 'credit_card', 'bank_transfer', 'boleto'],
              description: 'Método de pagamento'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
              description: 'Status do pagamento'
            }
          }
        },
        
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'uuid'
            },
            quantity: {
              type: 'integer',
              minimum: 1
            },
            unitPrice: {
              type: 'number',
              format: 'decimal'
            },
            total: {
              type: 'number',
              format: 'decimal'
            }
          }
        },
        
        // Supplier Schemas
        Supplier: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            companyName: {
              type: 'string',
              example: 'TechSupply Ltda'
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              example: '12345678000100'
            },
            description: {
              type: 'string',
              example: 'Fornecedor especializado em equipamentos tecnológicos'
            },
            phone: {
              type: 'string',
              example: '(11) 99999-9999'
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://techsupply.com.br'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                number: { type: 'string' },
                complement: { type: 'string' },
                neighborhood: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' }
              }
            },
            verified: {
              type: 'boolean',
              description: 'Fornecedor verificado pelo sistema'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Avaliação média do fornecedor'
            }
          }
        },
        
        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Recurso não encontrado'
            },
            code: {
              type: 'string',
              description: 'Código do erro',
              example: 'RESOURCE_NOT_FOUND'
            },
            details: {
              type: 'object',
              description: 'Detalhes adicionais do erro'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Dados de entrada inválidos'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email deve ter um formato válido'
                  },
                  value: {
                    type: 'string',
                    example: 'email-invalido'
                  }
                }
              }
            }
          }
        },
        
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela operação'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso ausente ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Token de acesso requerido',
                code: 'UNAUTHORIZED',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado - permissões insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Acesso negado',
                code: 'FORBIDDEN',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Recurso não encontrado',
                code: 'NOT_FOUND',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação dos dados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        ServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Erro interno do servidor',
                code: 'INTERNAL_SERVER_ERROR',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints para autenticação e gestão de usuários'
      },
      {
        name: 'Products',
        description: 'Gestão de produtos do marketplace'
      },
      {
        name: 'Quotes',
        description: 'Sistema de cotações B2B'
      },
      {
        name: 'Orders',
        description: 'Gestão de pedidos e vendas'
      },
      {
        name: 'Suppliers',
        description: 'Gestão de fornecedores'
      },
      {
        name: 'Categories',
        description: 'Categorias de produtos'
      },
      {
        name: 'Analytics',
        description: 'Relatórios e análises'
      },
      {
        name: 'Admin',
        description: 'Funcionalidades administrativas'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/docs/paths/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;