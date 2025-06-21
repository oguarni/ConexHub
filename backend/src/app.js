import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// Load configuration
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import validateConfig from './middleware/configValidation.js';

const app = express();

// Security Middleware - test-friendly CSP
if (process.env.NODE_ENV !== 'test') {
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
}

app.use(helmet({
  contentSecurityPolicy: false, // We're handling CSP manually above
  hsts: config.isProduction(),
}));

// Rate limiting (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
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
}

// Compression
app.use(compression());

// Configuration validation middleware (disabled in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(validateConfig);
}

// CORS
app.use(cors({
  origin: config.ALLOWED_ORIGINS || config.FRONTEND_URL || true,
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

// Logging (disabled in test)
if (!config.isTest() && process.env.NODE_ENV !== 'test') {
  app.use(morgan(config.isDevelopment() ? 'dev' : 'combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use(config.API_PREFIX || '/api', routes);

// 404 handler
app.use('*', notFoundHandler);

// Error handling
app.use(errorHandler);

export default app;