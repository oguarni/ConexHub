import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import * as swaggerUi from 'swagger-ui-express';

// Load configuration
import config from './src/config/index.js';
import { sequelize } from './src/models/index.js';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import validateConfig from './src/middleware/configValidation.js';
import swaggerSpec from './src/docs/swagger.js';

const app = express();

// Security Middleware - strict CSP with nonce support

// Generate nonce for each request
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Apply strict CSP to all routes except docs
app.use((req, res, next) => {
  if (req.path.startsWith('/docs')) {
    // Relaxed CSP for Swagger UI only
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: https://validator.swagger.io",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://validator.swagger.io"
    ].join('; '));
  } else {
    // Strict CSP for application routes
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      `script-src 'self' 'nonce-${res.locals.nonce}'`,
      "style-src 'self' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '));
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: false, // We're handling CSP manually above
  hsts: config.isProduction(),
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS || 900000,
  max: config.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((config.RATE_LIMIT_WINDOW_MS || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression
app.use(compression());

// Configuration validation middleware - now Docker-compatible
app.use(validateConfig);

// CORS
app.use(cors({
  origin: config.ALLOWED_ORIGINS || config.FRONTEND_URL,
  credentials: config.CORS_CREDENTIALS || false,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (!config.isTest()) {
  app.use(morgan(config.isDevelopment() ? 'dev' : 'combined'));
}

// Swagger Documentation
if (config.isDevelopment() || process.env.ENABLE_DOCS === 'true') {
  const swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    customSiteTitle: 'B2B Marketplace API Documentation',
    customfavIcon: '/assets/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  };
  
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  
  // JSON endpoint for OpenAPI spec
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 API Documentation available at: http://localhost:${config.PORT}/docs`);
}

// Health check endpoint - simplified for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use(config.API_PREFIX || '/api', routes);

// 404 handler
app.use('*', notFoundHandler);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Database connection
    await sequelize.authenticate();
    console.log(`✅ Database connected successfully (${config.app?.env || 'unknown'})`);
    
    // Sync database in development
    if (config.isDevelopment()) {
      await sequelize.sync({ force: false });
      console.log('📊 Database synchronized');
    }
    
    // Start server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 B2B Marketplace server running`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Port: ${config.PORT}`);
      console.log(`📊 API: ${config.API_PREFIX || '/api'}`);
      
      if (config.isDevelopment()) {
        console.log(`🔗 Health check: http://localhost:${config.PORT}/health`);
        console.log(`🔗 Config validation: http://localhost:${config.PORT}/health?debug=config`);
        console.log(`🔧 Validate config: npm run validate-config`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('🔌 Database connection closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
