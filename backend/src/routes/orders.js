import express from 'express';
import { body, validationResult } from 'express-validator';
import { Order, OrderItem, Product, User } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { handleValidationErrors, sanitizeInput, cepValidation } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Create order
router.post('/', [
  authMiddleware,
  sanitizeInput,
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items deve ser um array não vazio'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID do produto deve ser um número inteiro positivo'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantidade deve ser um número entre 1 e 1000'),
  body('cep')
    .notEmpty()
    .withMessage('CEP é obrigatório')
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 12345-678 ou 12345678'),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'bank_transfer', 'pix'])
    .withMessage('Método de pagamento deve ser credit_card, bank_transfer ou pix'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { items, cep, paymentMethod } = req.body;

  // Calculate shipping based on CEP
  const calculateShipping = (cep) => {
    const cepPrefix = cep.substring(0, 2);
    if (cepPrefix >= '80' && cepPrefix <= '87') return 15.90; // Paraná
    if (cepPrefix >= '88' && cepPrefix <= '89') return 25.90; // Santa Catarina
    return 35.90; // Other states
  };

  let subtotal = 0;
  const orderItems = [];

  // Validate items and calculate subtotal
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (!product || !product.active) {
      throw new AppError(`Produto ID ${item.productId} não encontrado`, 400, 'PRODUCT_NOT_FOUND');
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    });
  }

  const shipping = calculateShipping(cep);
  const total = subtotal + shipping;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create order
  const order = await Order.create({
    orderNumber,
    userId: req.user.userId,
    subtotal,
    shipping,
    total,
    cep,
    paymentMethod: paymentMethod || 'credit_card',
    status: 'paid' // Simulate immediate payment
  });

  // Create order items
  for (const item of orderItems) {
    await OrderItem.create({
      orderId: order.id,
      ...item
    });
  }

  // Fetch complete order with items
  const completeOrder = await Order.findByPk(order.id, {
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product'
      }]
    }]
  });

  res.status(201).json({
    success: true,
    message: 'Pedido criado com sucesso',
    order: completeOrder
  });
}));

// Get user orders
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.userId },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product'
      }]
    }],
    order: [['createdAt', 'DESC']]
  });

  res.json({ 
    success: true,
    orders 
  });
}));

// Get supplier orders
router.get('/supplier', authMiddleware, async (req, res) => {
  try {
    // For suppliers, find orders where they are the supplier
    const orders = await Order.findAll({
      where: { supplierId: req.user.supplierId },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }, {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'companyName']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.userId
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;