/**
 * Sistema de tipos e validações para configurações
 * Fornece validação de tipos em tempo de execução e auto-completação
 */

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} url - URL de conexão do banco
 * @property {string} [testUrl] - URL de conexão para testes
 * @property {Object} pool - Configurações do pool de conexões
 * @property {number} pool.max - Máximo de conexões
 * @property {number} pool.min - Mínimo de conexões
 */

/**
 * @typedef {Object} SecurityConfig
 * @property {Object} jwt - Configurações JWT
 * @property {string} jwt.secret - Secret para assinar tokens
 * @property {string} jwt.expiresIn - Tempo de expiração
 * @property {string} [jwt.refreshSecret] - Secret para refresh tokens
 * @property {string} [jwt.refreshExpiresIn] - Tempo de expiração refresh
 * @property {Object} cors - Configurações CORS
 * @property {string[]|boolean} cors.origin - Origins permitidas
 * @property {boolean} cors.credentials - Permitir credenciais
 * @property {Object} rateLimit - Configurações de rate limiting
 * @property {number} rateLimit.windowMs - Janela de tempo
 * @property {number} rateLimit.max - Máximo de requests
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} name - Nome da aplicação
 * @property {'development'|'production'|'test'} env - Ambiente
 * @property {number} port - Porta do servidor
 * @property {string} apiVersion - Versão da API
 * @property {string} apiPrefix - Prefixo das rotas da API
 */

/**
 * @typedef {Object} EmailConfig
 * @property {string} [host] - Host do servidor SMTP
 * @property {number} [port] - Porta do servidor SMTP
 * @property {string} [user] - Usuário SMTP
 * @property {string} [pass] - Senha SMTP
 * @property {string} [from] - Email remetente padrão
 */

/**
 * @typedef {Object} UploadConfig
 * @property {number} maxFileSize - Tamanho máximo de arquivo
 * @property {string} path - Diretório de upload
 * @property {string[]} allowedTypes - Tipos MIME permitidos
 */

/**
 * @typedef {Object} FeaturesConfig
 * @property {boolean} enableRegistration - Permitir registro
 * @property {boolean} enablePasswordReset - Permitir reset de senha
 * @property {boolean} enableEmailVerification - Verificação de email
 * @property {boolean} enableTwoFactorAuth - Autenticação 2FA
 */

/**
 * @typedef {Object} LoggingConfig
 * @property {'error'|'warn'|'info'|'debug'} level - Nível de log
 * @property {string} file - Arquivo de log
 */

/**
 * @typedef {Object} PaymentConfig
 * @property {Object} pix - Configurações PIX
 * @property {string} [pix.clientId] - Client ID do PIX
 * @property {string} [pix.clientSecret] - Client Secret do PIX
 * @property {'sandbox'|'production'} [pix.environment] - Ambiente PIX
 */

/**
 * @typedef {Object} Configuration
 * @property {AppConfig} app - Configurações da aplicação
 * @property {DatabaseConfig} database - Configurações do banco
 * @property {SecurityConfig} security - Configurações de segurança
 * @property {EmailConfig} email - Configurações de email
 * @property {UploadConfig} upload - Configurações de upload
 * @property {FeaturesConfig} features - Feature flags
 * @property {LoggingConfig} logging - Configurações de log
 * @property {PaymentConfig} payment - Configurações de pagamento
 * @property {function(): boolean} isDevelopment - Verifica se é desenvolvimento
 * @property {function(): boolean} isProduction - Verifica se é produção
 * @property {function(): boolean} isTest - Verifica se é teste
 */

/**
 * Classe para validação de tipos em tempo de execução
 */
