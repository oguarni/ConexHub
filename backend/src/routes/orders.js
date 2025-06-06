const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Product, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', [
  authMiddleware,
  body('items').isArray().withMessage('Items deve ser um array'),
  body('cep').notEmpty().withMessage('CEP é obrigatório'),
  body('paymentMethod').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, cep, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Pelo menos um item é obrigatório' });
    }

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
        return res.status(400).json({ error: `Produto ID ${item.productId} não encontrado` });
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
      message: 'Pedido criado com sucesso',
      order: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
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

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
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

module.exports = router;