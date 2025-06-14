const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load configuration
const config = require('./src/config/environment');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: config.isProduction(),
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: config.security.cors.origin,
  credentials: config.security.cors.credentials,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    version: config.app.apiVersion
  });
});

// API Routes
app.use(config.app.apiPrefix, routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Database connection
    await sequelize.authenticate();
    console.log(`✅ Database connected successfully (${config.app.env})`);
    
    // Sync database in development
    if (config.isDevelopment()) {
      await sequelize.sync({ force: false });
      console.log('📊 Database synchronized');
    }
    
    // Start server
    const server = app.listen(config.app.port, () => {
      console.log(`🚀 ${config.app.name} server running`);
      console.log(`📍 Environment: ${config.app.env}`);
      console.log(`🌐 Port: ${config.app.port}`);
      console.log(`📊 API: ${config.app.apiPrefix}/${config.app.apiVersion}`);
      
      if (config.isDevelopment()) {
        console.log(`🔗 Health check: http://localhost:${config.app.port}/health`);
        console.log(`🔗 API docs: http://localhost:${config.app.port}${config.app.apiPrefix}/docs`);
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
