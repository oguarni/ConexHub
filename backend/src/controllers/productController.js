const { Product, Supplier, Category } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          attributes: ['id', 'companyName', 'verified'],
          required: false
        },
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          attributes: ['id', 'companyName', 'verified'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['featured', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Error searching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          attributes: ['id', 'companyName', 'verified', 'rating']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let supplierId = req.user.Supplier?.id;
    
    // Se for admin e não tiver supplier, pegar o primeiro supplier disponível
    if (req.user.role === 'admin' && !supplierId) {
      const firstSupplier = await Supplier.findOne();
      supplierId = firstSupplier?.id;
    }

    const product = await Product.create({
      ...req.body,
      supplierId
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({ isActive: false });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};