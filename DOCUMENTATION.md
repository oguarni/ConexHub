# 📚 ConexHub - Complete Documentation

<div align="center">

![ConexHub Logo](https://img.shields.io/badge/ConexHub-Documentation-16a34a?style=for-the-badge&logo=book)

**Complete technical documentation for the ConexHub B2B Marketplace platform**

[🏠 Main README](README.md) • [🚀 Quick Start](#quick-start) • [📖 API Docs](#api-documentation) • [🔧 Deployment](#deployment)

</div>

---

## 📋 Table of Contents

### 🏗️ **Architecture & Setup**
- [Project Architecture](#project-architecture)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Docker Configuration](#docker-configuration)

### 🔒 **Security & Best Practices**
- [Security Implementation](#security-implementation)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Security](#environment-security)
- [Security Checklist](#security-checklist)

### 📖 **API Documentation**
- [API Overview](#api-overview)
- [Authentication Endpoints](#authentication-endpoints)
- [Product Management](#product-management)
- [B2B Quotations](#b2b-quotations)
- [Payment Integration](#payment-integration)

### 🚀 **Performance & Optimization**
- [Frontend Performance](#frontend-performance)
- [Backend Optimization](#backend-optimization)
- [Database Performance](#database-performance)
- [Caching Strategies](#caching-strategies)

### 🌐 **Deployment & Operations**
- [Deployment Guide](#deployment-guide)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

### 🧪 **Development & Testing**
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Code Quality](#code-quality)
- [Contribution Guidelines](#contribution-guidelines)

---

## 🏗️ Project Architecture

### Technology Stack

**Frontend (React.js)**
- **React 18.2.0** with modern hooks and context
- **TailwindCSS** for responsive styling
- **React Router v6** for client-side routing
- **TanStack Query** for server state management
- **Axios** for HTTP requests

**Backend (Node.js)**
- **Express.js** with ES6 modules
- **Sequelize ORM** with PostgreSQL
- **JWT** authentication with refresh tokens
- **Express-validator** for input validation
- **Helmet** for security headers

**Infrastructure**
- **Docker & Docker Compose** for containerization
- **PostgreSQL 15** for primary database
- **Redis** for caching and sessions
- **Nginx** for reverse proxy (production)

### Application Structure

```
ConexHub/
├── backend/                     # Node.js API Server
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── services/            # Business logic
│   │   └── config/              # Configuration management
│   ├── migrations/              # Database migrations
│   └── tests/                   # Backend tests
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   └── public/                  # Static assets
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
└── docs/                        # Additional documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** (20.10+)
- **Docker Compose** (2.0+)
- **Node.js** (18+) for local development
- **PostgreSQL** (13+) for local database

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/conexhub.git
cd conexhub

# 2. Setup environment
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
cd ..

# 3. Start with Docker
docker-compose up --build -d

# 4. Verify services
curl http://localhost:3001/health  # Backend
curl http://localhost:3000         # Frontend

# 5. Seed database
curl -X POST http://localhost:3001/api/seed
```

### Manual Development

```bash
# Backend
cd backend
npm install
npm run dev                        # Starts on port 3001

# Frontend (new terminal)
cd frontend
npm install
npm start                          # Starts on port 3000
```

---

## 🔧 Environment Setup

### Backend Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/conexhub
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=conexhub
DB_PORT=5432

# JWT Configuration (CRITICAL - Use secure values in production)
JWT_SECRET=your-super-secure-64-character-secret-key-here
JWT_REFRESH_SECRET=different-64-character-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=3001
API_PREFIX=/api

# Security Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true

# Performance & Monitoring
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Optional Integrations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
PIX_CLIENT_ID=your-pix-client-id
PIX_CLIENT_SECRET=your-pix-secret
```

### Frontend Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_NODE_ENV=development

# Development Configuration
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true
FAST_REFRESH=true
CHOKIDAR_USEPOLLING=true
```

---

## 🔒 Security Implementation

### Authentication & Authorization

#### JWT Token Strategy

**Dual Token System:**
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

```javascript
// Token generation
const generateTokens = (user) => ({
  accessToken: jwt.sign(
    { userId: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  ),
  refreshToken: jwt.sign(
    { userId: user.id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  )
});
```

#### Role-Based Access Control

**User Roles:**
- `admin`: Full system access
- `supplier`: Product management, quote responses
- `buyer`: Product browsing, quote requests

**Route Protection:**
```javascript
// Middleware examples
router.use('/admin/*', authMiddleware, adminMiddleware);
router.use('/products', authMiddleware, supplierMiddleware);
router.get('/quotes/buyer', authMiddleware); // Any authenticated user
```

### Input Validation & Sanitization

**Validation Strategy:**
```javascript
// Using express-validator
const productValidation = {
  create: [
    body('name').isLength({ min: 2, max: 255 }).trim().escape(),
    body('price').isFloat({ min: 0.01 }).toFloat(),
    body('category').isIn(['Machinery', 'Tools', 'Raw Materials']),
    body('email').isEmail().normalizeEmail(),
    handleValidationErrors
  ]
};
```

**Brazilian-specific Validation:**
```javascript
// CPF/CNPJ validation
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  // CPF algorithm implementation
};

const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return false;
  // CNPJ algorithm implementation
};
```

### Security Headers & CORS

```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: process.env.NODE_ENV === 'production'
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Security Checklist

**Pre-Production Security Audit:**

- [ ] **Secrets Management**
  - [ ] No hardcoded secrets in code
  - [ ] JWT secrets > 64 characters
  - [ ] Environment variables validated on startup
  - [ ] Database credentials secure

- [ ] **Input Validation**
  - [ ] All inputs validated and sanitized
  - [ ] SQL injection protection (Sequelize ORM)
  - [ ] XSS protection (helmet + validation)
  - [ ] CSRF protection implemented

- [ ] **Authentication**
  - [ ] Strong password policies
  - [ ] JWT token expiration configured
  - [ ] Refresh token rotation
  - [ ] Failed login attempt limiting

- [ ] **Infrastructure**
  - [ ] HTTPS enforced in production
  - [ ] Security headers configured
  - [ ] CORS properly restricted
  - [ ] Rate limiting enabled

---

## 📖 API Documentation

### API Overview

**Base URL:** `http://localhost:3001/api`
**Authentication:** Bearer JWT tokens
**Response Format:** JSON with standard structure

```json
{
  "success": true|false,
  "message": "Descriptive message",
  "data": { /* response data */ },
  "errors": [ /* validation errors */ ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Authentication Endpoints

#### POST `/auth/register`
Register new user account.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "SecurePass123!",
  "role": "buyer",
  "companyName": "Empresa LTDA",
  "cnpj": "12.345.678/0001-90"
}
```

#### POST `/auth/login`
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "joao@empresa.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "buyer"
    }
  }
}
```

### Product Management

#### GET `/products`
List products with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `search` (string): Search in name and description
- `featured` (boolean): Show only featured products
- `minPrice`, `maxPrice` (number): Price range filter

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Industrial Pump",
        "description": "High-capacity centrifugal pump",
        "price": 1500.00,
        "category": "Machinery",
        "image": "📦",
        "supplier": {
          "id": "uuid",
          "companyName": "TechSupply Ltd"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### POST `/products` 🔒 Supplier/Admin
Create new product.

**Request:**
```json
{
  "name": "Industrial Motor",
  "description": "3-phase electric motor, 10HP",
  "price": 2500.00,
  "category": "Machinery",
  "stock": 15,
  "minOrder": 1,
  "specifications": {
    "power": "10HP",
    "voltage": "380V",
    "phases": 3
  }
}
```

### B2B Quotations

#### POST `/quotes/request` 🔒 Authenticated
Request quotation for product.

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 10,
  "message": "Need for urgent project. Delivery to São Paulo."
}
```

#### GET `/quotes/buyer` 🔒 Authenticated
Get buyer's quotations.

#### PUT `/quotes/:id/respond` 🔒 Supplier
Respond to quotation request.

**Request:**
```json
{
  "unitPrice": 1450.00,
  "totalAmount": 14500.00,
  "validUntil": "2024-01-30T23:59:59Z",
  "deliveryTime": "10-15 business days",
  "terms": "Payment: 50% advance, 50% on delivery",
  "supplierNotes": "Bulk discount applied"
}
```

### Payment Integration

#### POST `/pix/quotes/:id/payment` 🔒 Authenticated
Create PIX payment for accepted quote.

**Request:**
```json
{
  "pixKey": "pagamentos@conexhub.com.br",
  "pixKeyType": "email",
  "receiverName": "ConexHub Pagamentos",
  "receiverDocument": "12345678000100"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "qrCode": "00020126580014BR.GOV.BCB.PIX...",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "amount": 14500.00,
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

---

## ⚡ Performance & Optimization

### Frontend Performance

#### React Query Implementation

**Caching Strategy:**
```javascript
// Product queries with different cache times
export const useProductsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiService.getProducts(filters),
    staleTime: 2 * 60 * 1000,      // 2 minutes
    cacheTime: 10 * 60 * 1000,     // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Individual product with longer cache
export const useProductQuery = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProduct(id),
    staleTime: 5 * 60 * 1000,      // 5 minutes
    enabled: !!id
  });
};
```

#### Code Splitting & Lazy Loading

```javascript
// Route-level code splitting
const AdminPanel = React.lazy(() => import('../admin/AdminPanel'));
const About = React.lazy(() => import('../pages/About'));

// Component-level lazy loading
const ProductGrid = React.lazy(() => 
  import('../products/ProductGrid')
);
```

#### Performance Optimization Techniques

**Bundle Optimization:**
- Tree shaking for unused code elimination
- Dynamic imports for route-based splitting
- Image optimization with lazy loading
- TailwindCSS purging for minimal CSS

**React Optimizations:**
- `React.memo` for expensive components
- `useMemo` and `useCallback` for expensive calculations
- Virtual scrolling for large product lists
- Debounced search inputs

### Backend Optimization

#### Database Query Optimization

```javascript
// Efficient product queries with includes
const getProducts = async (filters) => {
  return await Product.findAndCountAll({
    where: buildWhereClause(filters),
    include: [
      {
        model: Supplier,
        attributes: ['id', 'companyName', 'verified'],
        required: false
      },
      {
        model: Category,
        attributes: ['id', 'name', 'slug']
      }
    ],
    order: [['featured', 'DESC'], ['createdAt', 'DESC']],
    limit: filters.limit || 20,
    offset: (filters.page - 1) * (filters.limit || 20)
  });
};
```

#### Caching Strategy

**Redis Integration:**
```javascript
// Cache product categories (rarely change)
const getCategories = async () => {
  const cacheKey = 'categories:all';
  let categories = await redis.get(cacheKey);
  
  if (!categories) {
    categories = await Category.findAll();
    await redis.setex(cacheKey, 3600, JSON.stringify(categories)); // 1 hour
  }
  
  return JSON.parse(categories);
};
```

---

## 🌐 Deployment Guide

### Production Architecture

**Recommended Stack:**
- **Frontend**: Vercel (React.js hosting)
- **Backend**: Render.com (Node.js hosting)
- **Database**: Render PostgreSQL or AWS RDS
- **CDN**: Cloudflare (optional)
- **Monitoring**: Sentry, DataDog

### Environment Configuration

#### Production Environment Variables

**Backend (.env.production):**
```env
# Production Database
DATABASE_URL=postgresql://user:password@host:5432/conexhub_prod

# Security (Generate new secrets!)
JWT_SECRET=production-secret-64-characters-minimum
JWT_REFRESH_SECRET=different-production-refresh-secret
NODE_ENV=production

# URLs
FRONTEND_URL=https://conexhub.vercel.app
ALLOWED_ORIGINS=https://conexhub.vercel.app

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://conexhub-api.render.com/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### Deployment Steps

#### 1. Database Setup
```bash
# Create production database
# Set up SSL connection
# Run migrations
npm run db:migrate:prod
```

#### 2. Backend Deployment (Render)
```yaml
# render.yaml
services:
  - type: web
    name: conexhub-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

#### 3. Frontend Deployment (Vercel)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Monitoring & Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

---

## 🧪 Development & Testing

### Development Workflow

#### Local Development Setup

```bash
# Full stack development
npm run dev:all               # Starts both frontend and backend

# Individual services
npm run dev:backend          # Backend only (port 3001)
npm run dev:frontend         # Frontend only (port 3000)

# Database operations
npm run db:migrate           # Run pending migrations
npm run db:seed             # Seed development data
npm run db:reset            # Reset and reseed database
```

#### Code Quality Tools

```bash
# Linting and formatting
npm run lint                # ESLint check
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Prettier formatting

# Type checking (if using TypeScript)
npm run type-check         # Check types

# Security auditing
npm audit                  # Check for vulnerabilities
npm run security-check     # Custom security validation
```

### Testing Strategy

#### Backend Testing

```javascript
// Example test structure
describe('Product API', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it('should create product with valid data', async () => {
    const productData = {
      name: 'Test Product',
      price: 100.00,
      category: 'Tools'
    };

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(productData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.product.name).toBe(productData.name);
  });
});
```

#### Frontend Testing

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

test('renders product information correctly', () => {
  const product = {
    name: 'Industrial Pump',
    price: 1500.00,
    supplier: { companyName: 'TechSupply' }
  };

  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Industrial Pump')).toBeInTheDocument();
  expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
  expect(screen.getByText('TechSupply')).toBeInTheDocument();
});
```

### Common Issues & Solutions

#### Database Schema Mismatch
**Issue**: Products route queries `active` field but model has `isActive`
**Solution**: Update route to use correct field name:

```javascript
// Fix in backend/src/routes/products.js
let whereClause = { isActive: true }; // Changed from 'active'
```

#### CORS Issues
**Issue**: Frontend can't connect to backend API
**Solution**: Verify CORS configuration:

```javascript
// Check allowed origins
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
};
```

---

## 🔧 Troubleshooting

### Common Development Issues

#### Docker Issues

**Container Won't Start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild without cache
docker-compose build --no-cache
docker-compose up --build
```

**Database Connection Issues:**
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

#### API Issues

**JWT Token Problems:**
```bash
# Verify token is being sent
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/profile

# Check token expiration
# Tokens expire after 15 minutes by default
```

**Validation Errors:**
```javascript
// Check request format matches validation rules
// Example: CNPJ must be in format "12.345.678/0001-90"
```

### Production Issues

#### Performance Problems

**Slow API Responses:**
- Check database query performance
- Monitor Redis cache hit rates
- Review API endpoint complexity

**High Memory Usage:**
- Monitor Node.js heap usage
- Check for memory leaks in React components
- Review file upload handling

#### Security Incidents

**Suspected Breach:**
1. Immediately rotate all JWT secrets
2. Force logout all users
3. Review access logs
4. Check for unauthorized data access
5. Update security measures

---

## 📞 Support & Maintenance

### Maintenance Tasks

#### Daily Operations
- Monitor application health endpoints
- Review error logs for critical issues
- Check API response times
- Verify backup completion

#### Weekly Tasks
- Review security logs
- Update dependencies (after testing)
- Performance monitoring review
- Database maintenance

#### Monthly Tasks
- Security audit
- Dependency vulnerability scan
- Performance optimization review
- Backup restoration testing

### Emergency Procedures

#### Service Outage
1. Check health endpoints
2. Review recent deployments
3. Check external service status
4. Implement rollback if needed

#### Data Recovery
1. Identify scope of data loss
2. Locate most recent backup
3. Test restoration in staging
4. Execute restoration with minimal downtime

---

## 📈 Performance Metrics

### Key Performance Indicators

**Frontend Metrics:**
- Time to First Byte (TTFB) < 200ms
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1

**Backend Metrics:**
- API response time < 100ms (95th percentile)
- Database query time < 50ms (average)
- Error rate < 0.1%
- Uptime > 99.9%

**Business Metrics:**
- User registration conversion rate
- Quote request completion rate
- Payment success rate
- User session duration

---

*Last updated: June 2025*
*For additional support: docs@conexhub.com.br*