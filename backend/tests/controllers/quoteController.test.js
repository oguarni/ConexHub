import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { sequelize, User, Product, Supplier, Category, Quote, Order, OrderItem } from '../../src/models/index.js';

describe('Quote Controller', () => {
  let buyerToken;
  let supplierToken;
  let adminToken;
  let buyerUser;
  let supplierUser;
  let adminUser;
  let testSupplier;
  let testCategory;
  let testProduct;
  let testQuote;

  beforeAll(async () => {
    jest.setTimeout(30000);
    
    // Sync database
    await sequelize.sync({ force: true });

    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category description'
    });

    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: 'admin',
      isActive: true
    });

    supplierUser = await User.create({
      name: 'Supplier User',
      email: 'supplier@test.com',
      password: 'hashedpassword',
      role: 'supplier',
      companyName: 'Test Supplier Company',
      cnpj: '12.345.678/0001-90',
      isActive: true
    });

    buyerUser = await User.create({
      name: 'Buyer User',
      email: 'buyer@test.com',
      password: 'hashedpassword',
      role: 'buyer',
      companyName: 'Test Buyer Company',
      cnpj: '98.765.432/0001-10',
      isActive: true
    });

    // Create test supplier
    testSupplier = await Supplier.create({
      userId: supplierUser.id,
      companyName: 'Test Supplier Company',
      cnpj: '12.345.678/0001-90',
      verified: true
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product description',
      price: 99.99,
      stock: 100,
      category: 'Test Category',
      categoryId: testCategory.id,
      supplierId: testSupplier.id,
      unit: 'piece',
      minOrder: 1,
      isActive: true,
      featured: false
    });

    // Create test quote
    testQuote = await Quote.create({
      quoteNumber: 'QUO-TEST-001',
      buyerId: buyerUser.id,
      supplierId: supplierUser.id,
      productId: testProduct.id,
      quantity: 10,
      notes: 'Test quote notes',
      status: 'pending'
    });

    // Generate auth tokens
    buyerToken = jwt.sign(
      { 
        id: buyerUser.id, 
        email: buyerUser.email, 
        role: buyerUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    supplierToken = jwt.sign(
      { 
        id: supplierUser.id, 
        email: supplierUser.email, 
        role: supplierUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/quotes/request', () => {
    const validQuoteRequest = {
      productId: null, // Will be set in test
      quantity: 5,
      notes: 'Need urgent delivery'
    };

    beforeEach(() => {
      validQuoteRequest.productId = testProduct.id;
    });

    it('should request a quote successfully', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validQuoteRequest)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.quoteNumber).toMatch(/^QUO-\d+-[A-Z0-9]+$/);
      expect(response.body.buyerId).toBe(buyerUser.id);
      expect(response.body.supplierId).toBe(supplierUser.id);
      expect(response.body.productId).toBe(testProduct.id);
      expect(response.body.quantity).toBe(5);
      expect(response.body.notes).toBe('Need urgent delivery');
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('Buyer');
      expect(response.body).toHaveProperty('Supplier');
      expect(response.body).toHaveProperty('Product');
    });

    it('should request a quote with minimal data', async () => {
      const minimalRequest = {
        productId: testProduct.id,
        quantity: 1
      };

      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(minimalRequest)
        .expect(201);

      expect(response.body.quantity).toBe(1);
      expect(response.body.notes).toBe('');
    });

    it('should reject request with missing productId', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ quantity: 5 })
        .expect(400);

      expect(response.body.error).toBe('Product ID and quantity are required');
    });

    it('should reject request with missing quantity', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: testProduct.id })
        .expect(400);

      expect(response.body.error).toBe('Product ID and quantity are required');
    });

    it('should reject request for non-existent product', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: 99999, quantity: 5 })
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .send(validQuoteRequest)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject requests from suppliers', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(validQuoteRequest)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should handle product without supplier', async () => {
      // Create product without supplier
      const orphanProduct = await Product.create({
        name: 'Orphan Product',
        description: 'Product without supplier',
        price: 50.00,
        stock: 10,
        category: 'Test Category',
        categoryId: testCategory.id,
        supplierId: null,
        unit: 'piece',
        isActive: true
      });

      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: orphanProduct.id, quantity: 1 })
        .expect(400);

      expect(response.body.error).toBe('Product has no supplier');
    });
  });

  describe('GET /api/quotes/supplier', () => {
    it('should return supplier quotes successfully', async () => {
      const response = await request(app)
        .get('/api/quotes/supplier')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.quotes)).toBe(true);
      expect(response.body.quotes.length).toBeGreaterThan(0);
      expect(response.body.quotes[0]).toHaveProperty('Buyer');
      expect(response.body.quotes[0]).toHaveProperty('Product');
    });

    it('should filter quotes by status', async () => {
      // Create a quote with different status
      await Quote.create({
        quoteNumber: 'QUO-TEST-PENDING',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 5,
        status: 'pending'
      });

      await Quote.create({
        quoteNumber: 'QUO-TEST-QUOTED',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 3,
        status: 'quoted',
        unitPrice: 95.00
      });

      const response = await request(app)
        .get('/api/quotes/supplier')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      response.body.quotes.forEach(quote => {
        expect(quote.status).toBe('pending');
      });
    });

    it('should paginate quotes correctly', async () => {
      const response = await request(app)
        .get('/api/quotes/supplier')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(response.body.quotes).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should require supplier authentication', async () => {
      const response = await request(app)
        .get('/api/quotes/supplier')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/quotes/supplier')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should return only quotes for the authenticated supplier', async () => {
      const response = await request(app)
        .get('/api/quotes/supplier')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      response.body.quotes.forEach(quote => {
        expect(quote.supplierId).toBe(supplierUser.id);
      });
    });
  });

  describe('PUT /api/quotes/:id/submit', () => {
    let pendingQuote;

    beforeEach(async () => {
      pendingQuote = await Quote.create({
        quoteNumber: 'QUO-SUBMIT-TEST',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 8,
        notes: 'Quote for submission test',
        status: 'pending'
      });
    });

    const validSubmission = {
      unitPrice: 85.50,
      deliveryTime: '7-10 business days',
      terms: 'Payment on delivery',
      supplierNotes: 'Best quality guaranteed',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    it('should submit quote successfully', async () => {
      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(validSubmission)
        .expect(200);

      expect(response.body.status).toBe('quoted');
      expect(response.body.unitPrice).toBe(85.50);
      expect(response.body.totalAmount).toBe(684); // 85.50 * 8
      expect(response.body.deliveryTime).toBe('7-10 business days');
      expect(response.body.terms).toBe('Payment on delivery');
      expect(response.body.supplierNotes).toBe('Best quality guaranteed');
      expect(response.body).toHaveProperty('validUntil');
    });

    it('should submit quote with minimal data and auto-calculate validUntil', async () => {
      const minimalSubmission = {
        unitPrice: 90.00,
        deliveryTime: '5 days'
      };

      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(minimalSubmission)
        .expect(200);

      expect(response.body.unitPrice).toBe(90.00);
      expect(response.body.totalAmount).toBe(720); // 90.00 * 8
      expect(response.body.deliveryTime).toBe('5 days');
      expect(response.body).toHaveProperty('validUntil');
    });

    it('should reject submission for non-existent quote', async () => {
      const response = await request(app)
        .put('/api/quotes/99999/submit')
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(validSubmission)
        .expect(404);

      expect(response.body.error).toBe('Quote not found');
    });

    it('should reject submission from unauthorized supplier', async () => {
      // Create another supplier
      const anotherSupplierUser = await User.create({
        name: 'Another Supplier',
        email: 'another.supplier@test.com',
        password: 'hashedpassword',
        role: 'supplier',
        companyName: 'Another Supplier Company',
        cnpj: '11.222.333/0001-44'
      });

      const unauthorizedToken = jwt.sign(
        { 
          id: anotherSupplierUser.id, 
          email: anotherSupplierUser.email, 
          role: 'supplier'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send(validSubmission)
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only respond to your own quotes');
    });

    it('should reject submission for already responded quote', async () => {
      // First submission
      await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(validSubmission)
        .expect(200);

      // Second submission should fail
      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send(validSubmission)
        .expect(400);

      expect(response.body.error).toBe('Quote has already been responded to');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .send(validSubmission)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject submissions from buyers', async () => {
      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validSubmission)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });
  });

  describe('GET /api/quotes/buyer', () => {
    it('should return buyer quotes successfully', async () => {
      const response = await request(app)
        .get('/api/quotes/buyer')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.quotes)).toBe(true);
      expect(response.body.quotes.length).toBeGreaterThan(0);
      expect(response.body.quotes[0]).toHaveProperty('Supplier');
      expect(response.body.quotes[0]).toHaveProperty('Product');
    });

    it('should filter quotes by status', async () => {
      const response = await request(app)
        .get('/api/quotes/buyer')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      response.body.quotes.forEach(quote => {
        expect(quote.status).toBe('pending');
      });
    });

    it('should require buyer authentication', async () => {
      const response = await request(app)
        .get('/api/quotes/buyer')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should return only quotes for the authenticated buyer', async () => {
      const response = await request(app)
        .get('/api/quotes/buyer')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      response.body.quotes.forEach(quote => {
        expect(quote.buyerId).toBe(buyerUser.id);
      });
    });
  });

  describe('POST /api/quotes/:id/accept', () => {
    let quotedQuote;

    beforeEach(async () => {
      quotedQuote = await Quote.create({
        quoteNumber: 'QUO-ACCEPT-TEST',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 5,
        unitPrice: 95.00,
        totalAmount: 475.00,
        deliveryTime: '3-5 days',
        status: 'quoted',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should accept quote and create order successfully', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/accept`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.message).toBe('Quote accepted successfully and order created');
      expect(response.body).toHaveProperty('quote');
      expect(response.body).toHaveProperty('order');
      expect(response.body.quote.status).toBe('accepted');
      expect(response.body.order).toHaveProperty('orderNumber');
      expect(response.body.order.status).toBe('confirmed');
      expect(response.body.order.totalAmount).toBe(475.00);

      // Verify order was created
      const order = await Order.findOne({ where: { id: response.body.order.id } });
      expect(order).toBeTruthy();
      expect(order.totalAmount).toBe(475.00);

      // Verify order item was created
      const orderItem = await OrderItem.findOne({ where: { orderId: order.id } });
      expect(orderItem).toBeTruthy();
      expect(orderItem.quantity).toBe(5);
      expect(orderItem.price).toBe(95.00);

      // Verify quote is linked to order
      const updatedQuote = await Quote.findByPk(quotedQuote.id);
      expect(updatedQuote.orderId).toBe(order.id);
    });

    it('should reject acceptance for non-existent quote', async () => {
      const response = await request(app)
        .post('/api/quotes/99999/accept')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Quote not found');
    });

    it('should reject acceptance from unauthorized buyer', async () => {
      const anotherBuyerUser = await User.create({
        name: 'Another Buyer',
        email: 'another.buyer@test.com',
        password: 'hashedpassword',
        role: 'buyer',
        companyName: 'Another Buyer Company',
        cnpj: '22.333.444/0001-55'
      });

      const unauthorizedToken = jwt.sign(
        { 
          id: anotherBuyerUser.id, 
          email: anotherBuyerUser.email, 
          role: 'buyer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/accept`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only accept your own quotes');
    });

    it('should reject acceptance for quote not in quoted status', async () => {
      const pendingQuote = await Quote.create({
        quoteNumber: 'QUO-PENDING-TEST',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 3,
        status: 'pending'
      });

      const response = await request(app)
        .post(`/api/quotes/${pendingQuote.id}/accept`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);

      expect(response.body.error).toBe('Quote cannot be accepted in current status');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/accept`)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject acceptance from suppliers', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/accept`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });
  });

  describe('POST /api/quotes/:id/reject', () => {
    let quotedQuote;

    beforeEach(async () => {
      quotedQuote = await Quote.create({
        quoteNumber: 'QUO-REJECT-TEST',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 4,
        unitPrice: 105.00,
        totalAmount: 420.00,
        status: 'quoted',
        notes: 'Original notes'
      });
    });

    it('should reject quote successfully with reason', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/reject`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Price too high' })
        .expect(200);

      expect(response.body.message).toBe('Quote rejected successfully');
      expect(response.body.quote.status).toBe('rejected');
      expect(response.body.quote.notes).toContain('Rejection reason: Price too high');
    });

    it('should reject quote successfully without reason', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/reject`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({})
        .expect(200);

      expect(response.body.message).toBe('Quote rejected successfully');
      expect(response.body.quote.status).toBe('rejected');
      expect(response.body.quote.notes).toBe('Original notes');
    });

    it('should reject rejection for non-existent quote', async () => {
      const response = await request(app)
        .post('/api/quotes/99999/reject')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Quote not found');
    });

    it('should reject rejection from unauthorized buyer', async () => {
      const anotherBuyerUser = await User.create({
        name: 'Another Buyer 2',
        email: 'another.buyer2@test.com',
        password: 'hashedpassword',
        role: 'buyer'
      });

      const unauthorizedToken = jwt.sign(
        { 
          id: anotherBuyerUser.id, 
          email: anotherBuyerUser.email, 
          role: 'buyer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/reject`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);

      expect(response.body.error).toBe('Unauthorized: You can only reject your own quotes');
    });

    it('should reject rejection for quote not in quoted status', async () => {
      const pendingQuote = await Quote.create({
        quoteNumber: 'QUO-PENDING-REJECT',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 2,
        status: 'pending'
      });

      const response = await request(app)
        .post(`/api/quotes/${pendingQuote.id}/reject`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);

      expect(response.body.error).toBe('Quote cannot be rejected in current status');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/quotes/${quotedQuote.id}/reject`)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle invalid quote IDs gracefully', async () => {
      const response = await request(app)
        .put('/api/quotes/invalid-id/submit')
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ unitPrice: 100 })
        .expect(500);

      expect(response.body.error).toBe('Error submitting quote');
    });

    it('should handle concurrent quote submissions', async () => {
      const pendingQuote = await Quote.create({
        quoteNumber: 'QUO-CONCURRENT-TEST',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 1,
        status: 'pending'
      });

      const submissionData = {
        unitPrice: 50.00,
        deliveryTime: '2 days'
      };

      // Make multiple concurrent requests
      const promises = Array(3).fill().map(() =>
        request(app)
          .put(`/api/quotes/${pendingQuote.id}/submit`)
          .set('Authorization', `Bearer ${supplierToken}`)
          .send(submissionData)
      );

      const responses = await Promise.all(promises);
      
      // Only one should succeed
      const successResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status === 400);
      
      expect(successResponses.length).toBe(1);
      expect(errorResponses.length).toBe(2);
      expect(errorResponses[0].body.error).toBe('Quote has already been responded to');
    });

    it('should handle very large quantities', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: testProduct.id,
          quantity: 1000000,
          notes: 'Large order'
        })
        .expect(201);

      expect(response.body.quantity).toBe(1000000);
    });

    it('should handle negative quantities', async () => {
      const response = await request(app)
        .post('/api/quotes/request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: testProduct.id,
          quantity: -5
        })
        .expect(201);

      // Should store the negative quantity as is
      expect(response.body.quantity).toBe(-5);
    });

    it('should handle zero unit price in submission', async () => {
      const pendingQuote = await Quote.create({
        quoteNumber: 'QUO-ZERO-PRICE',
        buyerId: buyerUser.id,
        supplierId: supplierUser.id,
        productId: testProduct.id,
        quantity: 5,
        status: 'pending'
      });

      const response = await request(app)
        .put(`/api/quotes/${pendingQuote.id}/submit`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({
          unitPrice: 0,
          deliveryTime: '1 day'
        })
        .expect(200);

      expect(response.body.unitPrice).toBe(0);
      expect(response.body.totalAmount).toBe(0);
    });
  });
});