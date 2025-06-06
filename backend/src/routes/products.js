const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product } = require('../models');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let whereClause = { active: true };
    
    if (category && category !== 'Todas') {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.name = {
        [require('sequelize').Op.iLike]: `%${search}%`
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product || !product.active) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create product (admin only)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número válido'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('unit').optional(),
  body('image').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, unit, image } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      unit: unit || 'unidade',
      image: image || '📦'
    });

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update product (admin only)
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  body('name').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().notEmpty(),
  body('unit').optional(),
  body('image').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await product.update(req.body);

    res.json({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete product (admin only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Soft delete
    await product.update({ active: false });

    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;