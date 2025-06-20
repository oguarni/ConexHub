import { Product, Supplier, Category } from '../models/index.js';
import { Op } from 'sequelize';
import ProductQueryBuilder from './queryBuilder/ProductQueryBuilder.js';
import config from '../config/environment.js';

class ProductService {
  constructor() {
    this.queryBuilder = new ProductQueryBuilder();
  }

  /**
   * Create a new query builder instance
   * @returns {ProductQueryBuilder} Fresh query builder
   */
  createQueryBuilder() {
    return new ProductQueryBuilder();
  }

  /**
   * Build query using advanced query builder
   * @param {Object} filters - Filter parameters
   * @param {Object} pagination - Pagination parameters
   * @param {Object} sorting - Sorting parameters
   * @param {Object} options - Additional options
   * @returns {Object} Sequelize query object
   */
  buildAdvancedQuery(filters = {}, pagination = {}, sorting = {}, options = {}) {
    const builder = this.createQueryBuilder();

    // Apply filters
    const {
      category,
      categories,
      search,
      q,
      minPrice,
      maxPrice,
      supplierId,
      supplierIds,
      featured,
      inStock,
      lowStock,
      stockThreshold,
      createdAfter,
      createdBefore,
      rating,
      verified,
      discounted,
      tags
    } = filters;

    // Basic filters
    if (category) builder.whereCategory(category);
    if (categories) builder.whereCategories(categories);
    if (supplierId) builder.whereSupplier(supplierId);
    if (supplierIds) builder.whereSuppliers(supplierIds);
    if (featured !== undefined) builder.whereFeatured(featured);
    
    // Search
    if (search || q) {
      const searchTerm = search || q;
      if (config.database.url.includes('postgres')) {
        builder.whereFullTextSearch(searchTerm);
      } else {
        builder.whereSearch(searchTerm);
      }
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      builder.wherePriceRange(minPrice, maxPrice);
    }

    // Stock filters
    if (inStock) builder.whereInStock(inStock);
    if (lowStock) builder.whereLowStock(stockThreshold || 10);

    // Date filters
    if (createdAfter) builder.whereCreatedAfter(createdAfter);
    if (createdBefore) builder.whereCreatedBefore(createdBefore);

    // Quality filters
    if (rating) builder.whereRatingAbove(rating);
    if (verified !== undefined) builder.whereSupplierVerified(verified);
    if (discounted) builder.whereDiscounted();

    // Include relations
    const { includeSupplier = true, includeCategory = true, includeReviews = false } = options;
    
    if (includeSupplier) {
      builder.includeSupplier();
    }
    
    if (includeCategory) {
      builder.includeCategory();
    }
    
    if (includeReviews) {
      builder.includeReviews({ limit: 5 });
    }

    // Apply sorting
    const { sortBy, sortOrder } = sorting;
    
    if (sortBy) {
      builder.orderBy(sortBy, sortOrder);
    } else {
      builder.orderByFeatured().orderByCreated('DESC');
    }

    // Apply pagination
    const { page, limit } = pagination;
    if (page && limit) {
      builder.paginate(page, limit);
    }

    return builder.build();
  }

  /**
   * Legacy method for backward compatibility
   */
  buildWhereClause(filters) {
    const builder = this.createQueryBuilder();
    
    if (filters.category) builder.whereCategory(filters.category);
    if (filters.search || filters.q) builder.whereSearch(filters.search || filters.q);
    if (filters.minPrice || filters.maxPrice) builder.wherePriceRange(filters.minPrice, filters.maxPrice);
    if (filters.supplierId) builder.whereSupplier(filters.supplierId);
    if (filters.featured !== undefined) builder.whereFeatured(filters.featured);
    if (filters.inStock) builder.whereInStock(filters.inStock);

    const query = builder.build();
    return query.where;
  }

  /**
   * Legacy method for backward compatibility
   */
  buildIncludeClause(options = {}) {
    const builder = this.createQueryBuilder();
    
    if (options.includeSupplier !== false) builder.includeSupplier();
    if (options.includeCategory !== false) builder.includeCategory();
    
    const query = builder.build();
    return query.include || [];
  }

  /**
   * Legacy method for backward compatibility
   */
  buildOrderClause(sortBy = 'createdAt', sortOrder = 'DESC') {
    const builder = this.createQueryBuilder();
    
    if (sortBy) {
      builder.orderBy(sortBy, sortOrder);
    } else {
      builder.orderByFeatured().orderByCreated('DESC');
    }
    
    const query = builder.build();
    return query.order;
  }

