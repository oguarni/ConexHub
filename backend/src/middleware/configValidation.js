/**
 * Middleware para validação de configuração em tempo real
 * Garante que a aplicação só funcione com configuração válida
 */

const config = require('../config');
const { AppError } = require('./errorHandler');

/**
 * Middleware que valida configuração crítica antes de processar requests
 */
const validateCriticalConfig = (req, res, next) => {
  try {
    // Verifica configurações críticas de segurança
    const criticalChecks = [
      {
        condition: !config.JWT_SECRET,
        error: 'JWT_SECRET não configurado',
        code: 'MISSING_JWT_SECRET'
      },
      {
        condition: config.JWT_SECRET && config.JWT_SECRET.length < 32,
        error: 'JWT_SECRET muito curto (mínimo 32 caracteres)',
        code: 'WEAK_JWT_SECRET'
      },
      {
        condition: !config.DATABASE_URL,
        error: 'DATABASE_URL não configurado',
        code: 'MISSING_DATABASE_URL'
      },
      {
        condition: config.isProduction() && !config.JWT_REFRESH_SECRET,
        error: 'JWT_REFRESH_SECRET obrigatório em produção',
        code: 'MISSING_REFRESH_SECRET'
      },
      {
        condition: config.isProduction() && config.JWT_SECRET === config.JWT_REFRESH_SECRET,
        error: 'JWT_SECRET e JWT_REFRESH_SECRET devem ser diferentes',
        code: 'IDENTICAL_SECRETS'
      }
    ];

    // Executa verificações
    for (const check of criticalChecks) {
      if (check.condition) {
        throw new AppError(check.error, 500, check.code);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware que adiciona informações de configuração aos headers de resposta
 * (apenas em desenvolvimento)
 */
const addConfigHeaders = (req, res, next) => {
  if (config.isDevelopment()) {
    res.set('X-App-Environment', config.NODE_ENV);
    res.set('X-App-Version', config.app?.apiVersion || 'unknown');
  }
  next();
};

/**
 * Middleware que verifica se features estão habilitadas
 */
const checkFeatureFlag = (featureName) => {
  return (req, res, next) => {
    const featureKey = `ENABLE_${featureName.toUpperCase()}`;
    
    if (config[featureKey] === false) {
      throw new AppError(
        `Feature '${featureName}' está desabilitada`,
        503,
        'FEATURE_DISABLED'
      );
    }
    
    next();
  };
};

/**
 * Middleware que valida configuração CORS para a requisição atual
 */
const validateCorsConfig = (req, res, next) => {
  if (config.isProduction()) {
    const origin = req.get('origin');
    
    if (origin && config.ALLOWED_ORIGINS && config.ALLOWED_ORIGINS.length > 0) {
      if (!config.ALLOWED_ORIGINS.includes(origin)) {
        throw new AppError(
          'Origin não permitida',
          403,
          'CORS_ORIGIN_NOT_ALLOWED'
        );
      }
    }
  }
  
  next();
};

/**
 * Middleware que monitora uso de configuração
 */
const monitorConfigUsage = (req, res, next) => {
  if (config.isDevelopment()) {
    // Adiciona timestamp de último acesso
    req.configAccess = {
      timestamp: new Date(),
      environment: config.NODE_ENV,
      features: Object.keys(config).filter(key => key.startsWith('ENABLE_'))
    };
  }
  
  next();
};

/**
 * Middleware que valida rate limiting baseado na configuração
 */
const validateRateLimit = (req, res, next) => {
  // Aplica rate limiting mais restritivo em produção
  if (config.isProduction()) {
    const windowMs = config.RATE_LIMIT_WINDOW_MS || 900000; // 15 min
    const maxRequests = config.RATE_LIMIT_MAX_REQUESTS || 100;
    
    // Aqui você integraria com o express-rate-limit
    // Este é apenas um exemplo de como usar a configuração
    req.rateLimitConfig = {
      windowMs,
      max: maxRequests
    };
  }
  
  next();
};

/**
 * Middleware de segurança que valida configuração de ambiente
 */
const validateEnvironmentSecurity = (req, res, next) => {
  try {
    const securityChecks = [
      {
        condition: config.isProduction() && config.NODE_ENV !== 'production',
        error: 'Inconsistência na configuração de ambiente',
        code: 'ENV_MISMATCH'
      },
      {
        condition: config.isProduction() && req.protocol !== 'https',
        error: 'HTTPS obrigatório em produção',
        code: 'HTTPS_REQUIRED'
      },
      {
        condition: config.JWT_SECRET && config.JWT_SECRET.includes('your-secret'),
        error: 'JWT_SECRET não deve conter valores padrão',
        code: 'DEFAULT_SECRET_DETECTED'
      }
    ];

    for (const check of securityChecks) {
      if (check.condition) {
        throw new AppError(check.error, 500, check.code);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware que cria snapshot da configuração para debugging
 */
const createConfigSnapshot = (req, res, next) => {
  if (config.isDevelopment() && req.query.debug === 'config') {
    const snapshot = {
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      port: config.PORT,
      features: config.getConfigReport ? config.getConfigReport() : 'N/A',
      // Não inclui dados sensíveis
      security: {
        jwtConfigured: !!config.JWT_SECRET,
        corsConfigured: !!config.ALLOWED_ORIGINS,
        rateLimitEnabled: !!config.RATE_LIMIT_MAX_REQUESTS
      }
    };
    
    res.json({
      success: true,
      message: 'Configuration snapshot',
      data: snapshot
    });
    return;
  }
  
  next();
};

/**
 * Middleware combinado para validação completa
 */
const fullConfigValidation = [
  validateCriticalConfig,
  validateEnvironmentSecurity,
  addConfigHeaders,
  monitorConfigUsage
];

module.exports = {
  validateCriticalConfig,
  addConfigHeaders,
  checkFeatureFlag,
  validateCorsConfig,
  monitorConfigUsage,
  validateRateLimit,
  validateEnvironmentSecurity,
  createConfigSnapshot,
  fullConfigValidation
};