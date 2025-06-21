import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { sequelize, User, Product, Supplier, Category } from '../../src/models/index.js';

// Mock productService
const mockProductService = {
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
};

jest.unstable_mockModule('../../src/services/productService.js', () => ({
  default: mockProductService
}));

describe('Product Controller', () => {
  let authToken;
  let supplierUser;
  let buyerUser;
  let adminUser;
  let testSupplier;
  let testCategory;
  let testProduct;

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

    // Generate auth token for supplier
    authToken = jwt.sign(
      { 
        id: supplierUser.id, 
        email: supplierUser.email, 
        role: supplierUser.role,
        Supplier: { id: testSupplier.id }
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return all products successfully', async () => {
      const mockProducts = {
        products: [
          {
            id: 1,
            name: 'Product 1',
            price: 99.99,
            category: 'Test Category'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual(mockProducts);
      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        {
          category: undefined,
          search: undefined,
          featured: undefined,
          inStock: undefined
        },
        { page: 1, limit: 20 },
        { sortBy: undefined, sortOrder: undefined }
      );
    });

    it('should return products with filters applied', async () => {
      const mockProducts = {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };

      mockProductService.getProducts.mockResolvedValue(mockProducts);

      await request(app)
        .get('/api/products')
        .query({
          category: 'Electronics',
          search: 'laptop',
          featured: 'true',
          inStock: 'true',
          page: 2,
          limit: 10,
          sortBy: 'price',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        {
          category: 'Electronics',
          search: 'laptop',
          featured: 'true',
          inStock: 'true'
        },
        { page: 2, limit: 10 },
        { sortBy: 'price', sortOrder: 'asc' }
      );
    });

    it('should handle service errors gracefully', async () => {
      mockProductService.getProducts.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error fetching products' });
    });
  });

  describe('GET /api/products/search', () => {
    it('should search products successfully', async () => {
      const mockProducts = {
        products: [{ id: 1, name: 'Search Result' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      };

      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'test product' })
        .expect(200);

      expect(response.body).toEqual(mockProducts);
      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        {
          q: 'test product',
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          supplierId: undefined
        },
        { page: 1, limit: 20 },
        { sortBy: undefined, sortOrder: undefined }
      );
    });

    it('should search with price range filters', async () => {
      mockProductService.getProducts.mockResolvedValue({
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      await request(app)
        .get('/api/products/search')
        .query({
          q: 'laptop',
          minPrice: '100',
          maxPrice: '500',
          supplierId: '123'
        })
        .expect(200);

      expect(mockProductService.getProducts).toHaveBeenCalledWith(
        {
          q: 'laptop',
          category: undefined,
          minPrice: '100',
          maxPrice: '500',
          supplierId: '123'
        },
        { page: 1, limit: 20 },
        { sortBy: undefined, sortOrder: undefined }
      );
    });

    it('should handle search errors gracefully', async () => {
      mockProductService.getProducts.mockRejectedValue(new Error('Search error'));

      const response = await request(app)
        .get('/api/products/search')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error searching products' });
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        description: 'Test description'
      };

      mockProductService.getProductById.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockProductService.getProductById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when product not found', async () => {
      mockProductService.getProductById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should handle service errors gracefully', async () => {
      mockProductService.getProductById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/products/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error fetching product' });
    });
  });

  describe('POST /api/products', () => {
    const validProductData = {
      name: 'New Product',
      description: 'New product description',
      price: 199.99,
      stock: 50,
      category: 'Test Category',
      unit: 'piece',
      minOrder: 1
    };

    it('should create a product successfully as supplier', async () => {
      const mockCreatedProduct = {
        id: 2,
        ...validProductData,
        supplierId: testSupplier.id
      };

      mockProductService.createProduct.mockResolvedValue(mockCreatedProduct);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Product created successfully',
        product: mockCreatedProduct
      });

      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        validProductData,
        testSupplier.id
      );
    });

    it('should create a product successfully as admin', async () => {
      const adminToken = jwt.sign(
        { 
          id: adminUser.id, 
          email: adminUser.email, 
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const mockCreatedProduct = {
        id: 3,
        ...validProductData,
        supplierId: testSupplier.id
      };

      mockProductService.createProduct.mockResolvedValue(mockCreatedProduct);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(mockProductService.createProduct).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(validProductData)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject access for buyers', async () => {
      const buyerToken = jwt.sign(
        { 
          id: buyerUser.id, 
          email: buyerUser.email, 
          role: 'buyer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(validProductData)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should handle validation errors', async () => {
      mockProductService.createProduct.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' }) // Invalid data
        .expect(500);

      expect(response.body).toEqual({ error: 'Error creating product' });
    });

    it('should handle service errors gracefully', async () => {
      mockProductService.createProduct.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProductData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Error creating product' });
    });
  });

  describe('PUT /api/products/:id', () => {
    const updateData = {
      name: 'Updated Product',
      price: 299.99,
      stock: 75
    };

    it('should update a product successfully', async () => {
      const mockUpdatedProduct = {
        id: 1,
        ...updateData,
        description: 'Original description'
      };

      mockProductService.updateProduct.mockResolvedValue(mockUpdatedProduct);

      const response = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Product updated successfully',
        product: mockUpdatedProduct
      });

      expect(mockProductService.updateProduct).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 when product not found', async () => {
      mockProductService.updateProduct.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/products/1')
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject access for buyers', async () => {
      const buyerToken = jwt.sign(
        { 
          id: buyerUser.id, 
          email: buyerUser.email, 
          role: 'buyer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should handle service errors gracefully', async () => {
      mockProductService.updateProduct.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Error updating product' });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      mockProductService.deleteProduct.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Product deleted successfully' });
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
    });

    it('should return 404 when product not found', async () => {
      mockProductService.deleteProduct.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/products/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/products/1')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should reject access for buyers', async () => {
      const buyerToken = jwt.sign(
        { 
          id: buyerUser.id, 
          email: buyerUser.email, 
          role: 'buyer'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });

    it('should handle service errors gracefully', async () => {
      mockProductService.deleteProduct.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toEqual({ error: 'Error deleting product' });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle extremely large request payloads gracefully', async () => {
      const largePayload = {
        name: 'A'.repeat(10000), // Very long name
        description: 'B'.repeat(50000), // Very long description
        price: 99.99
      };

      // This should be rejected by body parser or validation
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePayload)
        .expect(res => {
          expect([400, 413, 500]).toContain(res.status);
        });
    });

    it('should handle invalid product IDs', async () => {
      mockProductService.getProductById.mockRejectedValue(new Error('Invalid ID format'));

      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error fetching product' });
    });

    it('should handle concurrent product creation attempts', async () => {
      const validProductData = {
        name: 'Concurrent Product',
        description: 'Test concurrent creation',
        price: 99.99,
        stock: 10,
        category: 'Test',
        unit: 'piece'
      };

      mockProductService.createProduct.mockResolvedValue({
        id: 100,
        ...validProductData
      });

      // Make multiple concurrent requests
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validProductData)
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (assuming service handles concurrency)
      responses.forEach(response => {
        expect([201, 409, 500]).toContain(response.status);
      });
    });
  });
});