  /**
   * Get products with advanced filtering, pagination and sorting
   * @param {Object} filters - Filter parameters
   * @param {Object} pagination - Pagination parameters
   * @param {Object} sorting - Sorting parameters
   * @param {Object} options - Additional options
   * @returns {Object} Products and pagination info
   */
  async getProducts(filters = {}, pagination = {}, sorting = {}, options = {}) {
    const { page = 1, limit = 20 } = pagination;
    
    // Use advanced query builder for complex queries
    const query = this.buildAdvancedQuery(filters, pagination, sorting, options);
    
    // Execute query with count
    const { rows: products, count } = await Product.findAndCountAll(query);

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: totalPages,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      meta: {
        totalProducts: count,
        productsPerPage: products.length,
        filters: this._sanitizeFilters(filters),
        sorting: sorting
      }
    };
  }

  /**
   * Get products with simple filtering (legacy support)
   * @param {Object} filters - Filter parameters
   * @param {Object} pagination - Pagination parameters
   * @param {Object} sorting - Sorting parameters
   * @returns {Object} Products and pagination info
   */
  async getProductsLegacy(filters = {}, pagination = {}, sorting = {}) {
    const { page = 1, limit = 20 } = pagination;
    const { sortBy, sortOrder } = sorting;
    
    const offset = (page - 1) * limit;
    const where = this.buildWhereClause(filters);
    const include = this.buildIncludeClause();
    const order = this.buildOrderClause(sortBy, sortOrder);

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      distinct: true
    });

    return {
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get product by ID with relations
   * @param {number} id - Product ID
   * @returns {Object|null} Product or null if not found
   */
  async getProductById(id) {
    return await Product.findByPk(id, {
      include: this.buildIncludeClause()
    });
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @param {number} supplierId - Supplier ID
   * @returns {Object} Created product
   */
  async createProduct(productData, supplierId) {
    return await Product.create({
      ...productData,
      supplierId
    });
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Object|null} Updated product or null if not found
   */
  async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);
    
    if (!product) {
      return null;
    }

    await product.update(updateData);
    return product;
  }

  /**
   * Soft delete product
   * @param {number} id - Product ID
   * @returns {boolean} Success status
   */
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    
    if (!product) {
      return false;
    }

    await product.update({ isActive: false });
    return true;
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} options - Additional options
   * @returns {Array} Products
   */
  async getProductsByCategory(category, options = {}) {
    const { limit = 10, featured = false } = options;
    const where = this.buildWhereClause({ category, featured });

    return await Product.findAll({
      where,
      include: this.buildIncludeClause(),
      limit,
      order: this.buildOrderClause()
    });
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Array} Featured products
   */
  async getFeaturedProducts(limit = 10) {
    return await this.getProductsByCategory(null, { 
      limit, 
      featured: true 
    });
  }

  /**
   * Update product stock
   * @param {number} id - Product ID
   * @param {number} quantity - Quantity to subtract
   * @returns {boolean} Success status
   */
  async updateStock(id, quantity) {
    const product = await Product.findByPk(id);
    
    if (!product || product.stock < quantity) {
      return false;
    }

    await product.update({
      stock: product.stock - quantity
    });

    return true;
  }

  /**
   * Advanced search with multiple filters
   * @param {Object} searchParams - Search parameters
   * @returns {Object} Search results with facets
   */
  async advancedSearch(searchParams = {}) {
    const {
      query,
      filters = {},
      pagination = {},
      sorting = {},
      facets = true
    } = searchParams;

    // Build main search query
    const searchFilters = { ...filters };
    if (query) {
      searchFilters.search = query;
    }

    const results = await this.getProducts(searchFilters, pagination, sorting);

    // Add facets for filtering UI
    if (facets) {
      results.facets = await this.getFacets(searchFilters);
    }

    return results;
  }

  /**
   * Get facets for search filters
   * @param {Object} baseFilters - Base filters to apply
   * @returns {Object} Facet data
   */
  async getFacets(baseFilters = {}) {
    const builder = this.createQueryBuilder();
    
    // Apply base filters (excluding the ones we want to facet)
    const { category, supplierId, ...otherFilters } = baseFilters;
    Object.keys(otherFilters).forEach(key => {
      if (otherFilters[key] !== undefined) {
        // Apply non-faceted filters
      }
    });

    // Get category facets
    const categories = await this.getCategoryFacets(builder);
    
    // Get supplier facets
    const suppliers = await this.getSupplierFacets(builder);
    
    // Get price range facets
    const priceRanges = await this.getPriceRangeFacets(builder);

    return {
      categories,
      suppliers,
      priceRanges
    };
  }

  /**
   * Get category facets
   */
  async getCategoryFacets(baseBuilder) {
    const query = baseBuilder.build();
    query.attributes = [
      'category',
      [Product.sequelize.fn('COUNT', '*'), 'count']
    ];
    query.group = ['category'];
    query.order = [[Product.sequelize.fn('COUNT', '*'), 'DESC']];

    const results = await Product.findAll(query);
    return results.map(r => ({
      name: r.category,
      count: parseInt(r.dataValues.count)
    }));
  }

  /**
   * Get supplier facets
   */
  async getSupplierFacets(baseBuilder) {
    const query = baseBuilder.build();
    query.attributes = [
      [Product.sequelize.col('Supplier.id'), 'supplierId'],
      [Product.sequelize.col('Supplier.companyName'), 'supplierName'],
      [Product.sequelize.fn('COUNT', '*'), 'count']
    ];
    query.include = [{
      model: Supplier,
      attributes: []
    }];
    query.group = ['Supplier.id', 'Supplier.companyName'];
    query.order = [[Product.sequelize.fn('COUNT', '*'), 'DESC']];

    const results = await Product.findAll(query);
    return results.map(r => ({
      id: r.dataValues.supplierId,
      name: r.dataValues.supplierName,
      count: parseInt(r.dataValues.count)
    }));
  }

  /**
   * Get price range facets
   */
  async getPriceRangeFacets(baseBuilder) {
    const query = baseBuilder.build();
    
    const priceStats = await Product.findOne({
      ...query,
      attributes: [
        [Product.sequelize.fn('MIN', Product.sequelize.col('price')), 'minPrice'],
        [Product.sequelize.fn('MAX', Product.sequelize.col('price')), 'maxPrice'],
        [Product.sequelize.fn('AVG', Product.sequelize.col('price')), 'avgPrice']
      ]
    });

    const { minPrice, maxPrice, avgPrice } = priceStats.dataValues;
    
    // Create price ranges
    const ranges = [];
    const step = (maxPrice - minPrice) / 5;
    
    for (let i = 0; i < 5; i++) {
      const rangeMin = minPrice + (step * i);
      const rangeMax = i === 4 ? maxPrice : minPrice + (step * (i + 1));
      
      ranges.push({
        min: Math.round(rangeMin),
        max: Math.round(rangeMax),
        label: `R$ ${Math.round(rangeMin)} - R$ ${Math.round(rangeMax)}`
      });
    }

    return ranges;
  }

  /**
   * Get product recommendations
   * @param {number} productId - Base product ID
   * @param {number} limit - Number of recommendations
   * @returns {Array} Recommended products
   */
  async getRecommendations(productId, limit = 5) {
    const baseProduct = await this.getProductById(productId);
    if (!baseProduct) return [];

    const builder = this.createQueryBuilder();
    
    // Recommend products in same category, excluding the base product
    builder
      .whereCategory(baseProduct.category)
      .whereCustom({ id: { [Op.ne]: productId } })
      .includeSupplier()
      .includeCategory()
      .orderByFeatured()
      .orderByPopularity()
      .limit(limit);

    const query = builder.build();
    return await Product.findAll(query);
  }

  /**
   * Get trending products
   * @param {number} limit - Number of products
   * @param {number} days - Days to look back
   * @returns {Array} Trending products
   */
  async getTrendingProducts(limit = 10, days = 7) {
    const builder = this.createQueryBuilder();
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    builder
      .whereCreatedAfter(dateThreshold)
      .includeSupplier()
      .includeCategory()
      .orderByPopularity()
      .orderByFeatured()
      .limit(limit);

    const query = builder.build();
    return await Product.findAll(query);
  }

  /**
   * Sanitize filters for response
   * @private
   */
  _sanitizeFilters(filters) {
    const sanitized = { ...filters };
    
    // Remove empty values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === null || sanitized[key] === '') {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   * @returns {Object} Validation result
   */
  validateProductData(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
      errors.push('Product price must be a valid positive number');
    }

    if (!productData.category || productData.category.trim().length === 0) {
      errors.push('Product category is required');
    }

    if (productData.stock !== undefined && (isNaN(parseInt(productData.stock)) || parseInt(productData.stock) < 0)) {
      errors.push('Product stock must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Bulk operations
   */
  async bulkUpdatePrices(updates) {
    const results = [];
    
    for (const update of updates) {
      try {
        const product = await this.updateProduct(update.id, { price: update.price });
        results.push({ id: update.id, success: true, product });
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkUpdateStock(updates) {
    const results = [];
    
    for (const update of updates) {
      try {
        const product = await this.updateProduct(update.id, { stock: update.stock });
        results.push({ id: update.id, success: true, product });
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    return results;
  }
}

export default new ProductService();