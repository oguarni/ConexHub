import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { sequelize, User, Product, Supplier, Category, Order, OrderItem } from '../../src/models/index.js';
import config from '../../src/config/index.js';

describe('Order Controller', () => {
  let buyerToken;
  let supplierToken;
  let adminToken;
  let buyerUser;
  let supplierUser;
  let adminUser;
  let testSupplier;
  let testCategory;
  let testProduct;
  let testOrder;

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
      address: 'Admin Address, 123',
      isActive: true
    });

    supplierUser = await User.create({
      name: 'Supplier User',
      email: 'supplier@test.com',
      password: 'hashedpassword',
      role: 'supplier',
      companyName: 'Test Supplier Company',
      cnpj: '12.345.678/0001-90',
      address: 'Supplier Address, 456',
      isActive: true
    });

    buyerUser = await User.create({
      name: 'Buyer User',
      email: 'buyer@test.com',
      password: 'hashedpassword',
      role: 'buyer',
      companyName: 'Test Buyer Company',
      cnpj: '98.765.432/0001-10',
      address: 'Buyer Address, 789',
      isActive: true
    });

    // Create test supplier
    testSupplier = await Supplier.create({
      userId: supplierUser.id,
      companyName: 'Test Supplier Company',
      cnpj: '12.345.678/0001-90',
      verified: true
    });

    // Update supplier user with supplier relationship
    await supplierUser.update({ supplierId: testSupplier.id });

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

    // Create test order
    testOrder = await Order.create({
      userId: buyerUser.id,
      orderNumber: 'TEST-ORDER-001',
      totalAmount: 199.98,
      status: 'pending',
      shippingAddress: 'Test Shipping Address',
      paymentMethod: 'invoice',
      supplierId: testSupplier.id
    });

    // Create order item
    await OrderItem.create({
      orderId: testOrder.id,
      productId: testProduct.id,
      quantity: 2,
      price: 99.99,
      subtotal: 199.98
    });

    // Generate auth tokens using proper config
    const jwtSecret = config.security?.jwt?.secret || process.env.JWT_SECRET || 'test-secret';
    
    buyerToken = jwt.sign(
      { 
        userId: buyerUser.id,
        id: buyerUser.id, 
        email: buyerUser.email, 
        role: buyerUser.role,
        address: buyerUser.address
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    supplierToken = jwt.sign(
      { 
        userId: supplierUser.id,
        id: supplierUser.id, 
        email: supplierUser.email, 
        role: supplierUser.role,
        supplierId: testSupplier.id,
        Supplier: { id: testSupplier.id }
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { 
        userId: adminUser.id,
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      items: [
        {
          productId: null, // Will be set in test
          quantity: 2
        }
      ],
      shippingAddress: 'Custom Shipping Address',
      paymentMethod: 'credit_card'
    };

    beforeEach(() => {
      validOrderData.items[0].productId = testProduct.id;
    });

    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validOrderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderNumber).toMatch(/^ORD-\d+$/);
      expect(response.body.totalAmount).toBe(199.98);
      expect(response.body.status).toBe('pending');
      expect(response.body.shippingAddress).toBe('Custom Shipping Address');
      expect(response.body.paymentMethod).toBe('credit_card');
      expect(response.body.OrderItems).toHaveLength(1);
      expect(response.body.OrderItems[0].quantity).toBe(2);
      expect(response.body.OrderItems[0].price).toBe(99.99);
    });

    it('should create an order with default shipping address', async () => {
      const orderDataWithoutAddress = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1
          }
        ],
        paymentMethod: 'invoice'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderDataWithoutAddress)
        .expect(201);

      expect(response.body.shippingAddress).toBe(buyerUser.address);
    });

    it('should create an order with default payment method', async () => {
      const orderDataWithoutPayment = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1
          }
        ],
        shippingAddress: 'Custom Address'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderDataWithoutPayment)
        .expect(201);

      expect(response.body.paymentMethod).toBe('invoice');
    });

    it('should reject order with no items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ items: [] })
        .expect(400);

      expect(response.body.error).toBe('No items in order');
    });

    it('should reject order with non-existent product', async () => {
      const invalidOrderData = {
        items: [
          {
            productId: 99999,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(invalidOrderData)
        .expect(404);

      expect(response.body.error).toBe('Product 99999 not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });

    it('should handle multiple items in order', async () => {
      // Create another product
      const secondProduct = await Product.create({
        name: 'Second Product',
        description: 'Second product description',
        price: 149.99,
        stock: 50,
        category: 'Test Category',
        categoryId: testCategory.id,
        supplierId: testSupplier.id,
        unit: 'piece',
        minOrder: 1,
        isActive: true
      });

      const multiItemOrder = {
        items: [
          {
            productId: testProduct.id,
            quantity: 2
          },
          {
            productId: secondProduct.id,
            quantity: 1
          }
        ],
        shippingAddress: 'Multi Item Address'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(multiItemOrder)
        .expect(201);

      expect(response.body.OrderItems).toHaveLength(2);
      expect(response.body.totalAmount).toBe(349.97); // (99.99 * 2) + (149.99 * 1)
    });

    it('should handle database transaction rollback on failure', async () => {
      // Create an order with mixed valid and invalid products
      const mixedOrderData = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1
          },
          {
            productId: 99999, // Non-existent product
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(mixedOrderData)
        .expect(404);

      expect(response.body.error).toBe('Product 99999 not found');

      // Verify no partial order was created
      const orders = await Order.findAll({ where: { userId: buyerUser.id } });
      const newOrdersCount = orders.length - 1; // Subtract the pre-existing test order
      expect(newOrdersCount).toBe(0);
    });
  });

  describe('GET /api/orders/user', () => {
    it('should return user orders successfully', async () => {
      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const responseData = response.body.orders || response.body;
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBeGreaterThan(0);
      expect(responseData[0]).toHaveProperty('orderNumber');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders/user')
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });

    it('should return orders in descending order by creation date', async () => {
      // Create another order
      await Order.create({
        userId: buyerUser.id,
        orderNumber: 'TEST-ORDER-002',
        totalAmount: 99.99,
        status: 'confirmed'
      });

      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const responseData = response.body.orders || response.body;
      expect(responseData.length).toBeGreaterThanOrEqual(2);
      
      // Verify orders are in descending chronological order
      for (let i = 1; i < responseData.length; i++) {
        const currentDate = new Date(responseData[i].createdAt);
        const previousDate = new Date(responseData[i - 1].createdAt);
        expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
      }
    });

    it('should only return orders belonging to the authenticated user', async () => {
      // Create order for another user
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another@test.com',
        password: 'hashedpassword',
        role: 'buyer'
      });

      await Order.create({
        userId: anotherUser.id,
        orderNumber: 'OTHER-ORDER-001',
        totalAmount: 299.99,
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      // Verify all returned orders belong to the authenticated user
      const responseData = response.body.orders || response.body;
      responseData.forEach(order => {
        expect(order.userId).toBe(buyerUser.id);
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id successfully', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrder.id);
      expect(response.body.orderNumber).toBe('TEST-ORDER-001');
      expect(response.body).toHaveProperty('OrderItems');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should not return orders belonging to other users', async () => {
      // Create order for another user
      const anotherUser = await User.create({
        name: 'Another User 2',
        email: 'another2@test.com',
        password: 'hashedpassword',
        role: 'buyer'
      });

      const otherOrder = await Order.create({
        userId: anotherUser.id,
        orderNumber: 'OTHER-ORDER-002',
        totalAmount: 199.99,
        status: 'pending'
      });

      const response = await request(app)
        .get(`/api/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status as supplier', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
      expect(response.body.id).toBe(testOrder.id);
    });

    it('should update order status as admin', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.status).toBe('processing');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .put('/api/orders/99999/status')
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({ status: 'confirmed' })
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should reject unauthorized supplier access', async () => {
      // Create another supplier
      const anotherSupplierUser = await User.create({
        name: 'Another Supplier',
        email: 'anothersupplier@test.com',
        password: 'hashedpassword',
        role: 'supplier',
        companyName: 'Another Supplier Company',
        cnpj: '11.222.333/0001-44'
      });

      const anotherSupplier = await Supplier.create({
        userId: anotherSupplierUser.id,
        companyName: 'Another Supplier Company',
        cnpj: '11.222.333/0001-44',
        verified: true
      });

      const jwtSecret = config.security?.jwt?.secret || process.env.JWT_SECRET || 'test-secret';
      const unauthorizedSupplierToken = jwt.sign(
        { 
          userId: anotherSupplierUser.id,
          id: anotherSupplierUser.id, 
          email: anotherSupplierUser.email, 
          role: 'supplier',
          supplierId: anotherSupplier.id,
          Supplier: { id: anotherSupplier.id }
        },
        jwtSecret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${unauthorizedSupplierToken}`)
        .send({ status: 'confirmed' })
        .expect(403);

      expect(response.body.message || response.body.error).toMatch(/unauthorized|access|permission/i);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .send({ status: 'confirmed' })
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });

    it('should reject buyers from updating order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'confirmed' })
        .expect(403);

      expect(response.body.message || response.body.error).toMatch(/permission|access|denied/i);
    });
  });

  describe('GET /api/orders/:id/invoice', () => {
    it('should generate invoice successfully', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}/invoice`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body.orderNumber).toBe('TEST-ORDER-001');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999/invoice')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should not generate invoice for orders of other users', async () => {
      // Create order for another user
      const anotherUser = await User.create({
        name: 'Another User 3',
        email: 'another3@test.com',
        password: 'hashedpassword',
        role: 'buyer'
      });

      const otherOrder = await Order.create({
        userId: anotherUser.id,
        orderNumber: 'OTHER-ORDER-003',
        totalAmount: 299.99,
        status: 'pending'
      });

      const response = await request(app)
        .get(`/api/orders/${otherOrder.id}/invoice`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}/invoice`)
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });
  });

  describe('GET /api/orders/supplier', () => {
    it('should return supplier orders successfully', async () => {
      const response = await request(app)
        .get('/api/orders/supplier')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
      expect(response.body.orders[0]).toHaveProperty('orderNumber');
      expect(response.body.orders[0]).toHaveProperty('User');
    });

    it('should require supplier authentication', async () => {
      const response = await request(app)
        .get('/api/orders/supplier')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(response.body.message || response.body.error).toMatch(/permission|access|denied/i);
    });

    it('should return only orders for the authenticated supplier', async () => {
      const response = await request(app)
        .get('/api/orders/supplier')
        .set('Authorization', `Bearer ${supplierToken}`)
        .expect(200);

      response.body.orders.forEach(order => {
        expect(order.supplierId).toBe(testSupplier.id);
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders/supplier')
        .expect(401);

      expect(response.body.message || response.body.error).toMatch(/token|authentication|access/i);
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle malformed request body', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No items in order');
    });

    it('should handle invalid product IDs gracefully', async () => {
      const invalidOrderData = {
        items: [
          {
            productId: 'invalid-id',
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(invalidOrderData)
        .expect(500);

      expect(response.body.error).toBe('Error creating order');
    });

    it('should handle zero or negative quantities', async () => {
      const zeroQuantityOrder = {
        items: [
          {
            productId: testProduct.id,
            quantity: 0
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(zeroQuantityOrder)
        .expect(201);

      // Should create order with 0 total amount
      expect(response.body.totalAmount).toBe(0);
    });

    it('should handle very large quantities', async () => {
      const largeQuantityOrder = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1000000
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(largeQuantityOrder)
        .expect(201);

      expect(response.body.totalAmount).toBe(99990000); // 99.99 * 1,000,000
    });

    it('should handle concurrent order creation', async () => {
      const orderData = {
        items: [
          {
            productId: testProduct.id,
            quantity: 1
          }
        ]
      };

      // Make multiple concurrent requests
      const promises = Array(3).fill().map(() =>
        request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send(orderData)
      );

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('orderNumber');
      });

      // Verify unique order numbers
      const orderNumbers = responses.map(r => r.body.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);
    });
  });
});