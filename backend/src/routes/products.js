import express from 'express';
import { body, validationResult } from 'express-validator';
import { Product } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';
import { handleValidationErrors, sanitizeInput, productValidation, paramValidation } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all products
router.get('/', [sanitizeInput], asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  let whereClause = { active: true };
  
  if (category && category !== 'Todas') {
    whereClause.category = category;
  }
  
  if (search) {
    whereClause.name = {
      [Op.iLike]: `%${search}%`
    };
  }

  const products = await Product.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  res.json({ 
    success: true,
    products 
  });
}));

// Get product by ID
router.get('/:id', paramValidation.id, asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  
  if (!product || !product.active) {
    throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  res.json({ 
    success: true,
    product 
  });
}));

// Create product (admin only)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  sanitizeInput,
  ...productValidation.create
], asyncHandler(async (req, res) => {
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
    success: true,
    message: 'Produto criado com sucesso',
    product
  });
}));

// Update product (admin only)
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  sanitizeInput,
  ...paramValidation.id,
  ...productValidation.update
], asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  
  if (!product) {
    throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  await product.update(req.body);

  res.json({
    success: true,
    message: 'Produto atualizado com sucesso',
    product
  });
}));

// Delete product (admin only)
router.delete('/:id', [authMiddleware, adminMiddleware, ...paramValidation.id], asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  
  if (!product) {
    throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  // Soft delete
  await product.update({ active: false });

  res.json({ 
    success: true,
    message: 'Produto removido com sucesso' 
  });
}));

export default router;