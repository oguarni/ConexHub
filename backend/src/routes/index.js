const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, isAdmin, isSupplier, isSupplierOrAdmin } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const quoteController = require('../controllers/quoteController');
const supplierController = require('../controllers/supplierController');
const categoryController = require('../controllers/categoryController');
const reviewController = require('../controllers/reviewController');
const analyticsController = require('../controllers/analyticsController');
const adminController = require('../controllers/adminController');
const seedController = require('../controllers/seedController');

// PIX routes
const pixRoutes = require('./pix');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth routes
router.post('/auth/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('cpf').optional().trim(),
  body('role').optional().isIn(['buyer', 'supplier'])
], authController.register);

router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login.bind(authController));

router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.post('/auth/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], authController.changePassword);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', authenticate, [
  body('name').notEmpty().trim(),
  body('category').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('unit').notEmpty(),
  body('minOrder').isInt({ min: 1 })
], (req, res, next) => {
  // Permitir admin ou supplier criar produtos
  if (req.user.role === 'admin' || req.user.role === 'supplier') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied' });
}, productController.createProduct);
router.put('/products/:id', authenticate, (req, res, next) => {
  // Permitir admin ou supplier atualizar produtos
  if (req.user.role === 'admin' || req.user.role === 'supplier') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied' });
}, productController.updateProduct);
router.delete('/products/:id', authenticate, (req, res, next) => {
  // Permitir admin ou supplier deletar produtos
  if (req.user.role === 'admin' || req.user.role === 'supplier') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied' });
}, productController.deleteProduct);

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', authenticate, isAdmin, [
  body('name').notEmpty().trim(),
  body('slug').notEmpty().trim()
], categoryController.createCategory);
router.put('/categories/:id', authenticate, isAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticate, isAdmin, categoryController.deleteCategory);

// Supplier routes
router.get('/suppliers', supplierController.getSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierProfile);
router.get('/suppliers/:id/products', supplierController.getSupplierProducts);
router.get('/suppliers/:id/reviews', supplierController.getSupplierReviews);
router.put('/suppliers/profile', authenticate, isSupplier, supplierController.updateSupplierProfile);
router.post('/suppliers/subscription', authenticate, isSupplier, [
  body('plan').isIn(['basic', 'pro'])
], supplierController.updateSubscription);

// Quote routes (B2B specific)
router.post('/quotes/request', authenticate, [
  body('productId').notEmpty(),
  body('quantity').isInt({ min: 1 })
], quoteController.requestQuote);
router.get('/quotes/supplier', authenticate, quoteController.getSupplierQuotes);
router.get('/quotes/buyer', authenticate, quoteController.getBuyerQuotes);
router.put('/quotes/:quoteId/respond', authenticate, [
  body('unitPrice').isFloat({ min: 0 })
], quoteController.submitQuote);
router.post('/quotes/:quoteId/accept', authenticate, quoteController.acceptQuote);
router.post('/quotes/:quoteId/reject', authenticate, quoteController.rejectQuote);

// Order routes
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getUserOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id/status', authenticate, isSupplierOrAdmin, [
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], orderController.updateOrderStatus);
router.get('/orders/:id/invoice', authenticate, orderController.generateInvoice);

