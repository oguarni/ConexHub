import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Sistema de configuração centralizado e seguro
 * Valida e exporta todas as variáveis de ambiente necessárias
 */

// Classe para erros de configuração
class ConfigurationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ConfigurationError';
    this.details = details;
  }
}

// Validadores customizados
const validators = {
  /**
   * Valida se é uma string não vazia
   */
  requiredString: (value, name) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ConfigurationError(`${name} deve ser uma string não vazia`);
    }
    return value.trim();
  },

  /**
   * Valida se é um número válido dentro de um range
   */
  numberInRange: (min, max) => (value, name) => {
    const num = parseInt(value);
    if (isNaN(num) || num < min || num > max) {
      throw new ConfigurationError(`${name} deve ser um número entre ${min} e ${max}, recebido: ${value}`);
    }
    return num;
  },

  /**
   * Valida se é uma URL válida
   */
  url: (value, name) => {
    if (!value) throw new ConfigurationError(`${name} é obrigatório`);
    try {
      new URL(value);
      return value;
    } catch {
      throw new ConfigurationError(`${name} deve ser uma URL válida, recebido: ${value}`);
    }
  },

  /**
   * Valida se é um email válido
   */
  email: (value, name) => {
    if (!value) return null; // opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ConfigurationError(`${name} deve ser um email válido, recebido: ${value}`);
    }
    return value;
  },

  /**
   * Valida JWT secret com critérios de segurança rigorosos
   */
  jwtSecret: (value, name) => {
    if (!value) {
      throw new ConfigurationError(`${name} é obrigatório`);
    }
    
    // Verificações de segurança
    const errors = [];
    
    if (value.length < 32) {
      errors.push('deve ter pelo menos 32 caracteres');
    }
    
    if (!/[A-Z]/.test(value)) {
      errors.push('deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(value)) {
      errors.push('deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(value)) {
      errors.push('deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('deve conter pelo menos um caractere especial');
    }
    
    // Verifica se não é um secret conhecido inseguro
    const insecureSecrets = [
      'your-super-secret-jwt-key',
      'your-secret-key',
      'secret',
      'password',
      'jwt-secret',
      '123456',
      'change-me'
    ];
    
    if (insecureSecrets.some(insecure => value.toLowerCase().includes(insecure))) {
      errors.push('não pode conter padrões inseguros conhecidos');
    }
    
    if (errors.length > 0) {
      throw new ConfigurationError(`${name} ${errors.join(', ')}`);
    }
    
    return value;
  },

  /**
   * Valida string de conexão de banco de dados
   */
  databaseUrl: (value, name) => {
    if (!value) {
      throw new ConfigurationError(`${name} é obrigatório`);
    }
    
    // Verifica formato básico
    if (!value.includes('://')) {
      throw new ConfigurationError(`${name} deve ser uma URL de conexão válida`);
    }
    
    // Verifica se não contém credenciais hardcoded inseguras
    if (value.includes('password@') || value.includes(':password@')) {
      throw new ConfigurationError(`${name} não deve conter credenciais hardcoded`);
    }
    
    return value;
  },

  /**
   * Valida ambiente (development, production, test)
   */
  environment: (value, name) => {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(value)) {
      throw new ConfigurationError(`${name} deve ser um de: ${validEnvs.join(', ')}, recebido: ${value}`);
    }
    return value;
  },

  /**
   * Valida booleano
   */
  boolean: (value, name) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off', ''].includes(lower)) return false;
    }
    throw new ConfigurationError(`${name} deve ser um valor booleano válido, recebido: ${value}`);
  },

  /**
   * Valida lista separada por vírgulas
   */
  commaSeparatedList: (value, name) => {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
};

