const { Quote, Order, OrderItem, Product, Supplier, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const requestQuote = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Create order first
    const order = await Order.create({
      userId: req.user.id,
      orderNumber: `ORD-${Date.now()}`,
      status: 'quote_requested',
      shippingAddress: shippingAddress || req.user.address,
      notes,
      totalAmount: 0
    }, { transaction: t });

    // Create order items
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: product.price * item.quantity
      }, { transaction: t });
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    res.status(201).json(fullOrder);
  } catch (error) {
    await t.rollback();
    console.error('Error requesting quote:', error);
    res.status(500).json({ error: 'Error requesting quote' });
  }
};

const getSupplierQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { rows: quotes, count } = await Quote.findAndCountAll({
      where: {
        supplierId: req.user.Supplier?.id,
        ...where
      },
      include: [{
        model: Order,
        include: [{ model: User, attributes: ['name', 'email', 'companyName'] }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      quotes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching supplier quotes' });
  }
};

const submitQuote = async (req, res) => {
  try {
    const { orderId, items, validUntil, terms } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const totalAmount = items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    const quote = await Quote.create({
      quoteNumber: `QUO-${Date.now()}`,
      orderId,
      supplierId: req.user.Supplier?.id,
      totalAmount,
      validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      terms,
      items,
      status: 'sent'
    });

    res.status(201).json(quote);
  } catch (error) {
    console.error('Error submitting quote:', error);
    res.status(500).json({ error: 'Error submitting quote' });
  }
};

const getBuyerQuotes = async (req, res) => {
  try {
    const { orderId } = req.params;

    const quotes = await Quote.findAll({
      where: { orderId },
      include: [{
        model: Supplier,
        attributes: ['id', 'companyName', 'rating', 'verified']
      }],
      order: [['totalAmount', 'ASC']]
    });

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching buyer quotes' });
  }
};

const acceptQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findByPk(quoteId, {
      include: [Order]
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.Order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await quote.update({ status: 'accepted' });
    await quote.Order.update({ 
      status: 'confirmed',
      supplierId: quote.supplierId,
      totalAmount: quote.totalAmount
    });

    res.json({ message: 'Quote accepted successfully', quote });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({ error: 'Error accepting quote' });
  }
};

module.exports = {
  requestQuote,
  getSupplierQuotes,
  submitQuote,
  getBuyerQuotes,
  acceptQuote
};