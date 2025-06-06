const { Order, OrderItem, Product, User, Supplier, sequelize } = require('../models');

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      orderNumber: `ORD-${Date.now()}`,
      totalAmount,
      status: 'pending',
      shippingAddress: shippingAddress || req.user.address,
      paymentMethod: paymentMethod || 'invoice'
    }, { transaction: t });

    for (const item of orderItems) {
      await OrderItem.create({
        ...item,
        orderId: order.id
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
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to update this order
    if (req.user.role === 'supplier') {
      if (order.supplierId !== req.user.Supplier?.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    await order.update({ status });

    const updatedOrder = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ['name', 'email', 'companyName', 'address']
        },
        {
          model: Supplier,
          attributes: ['companyName', 'cnpj']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate invoice data
    const invoiceData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: order.User,
      supplier: order.Supplier,
      items: order.OrderItems,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.totalAmount
    };

    res.json(invoiceData);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Error generating invoice' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  generateInvoice
};