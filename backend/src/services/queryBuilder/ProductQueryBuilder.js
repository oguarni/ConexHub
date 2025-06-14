const { Op, Sequelize } = require('sequelize');

/**
 * Advanced Product Query Builder
 * Provides sophisticated filtering, sorting, and searching capabilities
 */
class ProductQueryBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Reset query builder to initial state
   */
  reset() {
    this.whereConditions = { isActive: true };
    this.includeRelations = [];
    this.orderClauses = [];
    this.limitValue = null;
    this.offsetValue = null;
    this.groupByFields = [];
    this.havingConditions = {};
    return this;
  }

  /**
   * Add basic filters
   */
  whereActive(isActive = true) {
    this.whereConditions.isActive = isActive;
    return this;
  }

  whereCategory(category) {
    if (category && category !== 'All' && category !== 'Todas') {
      this.whereConditions.category = category;
    }
    return this;
  }

  whereCategories(categories) {
    if (categories && Array.isArray(categories) && categories.length > 0) {
      this.whereConditions.category = { [Op.in]: categories };
    }
    return this;
  }

  whereSupplier(supplierId) {
    if (supplierId) {
      this.whereConditions.supplierId = supplierId;
    }
    return this;
  }

  whereSuppliers(supplierIds) {
    if (supplierIds && Array.isArray(supplierIds) && supplierIds.length > 0) {
      this.whereConditions.supplierId = { [Op.in]: supplierIds };
    }
    return this;
  }

  whereFeatured(featured) {
    if (featured !== undefined) {
      this.whereConditions.featured = featured === true || featured === 'true';
    }
    return this;
  }

  /**
   * Price range filters
   */
  wherePriceRange(minPrice, maxPrice) {
    const priceConditions = {};
    
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      priceConditions[Op.gte] = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      priceConditions[Op.lte] = parseFloat(maxPrice);
    }
    
    if (Object.keys(priceConditions).length > 0) {
      this.whereConditions.price = priceConditions;
    }
    
    return this;
  }

  wherePriceGreaterThan(price) {
    if (price !== undefined && price !== null) {
      this.whereConditions.price = {
        ...this.whereConditions.price,
        [Op.gt]: parseFloat(price)
      };
    }
    return this;
  }

  wherePriceLessThan(price) {
    if (price !== undefined && price !== null) {
      this.whereConditions.price = {
        ...this.whereConditions.price,
        [Op.lt]: parseFloat(price)
      };
    }
    return this;
  }

  /**
   * Stock filters
   */
  whereInStock(inStock = true) {
    if (inStock) {
      this.whereConditions.stock = { [Op.gt]: 0 };
    }
    return this;
  }

  whereStockRange(minStock, maxStock) {
    const stockConditions = {};
    
    if (minStock !== undefined && minStock !== null) {
      stockConditions[Op.gte] = parseInt(minStock);
    }
    
    if (maxStock !== undefined && maxStock !== null) {
      stockConditions[Op.lte] = parseInt(maxStock);
    }
    
    if (Object.keys(stockConditions).length > 0) {
      this.whereConditions.stock = stockConditions;
    }
    
    return this;
  }

  whereLowStock(threshold = 10) {
    this.whereConditions.stock = { [Op.lte]: threshold, [Op.gt]: 0 };
    return this;
  }

  /**
   * Search functionality
   */
  whereSearch(searchTerm) {
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      this.whereConditions[Op.or] = [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { tags: { [Op.iLike]: term } },
        { sku: { [Op.iLike]: term } }
      ];
    }
    return this;
  }

  whereFullTextSearch(searchTerm) {
    if (searchTerm && searchTerm.trim()) {
      // PostgreSQL full-text search
      this.whereConditions[Op.or] = [
        Sequelize.where(
          Sequelize.fn('to_tsvector', 'english', Sequelize.col('name')),
          Op.match,
          Sequelize.fn('plainto_tsquery', 'english', searchTerm)
        ),
        Sequelize.where(
          Sequelize.fn('to_tsvector', 'english', Sequelize.col('description')),
          Op.match,
          Sequelize.fn('plainto_tsquery', 'english', searchTerm)
        )
      ];
    }
    return this;
  }

  /**
   * Date filters
   */
  whereCreatedAfter(date) {
    if (date) {
      this.whereConditions.createdAt = { [Op.gte]: new Date(date) };
    }
    return this;
  }

  whereCreatedBefore(date) {
    if (date) {
      this.whereConditions.createdAt = { [Op.lte]: new Date(date) };
    }
    return this;
  }

  whereCreatedBetween(startDate, endDate) {
    if (startDate && endDate) {
      this.whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    return this;
  }

  whereUpdatedAfter(date) {
    if (date) {
      this.whereConditions.updatedAt = { [Op.gte]: new Date(date) };
    }
    return this;
  }

  /**
   * Custom conditions
   */
  whereRaw(field, operator, value) {
    if (field && operator && value !== undefined) {
      this.whereConditions[field] = { [operator]: value };
    }
    return this;
  }

  whereCustom(conditions) {
    if (conditions && typeof conditions === 'object') {
      this.whereConditions = { ...this.whereConditions, ...conditions };
    }
    return this;
  }

  /**
   * Include relations
   */
  includeSupplier(options = {}) {
    const {
      attributes = ['id', 'companyName', 'verified', 'rating', 'location'],
      required = false,
      where = null
    } = options;

    const include = {
      model: require('../models').Supplier,
      attributes,
      required
    };

    if (where) {
      include.where = where;
    }

    this.includeRelations.push(include);
    return this;
  }

  includeCategory(options = {}) {
    const {
      attributes = ['id', 'name', 'slug', 'description'],
      required = false,
      where = null
    } = options;

    const include = {
      model: require('../models').Category,
      attributes,
      required
    };

    if (where) {
      include.where = where;
    }

    this.includeRelations.push(include);
    return this;
  }

  includeReviews(options = {}) {
    const {
      attributes = ['id', 'rating', 'comment', 'createdAt'],
      required = false,
      limit = null
    } = options;

    const include = {
      model: require('../models').Review,
      attributes,
      required
    };

    if (limit) {
      include.limit = limit;
      include.order = [['createdAt', 'DESC']];
    }

    this.includeRelations.push(include);
    return this;
  }

  /**
   * Sorting
   */
  orderBy(field, direction = 'ASC') {
    const validSortFields = [
      'name', 'price', 'createdAt', 'updatedAt', 'featured', 
      'stock', 'rating', 'views', 'sales'
    ];
    
    if (validSortFields.includes(field)) {
      this.orderClauses.push([field, direction.toUpperCase()]);
    }
    return this;
  }

  orderByPrice(direction = 'ASC') {
    return this.orderBy('price', direction);
  }

  orderByName(direction = 'ASC') {
    return this.orderBy('name', direction);
  }

  orderByCreated(direction = 'DESC') {
    return this.orderBy('createdAt', direction);
  }

  orderByFeatured() {
    this.orderClauses.unshift(['featured', 'DESC']);
    return this;
  }

  orderByPopularity() {
    this.orderClauses.push(['views', 'DESC'], ['sales', 'DESC']);
    return this;
  }

  orderByRating() {
    this.orderClauses.push(['rating', 'DESC']);
    return this;
  }

  orderByStock(direction = 'DESC') {
    return this.orderBy('stock', direction);
  }

  /**
   * Pagination
   */
  limit(limit) {
    this.limitValue = parseInt(limit);
    return this;
  }

  offset(offset) {
    this.offsetValue = parseInt(offset);
    return this;
  }

  paginate(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    this.limitValue = limitNum;
    this.offsetValue = (pageNum - 1) * limitNum;
    return this;
  }

  /**
   * Aggregation
   */
  groupBy(fields) {
    if (Array.isArray(fields)) {
      this.groupByFields = fields;
    } else if (typeof fields === 'string') {
      this.groupByFields = [fields];
    }
    return this;
  }

  having(conditions) {
    this.havingConditions = { ...this.havingConditions, ...conditions };
    return this;
  }

  /**
   * Advanced filters
   */
  whereSupplierVerified(verified = true) {
    this.includeSupplier({ where: { verified }, required: true });
    return this;
  }

  whereCategorySlug(slug) {
    if (slug) {
      this.includeCategory({ where: { slug }, required: true });
    }
    return this;
  }

  whereRatingAbove(rating) {
    if (rating) {
      this.whereConditions.rating = { [Op.gte]: parseFloat(rating) };
    }
    return this;
  }

  whereDiscounted() {
    this.whereConditions.discountPrice = { [Op.ne]: null };
    this.whereConditions[Op.and] = [
      Sequelize.where(
        Sequelize.col('discountPrice'),
        Op.lt,
        Sequelize.col('price')
      )
    ];
    return this;
  }

  /**
   * Build the final query object
   */
  build() {
    const query = {
      where: this.whereConditions
    };

    if (this.includeRelations.length > 0) {
      query.include = this.includeRelations;
    }

    if (this.orderClauses.length > 0) {
      query.order = this.orderClauses;
    } else {
      // Default ordering
      query.order = [['featured', 'DESC'], ['createdAt', 'DESC']];
    }

    if (this.limitValue !== null) {
      query.limit = this.limitValue;
    }

    if (this.offsetValue !== null) {
      query.offset = this.offsetValue;
    }

    if (this.groupByFields.length > 0) {
      query.group = this.groupByFields;
    }

    if (Object.keys(this.havingConditions).length > 0) {
      query.having = this.havingConditions;
    }

    // Add distinct for counting with includes
    if (this.includeRelations.length > 0) {
      query.distinct = true;
    }

    return query;
  }

  /**
   * Build count query (without limit/offset for pagination)
   */
  buildCount() {
    const query = this.build();
    delete query.limit;
    delete query.offset;
    delete query.order;
    return query;
  }
}

module.exports = ProductQueryBuilder;