// Review routes
router.post('/reviews', authenticate, [
  body('orderId').notEmpty(),
  body('supplierId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 })
], reviewController.createReview);
router.get('/reviews/product/:productId', reviewController.getProductReviews);
router.put('/reviews/:id', authenticate, reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

// Dashboard stats (public endpoint for basic stats)
router.get('/dashboard/stats', analyticsController.getBasicStats);

// Analytics routes (for suppliers and admin)
router.get('/analytics/dashboard', authenticate, isSupplierOrAdmin, analyticsController.getDashboard);
router.get('/analytics/sales', authenticate, isSupplierOrAdmin, analyticsController.getSalesAnalytics);
router.get('/analytics/products', authenticate, isSupplierOrAdmin, analyticsController.getProductAnalytics);
router.get('/analytics/customers', authenticate, isSupplierOrAdmin, analyticsController.getCustomerAnalytics);

// Admin routes
router.get('/admin/users', authenticate, isAdmin, adminController.getUsers);
router.put('/admin/users/:id', authenticate, isAdmin, adminController.updateUser);
router.post('/admin/suppliers/verify/:id', authenticate, isAdmin, adminController.verifySupplier);
router.get('/admin/reports', authenticate, isAdmin, adminController.getReports);

// PIX payment routes
router.use('/pix', pixRoutes);

// Seed route for development (simple version)
router.post('/seed', async (req, res) => {
  try {
    const { sequelize, Category, Supplier, Product, User } = require('../models');
    
    console.log('🌱 Iniciando seed do banco de dados...');

    // Primeiro, inserir usuários de teste usando Sequelize
    const usersData = [
      { name: 'Administrador', email: 'admin@b2bmarketplace.com', password: '123456', role: 'admin', isActive: true, cpf: '00000000000' },
      { name: 'João Silva', email: 'joao@empresa.com', password: '123456', role: 'buyer', isActive: true, cpf: '11111111111' },
      { name: 'TechSupply Representante', email: 'contato@techsupply.com.br', password: '123456', role: 'supplier', isActive: true, cpf: '22222222222' },
      { name: 'Industrial Rep', email: 'vendas@industrialsolutions.com.br', password: '123456', role: 'supplier', isActive: true, cpf: '33333333333' },
      { name: 'Construfer Rep', email: 'comercial@construfer.com.br', password: '123456', role: 'supplier', isActive: true, cpf: '44444444444' }
    ];

    const createdUsers = [];
    for (const userData of usersData) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      createdUsers.push(user);
    }

    // Inserir categorias usando Sequelize para gerar UUIDs automaticamente
    const categoriesData = [
      { name: 'Equipamentos Industriais', slug: 'equipamentos-industriais', description: 'Máquinas e equipamentos para indústria' },
      { name: 'Ferramentas', slug: 'ferramentas', description: 'Ferramentas manuais e elétricas' },
      { name: 'Materiais de Construção', slug: 'materiais-construcao', description: 'Materiais para construção civil' },
      { name: 'Componentes Eletrônicos', slug: 'componentes-eletronicos', description: 'Componentes e equipamentos eletrônicos' }
    ];

    for (const categoryData of categoriesData) {
      await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });
    }

    // Inserir fornecedores usando Sequelize com userId válido
    const suppliersData = [
      { 
        userId: createdUsers[2].id, // TechSupply user
        companyName: 'TechSupply Ltda', 
        cnpj: '12345678000100',
        description: 'Fornecedor especializado em equipamentos tecnológicos', 
        verified: true 
      },
      { 
        userId: createdUsers[3].id, // Industrial user
        companyName: 'Industrial Solutions', 
        cnpj: '98765432000100',
        description: 'Soluções completas para indústria', 
        verified: true 
      },
      { 
        userId: createdUsers[4].id, // Construfer user
        companyName: 'Construfer Materiais', 
        cnpj: '11223344000100',
        description: 'Materiais de construção de alta qualidade', 
        verified: true 
      }
    ];

    for (const supplierData of suppliersData) {
      await Supplier.findOrCreate({
        where: { companyName: supplierData.companyName },
        defaults: supplierData
      });
    }

    // Buscar categorias e fornecedores criados
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const suppliers = await Supplier.findAll({ order: [['companyName', 'ASC']] });

    if (categories.length >= 4 && suppliers.length >= 3) {
      // Inserir produtos usando Sequelize
      const productsData = [
        { name: 'Furadeira Industrial 1200W', description: 'Furadeira industrial de alta potência com velocidade variável', price: 450.00, stock: 15, isActive: true, featured: false, supplierId: suppliers[0].id, categoryId: categories[1].id, category: 'Ferramentas', unit: 'unidade' },
        { name: 'Compressor de Ar 50L', description: 'Compressor de ar comprimido 2HP com tanque de 50 litros', price: 1200.00, stock: 8, isActive: true, featured: true, supplierId: suppliers[1].id, categoryId: categories[0].id, category: 'Equipamentos Industriais', unit: 'unidade' },
        { name: 'Cimento Portland 50kg', description: 'Saco de cimento Portland CP-II-E-32 de 50kg', price: 35.00, stock: 200, isActive: true, featured: false, supplierId: suppliers[2].id, categoryId: categories[2].id, category: 'Materiais de Construção', unit: 'saco' },
        { name: 'Multímetro Digital', description: 'Multímetro digital com display LCD e múltiplas funções', price: 89.90, stock: 25, isActive: true, featured: true, supplierId: suppliers[0].id, categoryId: categories[3].id, category: 'Componentes Eletrônicos', unit: 'unidade' },
        { name: 'Serra Circular 7.1/4"', description: 'Serra circular elétrica 1400W com disco de 7.1/4 polegadas', price: 320.00, stock: 12, isActive: true, featured: false, supplierId: suppliers[1].id, categoryId: categories[1].id, category: 'Ferramentas', unit: 'unidade' }
      ];

      for (const productData of productsData) {
        await Product.findOrCreate({
          where: { name: productData.name },
          defaults: productData
        });
      }
    }

    // Contar registros criados
    const productCount = await Product.count();
    const userCount = await User.count();
    const supplierCount = await Supplier.count();
    const categoryCount = await Category.count();

    console.log('✅ Seed concluído com sucesso!');
    
    res.json({
      success: true,
      message: 'Dados de exemplo criados com sucesso!',
      data: {
        products: productCount,
        users: userCount,
        suppliers: supplierCount,
        categories: categoryCount
      },
      credentials: {
        admin: { email: 'admin@b2bmarketplace.com', password: '123456' },
        user: { email: 'joao@empresa.com', password: '123456' }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar dados de exemplo',
      error: error.message
    });
  }
});

module.exports = router;