// Definição do schema de configuração
const configSchema = {
  // Aplicação
  NODE_ENV: { validator: validators.environment, required: true, default: 'development' },
  PORT: { validator: validators.numberInRange(1, 65535), required: true, default: 3001 },
  
  // Segurança
  JWT_SECRET: { validator: validators.jwtSecret, required: true, sensitive: true },
  JWT_EXPIRES_IN: { validator: validators.requiredString, required: false, default: '7d' },
  JWT_REFRESH_SECRET: { validator: validators.jwtSecret, required: false, sensitive: true },
  JWT_REFRESH_EXPIRES_IN: { validator: validators.requiredString, required: false, default: '30d' },
  
  // Banco de dados
  DATABASE_URL: { validator: validators.databaseUrl, required: true, sensitive: true },
  TEST_DATABASE_URL: { validator: validators.databaseUrl, required: false, sensitive: true },
  DB_POOL_MAX: { validator: validators.numberInRange(1, 100), required: false, default: 5 },
  DB_POOL_MIN: { validator: validators.numberInRange(0, 50), required: false, default: 0 },
  
  // URLs e endpoints
  FRONTEND_URL: { validator: validators.url, required: true, default: 'http://localhost:3000' },
  API_PREFIX: { validator: validators.requiredString, required: false, default: '/api' },
  
  // CORS
  ALLOWED_ORIGINS: { validator: validators.commaSeparatedList, required: false },
  CORS_CREDENTIALS: { validator: validators.boolean, required: false, default: false },
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: { validator: validators.numberInRange(1000, 3600000), required: false, default: 900000 },
  RATE_LIMIT_MAX_REQUESTS: { validator: validators.numberInRange(1, 10000), required: false, default: 100 },
  
  // Email (opcional)
  SMTP_HOST: { validator: validators.requiredString, required: false },
  SMTP_PORT: { validator: validators.numberInRange(1, 65535), required: false, default: 587 },
  SMTP_USER: { validator: validators.requiredString, required: false, sensitive: true },
  SMTP_PASS: { validator: validators.requiredString, required: false, sensitive: true },
  FROM_EMAIL: { validator: validators.email, required: false },
  
  // Upload
  MAX_FILE_SIZE: { validator: validators.numberInRange(1024, 100 * 1024 * 1024), required: false, default: 5 * 1024 * 1024 },
  UPLOAD_PATH: { validator: validators.requiredString, required: false, default: './uploads' },
  
  // Logs
  LOG_LEVEL: { validator: validators.requiredString, required: false, default: 'info' },
  LOG_FILE: { validator: validators.requiredString, required: false, default: './logs/app.log' },
  
  // Feature flags
  ENABLE_REGISTRATION: { validator: validators.boolean, required: false, default: true },
  ENABLE_PASSWORD_RESET: { validator: validators.boolean, required: false, default: true },
  ENABLE_EMAIL_VERIFICATION: { validator: validators.boolean, required: false, default: false },
  ENABLE_2FA: { validator: validators.boolean, required: false, default: false },
  
  // Pagamento PIX
  PIX_CLIENT_ID: { validator: validators.requiredString, required: false, sensitive: true },
  PIX_CLIENT_SECRET: { validator: validators.requiredString, required: false, sensitive: true },
  PIX_ENVIRONMENT: { validator: validators.requiredString, required: false, default: 'sandbox' },
  
  // Admin
  ADMIN_EMAIL: { validator: validators.email, required: false, default: 'admin@b2bmarketplace.com' }
};

/**
 * Valida e processa uma variável de ambiente
 */
