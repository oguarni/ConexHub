import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET'
];

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Environment configuration with defaults and validation
const config = {
  // Application
  app: {
    name: 'B2B Marketplace',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api'
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.TEST_DATABASE_URL,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  },

  // Security
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },
    session: {
      secret: process.env.SESSION_SECRET,
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [process.env.FRONTEND_URL || 'http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.FROM_EMAIL || 'noreply@b2bmarketplace.com'
  },

  // Payment
  payment: {
    pix: {
      clientId: process.env.PIX_CLIENT_ID,
      clientSecret: process.env.PIX_CLIENT_SECRET,
      environment: process.env.PIX_ENVIRONMENT || 'sandbox'
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // Feature flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableTwoFactorAuth: process.env.ENABLE_2FA === 'true'
  }
};

// Validation functions
const validateConfig = () => {
  const errors = [];

  // Validate JWT secret strength
  if (config.security.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate database URL format
  if (!config.database.url.includes('://')) {
    errors.push('DATABASE_URL must be a valid connection string');
  }

  // Validate port range
  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  // Validate pool settings
  if (config.database.pool.max < config.database.pool.min) {
    errors.push('DB_POOL_MAX must be greater than or equal to DB_POOL_MIN');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    database: {
      logging: console.log
    },
    security: {
      cors: {
        origin: true // Allow all origins in development
      }
    }
  },
  
  production: {
    database: {
      logging: false
    },
    security: {
      cors: {
        origin: config.security.cors.origin // Strict CORS in production
      }
    }
  },
  
  test: {
    database: {
      logging: false
    },
    security: {
      rateLimit: {
        max: 1000 // Higher limit for tests
      }
    }
  }
};

// Merge environment-specific config
const envConfig = environmentConfigs[config.app.env] || {};
const finalConfig = {
  ...config,
  database: { ...config.database, ...envConfig.database },
  security: { 
    ...config.security, 
    ...envConfig.security,
    cors: { ...config.security.cors, ...envConfig.security?.cors }
  }
};

// Helper functions
const isDevelopment = () => finalConfig.app.env === 'development';
const isProduction = () => finalConfig.app.env === 'production';
const isTest = () => finalConfig.app.env === 'test';

export default {
  ...finalConfig,
  isDevelopment,
  isProduction,
  isTest,
  validateConfig
};

export {
  isDevelopment,
  isProduction,
  isTest,
  validateConfig
};