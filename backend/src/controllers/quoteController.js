const { Quote, Product, User, Supplier, sequelize } = require('../models');
const { Op } = require('sequelize');

// Generate unique quote number
const generateQuoteNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QUO-${timestamp}-${random}`;
};

const requestQuote = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const product = await Product.findByPk(productId, {
      include: [{
        model: Supplier,
        include: [{
          model: User,
          attributes: ['id', 'name', 'email', 'companyName']
        }]
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.Supplier) {
      return res.status(400).json({ error: 'Product has no supplier' });
    }

    const quote = await Quote.create({
      quoteNumber: generateQuoteNumber(),
      buyerId: req.user.id,
      supplierId: product.Supplier.User.id,
      productId: product.id,
      quantity: parseInt(quantity),
      notes: notes || '',
      status: 'pending'
    });

    const fullQuote = await Quote.findByPk(quote.id, {
      include: [
        {
          model: User,
          as: 'Buyer',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: User,
          as: 'Supplier',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'unit']
        }
      ]
    });

    res.status(201).json(fullQuote);
  } catch (error) {
    console.error('Error requesting quote:', error);
    res.status(500).json({ error: 'Error requesting quote' });
  }
};

const getSupplierQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { supplierId: req.user.id };
    if (status) where.status = status;

    const { rows: quotes, count } = await Quote.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Buyer',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'unit', 'image']
        }
      ],
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
    console.error('Error fetching supplier quotes:', error);
    res.status(500).json({ error: 'Error fetching supplier quotes' });
  }
};

const submitQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { unitPrice, deliveryTime, terms, supplierNotes, validUntil } = req.body;

    const quote = await Quote.findByPk(quoteId, {
      include: [
        {
          model: User,
          as: 'Buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price']
        }
      ]
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.supplierId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only respond to your own quotes' });
    }

    if (quote.status !== 'pending') {
      return res.status(400).json({ error: 'Quote has already been responded to' });
    }

    const totalAmount = parseFloat(unitPrice) * quote.quantity;

    await quote.update({
      unitPrice: parseFloat(unitPrice),
      totalAmount,
      deliveryTime,
      terms,
      supplierNotes,
      validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'quoted'
    });

    const updatedQuote = await Quote.findByPk(quote.id, {
      include: [
        {
          model: User,
          as: 'Buyer',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: User,
          as: 'Supplier',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'unit', 'image']
        }
      ]
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Error submitting quote:', error);
    res.status(500).json({ error: 'Error submitting quote' });
  }
};

const getBuyerQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { buyerId: req.user.id };
    if (status) where.status = status;

    const { rows: quotes, count } = await Quote.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Supplier',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'unit', 'image']
        }
      ],
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
    console.error('Error fetching buyer quotes:', error);
    res.status(500).json({ error: 'Error fetching buyer quotes' });
  }
};

const acceptQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findByPk(quoteId, {
      include: [
        {
          model: User,
          as: 'Supplier',
          attributes: ['id', 'name', 'email', 'companyName']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price', 'unit']
        }
      ]
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only accept your own quotes' });
    }

    if (quote.status !== 'quoted') {
      return res.status(400).json({ error: 'Quote cannot be accepted in current status' });
    }

    await quote.update({ status: 'accepted' });

    // Create order from accepted quote
    const { Order, OrderItem, Supplier } = require('../models');
    
    // Find supplier profile for the supplier user
    const supplierProfile = await Supplier.findOne({
      where: { userId: quote.supplierId }
    });
    
    // Generate unique order number
    const generateOrderNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `ORD-${year}${month}${day}-${random}`;
    };

    const subtotal = parseFloat(quote.unitPrice) * quote.quantity;
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: quote.buyerId,
      supplierId: supplierProfile ? supplierProfile.id : null,
      status: 'confirmed',
      subtotal: subtotal,
      totalAmount: subtotal,
      notes: `Order created from quote #${quote.id}`
    });

    // Create order item
    await OrderItem.create({
      orderId: order.id,
      productId: quote.productId,
      quantity: quote.quantity,
      price: quote.unitPrice,
      subtotal: subtotal
    });

    // Link quote to order
    await quote.update({ orderId: order.id });

    res.json({ 
      message: 'Quote accepted successfully and order created', 
      quote, 
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({ error: 'Error accepting quote' });
  }
};

const rejectQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { reason } = req.body;

    const quote = await Quote.findByPk(quoteId);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only reject your own quotes' });
    }

    if (quote.status !== 'quoted') {
      return res.status(400).json({ error: 'Quote cannot be rejected in current status' });
    }

    await quote.update({ 
      status: 'rejected',
      notes: reason ? `${quote.notes}\nRejection reason: ${reason}` : quote.notes
    });

    res.json({ message: 'Quote rejected successfully', quote });
  } catch (error) {
    console.error('Error rejecting quote:', error);
    res.status(500).json({ error: 'Error rejecting quote' });
  }
};

module.exports = {
  requestQuote,
  getSupplierQuotes,
  submitQuote,
  getBuyerQuotes,
  acceptQuote,
  rejectQuote
};