function validateConfigValue(key, schema) {
  const envValue = process.env[key];
  const { validator, required, default: defaultValue, sensitive = false } = schema;
  
  // Se não fornecido e é obrigatório
  if (!envValue && required && defaultValue === undefined) {
    throw new ConfigurationError(`Variável de ambiente obrigatória não encontrada: ${key}`);
  }
  
  // Usa valor padrão se não fornecido
  const valueToValidate = envValue || defaultValue;
  
  // Se ainda não tem valor e não é obrigatório, retorna undefined
  if (valueToValidate === undefined) {
    return undefined;
  }
  
  try {
    return validator(valueToValidate, key);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw new ConfigurationError(`Erro na configuração ${key}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Carrega e valida todas as configurações
 */
function loadConfiguration() {
  const config = {};
  const errors = [];
  const warnings = [];
  
  // Processa cada configuração
  for (const [key, schema] of Object.entries(configSchema)) {
    try {
      config[key] = validateConfigValue(key, schema);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  // Se há erros, falha
  if (errors.length > 0) {
    throw new ConfigurationError(
      `Falha na validação da configuração:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
  
  // Validações cruzadas
  validateCrossReferences(config, warnings);
  
  // Log de warnings se em desenvolvimento
  if (config.NODE_ENV === 'development' && warnings.length > 0) {
    console.warn('⚠️  Avisos de configuração:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return config;
}

/**
 * Validações que dependem de múltiplas configurações
 */
function validateCrossReferences(config, warnings) {
  // JWT refresh secret deve ser diferente do principal
  if (config.JWT_REFRESH_SECRET && config.JWT_REFRESH_SECRET === config.JWT_SECRET) {
    throw new ConfigurationError('JWT_REFRESH_SECRET deve ser diferente de JWT_SECRET');
  }
  
  // Em produção, certas configurações são obrigatórias
  if (config.NODE_ENV === 'production') {
    if (!config.JWT_REFRESH_SECRET) {
      warnings.push('JWT_REFRESH_SECRET recomendado em produção');
    }
    
    if (!config.SMTP_HOST) {
      warnings.push('Configuração de email recomendada em produção');
    }
    
    if (config.CORS_CREDENTIALS && (!config.ALLOWED_ORIGINS || config.ALLOWED_ORIGINS.length === 0)) {
      throw new ConfigurationError('ALLOWED_ORIGINS obrigatório quando CORS_CREDENTIALS está habilitado');
    }
  }
  
  // Verifica se URLs de banco de teste e produção são diferentes
  if (config.TEST_DATABASE_URL && config.TEST_DATABASE_URL === config.DATABASE_URL) {
    warnings.push('TEST_DATABASE_URL deve ser diferente de DATABASE_URL');
  }
}

/**
 * Gera relatório de configuração (sem dados sensíveis)
 */
function getConfigReport(config) {
  const report = {
    environment: config.NODE_ENV,
    port: config.PORT,
    features: {
      registration: config.ENABLE_REGISTRATION,
      passwordReset: config.ENABLE_PASSWORD_RESET,
      emailVerification: config.ENABLE_EMAIL_VERIFICATION,
      twoFactorAuth: config.ENABLE_2FA
    },
    security: {
      jwtConfigured: !!config.JWT_SECRET,
      refreshTokenConfigured: !!config.JWT_REFRESH_SECRET,
      corsEnabled: !!config.ALLOWED_ORIGINS?.length
    },
    integrations: {
      email: !!config.SMTP_HOST,
      pix: !!config.PIX_CLIENT_ID
    }
  };
  
  return report;
}

/**
 * Função utilitária para mascarar valores sensíveis em logs
 */
function maskSensitiveValue(value) {
  if (!value || typeof value !== 'string') return value;
  if (value.length <= 8) return '***';
  return value.substring(0, 3) + '*'.repeat(value.length - 6) + value.substring(value.length - 3);
}

/**
 * Gera novo JWT secret seguro
 */
function generateSecureJwtSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  
  // Garante pelo menos um de cada tipo
  result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // maiúscula
  result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // minúscula
  result += '0123456789'[Math.floor(Math.random() * 10)]; // número
  result += '!@#$%^&*()_+-='[Math.floor(Math.random() * 13)]; // especial
  
  // Preenche o resto
  for (let i = 4; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Embaralha
  return result.split('').sort(() => Math.random() - 0.5).join('');
}

// Carrega configuração
let configuration;
try {
  configuration = loadConfiguration();
  
  // Log de inicialização (apenas em desenvolvimento)
  if (configuration.NODE_ENV === 'development') {
    console.log('✅ Configuração carregada com sucesso');
    console.log('📊 Relatório:', getConfigReport(configuration));
  }
} catch (error) {
  console.error('❌ Erro fatal na configuração:', error.message);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  } else {
    throw error;
  }
}

// Exporta configuração e utilitários
export default {
  ...configuration,
  
  // Utilitários
  isDevelopment: () => configuration.NODE_ENV === 'development',
  isProduction: () => configuration.NODE_ENV === 'production',
  isTest: () => configuration.NODE_ENV === 'test',
  
  // Funções auxiliares
  getConfigReport: () => getConfigReport(configuration),
  maskSensitiveValue,
  generateSecureJwtSecret,
  
  // Para testes
  _validators: validators,
  _validateConfigValue: validateConfigValue,
  ConfigurationError
};

// Named exports for specific utilities
export { ConfigurationError, validators as _validators, validateConfigValue as _validateConfigValue };