class TypeValidator {
  /**
   * Valida se um valor corresponde ao tipo esperado
   * @param {*} value - Valor a ser validado
   * @param {string} type - Tipo esperado
   * @param {string} path - Caminho da propriedade
   * @throws {TypeError} Se o tipo não corresponder
   */
  static validate(value, type, path = '') {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new TypeError(`${path} deve ser string, recebido ${typeof value}`);
        }
        break;
        
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new TypeError(`${path} deve ser number, recebido ${typeof value}`);
        }
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new TypeError(`${path} deve ser boolean, recebido ${typeof value}`);
        }
        break;
        
      case 'array':
        if (!Array.isArray(value)) {
          throw new TypeError(`${path} deve ser array, recebido ${typeof value}`);
        }
        break;
        
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new TypeError(`${path} deve ser object, recebido ${typeof value}`);
        }
        break;
        
      case 'function':
        if (typeof value !== 'function') {
          throw new TypeError(`${path} deve ser function, recebido ${typeof value}`);
        }
        break;
        
      default:
        throw new Error(`Tipo desconhecido: ${type}`);
    }
  }

  /**
   * Valida configuração completa
   * @param {Configuration} config - Configuração a ser validada
   */
  static validateConfiguration(config) {
    // Valida estrutura básica
    this.validate(config, 'object', 'config');
    
    // Valida app
    if (config.app) {
      this.validate(config.app, 'object', 'config.app');
      this.validate(config.app.name, 'string', 'config.app.name');
      this.validate(config.app.env, 'string', 'config.app.env');
      this.validate(config.app.port, 'number', 'config.app.port');
    }
    
    // Valida database
    if (config.database) {
      this.validate(config.database, 'object', 'config.database');
      this.validate(config.database.url, 'string', 'config.database.url');
      
      if (config.database.pool) {
        this.validate(config.database.pool, 'object', 'config.database.pool');
        this.validate(config.database.pool.max, 'number', 'config.database.pool.max');
        this.validate(config.database.pool.min, 'number', 'config.database.pool.min');
      }
    }
    
    // Valida security
    if (config.security) {
      this.validate(config.security, 'object', 'config.security');
      
      if (config.security.jwt) {
        this.validate(config.security.jwt, 'object', 'config.security.jwt');
        this.validate(config.security.jwt.secret, 'string', 'config.security.jwt.secret');
        this.validate(config.security.jwt.expiresIn, 'string', 'config.security.jwt.expiresIn');
      }
    }
    
    // Valida funções auxiliares
    this.validate(config.isDevelopment, 'function', 'config.isDevelopment');
    this.validate(config.isProduction, 'function', 'config.isProduction');
    this.validate(config.isTest, 'function', 'config.isTest');
  }
}

/**
 * Esquemas de validação para diferentes partes da configuração
 */
const configSchemas = {
  app: {
    name: { type: 'string', required: true },
    env: { type: 'string', required: true, enum: ['development', 'production', 'test'] },
    port: { type: 'number', required: true, min: 1, max: 65535 },
    apiVersion: { type: 'string', required: false, default: 'v1' },
    apiPrefix: { type: 'string', required: false, default: '/api' }
  },
  
  database: {
    url: { type: 'string', required: true, format: 'connection-string' },
    testUrl: { type: 'string', required: false, format: 'connection-string' },
    pool: {
      max: { type: 'number', required: false, min: 1, max: 100, default: 5 },
      min: { type: 'number', required: false, min: 0, max: 50, default: 0 }
    }
  },
  
  security: {
    jwt: {
      secret: { type: 'string', required: true, minLength: 32, format: 'jwt-secret' },
      expiresIn: { type: 'string', required: false, default: '7d' },
      refreshSecret: { type: 'string', required: false, minLength: 32, format: 'jwt-secret' },
      refreshExpiresIn: { type: 'string', required: false, default: '30d' }
    },
    cors: {
      origin: { type: 'array|boolean', required: false },
      credentials: { type: 'boolean', required: false, default: false }
    },
    rateLimit: {
      windowMs: { type: 'number', required: false, min: 1000, default: 900000 },
      max: { type: 'number', required: false, min: 1, default: 100 }
    }
  }
};

/**
 * Utilitário para criar configuração tipada
 * @param {Object} rawConfig - Configuração raw
 * @returns {Configuration} Configuração tipada e validada
 */
function createTypedConfiguration(rawConfig) {
  // Valida tipos básicos
  TypeValidator.validateConfiguration(rawConfig);
  
  // Adiciona métodos de conveniência se não existirem
  if (!rawConfig.isDevelopment) {
    rawConfig.isDevelopment = () => rawConfig.NODE_ENV === 'development';
  }
  
  if (!rawConfig.isProduction) {
    rawConfig.isProduction = () => rawConfig.NODE_ENV === 'production';
  }
  
  if (!rawConfig.isTest) {
    rawConfig.isTest = () => rawConfig.NODE_ENV === 'test';
  }
  
  // Congela objeto para prevenir modificações acidentais
  return Object.freeze(rawConfig);
}

/**
 * Validador de runtime para interceptar acessos a propriedades
 */
function createConfigProxy(config) {
  return new Proxy(config, {
    get(target, prop) {
      const value = target[prop];
      
      // Log de acesso em desenvolvimento
      if (target.isDevelopment && target.isDevelopment() && typeof value !== 'function') {
        console.debug(`Config access: ${prop} = ${typeof value === 'string' && value.length > 20 ? '[REDACTED]' : value}`);
      }
      
      return value;
    },
    
    set(target, prop, value) {
      throw new Error(`Configuração é readonly. Tentativa de modificar ${prop}`);
    }
  });
}

export {
  TypeValidator,
  configSchemas,
  createTypedConfiguration,
  createConfigProxy
};