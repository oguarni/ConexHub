const { Order, OrderItem, Product, User, Supplier, sequelize } = require('../models');
const { Op } = require('sequelize');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const supplierId = req.user.role === 'supplier' ? req.user.Supplier?.id : null;
      
      const whereClause = supplierId ? { supplierId } : {};

      const [totalOrders, totalRevenue, totalProducts, totalCustomers] = await Promise.all([
        Order.count({ where: whereClause }),
        Order.sum('totalAmount', { where: whereClause }),
        Product.count({ where: supplierId ? { supplierId } : {} }),
        User.count({ where: { role: 'buyer' } })
      ]);

      const monthlyRevenue = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
        ],
        where: {
          ...whereClause,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      res.json({
        totalOrders,
        totalRevenue: totalRevenue || 0,
        totalProducts,
        totalCustomers,
        monthlyRevenue
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesAnalytics(req, res, next) {
    try {
      const supplierId = req.user.role === 'supplier' ? req.user.Supplier?.id : null;
      const whereClause = supplierId ? { supplierId } : {};

      const salesByStatus = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
        ],
        where: whereClause,
        group: ['status']
      });

      res.json(salesByStatus);
    } catch (error) {
      next(error);
    }
  }

  async getProductAnalytics(req, res, next) {
    try {
      const supplierId = req.user.role === 'supplier' ? req.user.Supplier?.id : null;
      
      const topProducts = await OrderItem.findAll({
        attributes: [
          'productId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
          [sequelize.fn('SUM', sequelize.col('subtotal')), 'revenue']
        ],
        include: [{
          model: Product,
          where: supplierId ? { supplierId } : {},
          attributes: ['name', 'category']
        }],
        group: ['productId', 'Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 10
      });

      res.json(topProducts);
    } catch (error) {
      next(error);
    }
  }

  async getBasicStats(req, res, next) {
    try {
      // Get basic stats available to all users (no authentication required)
      const [totalProducts, totalSuppliers, totalOrders, totalRevenue] = await Promise.all([
        Product.count({ where: { isActive: true } }),
        Supplier.count(),
        Order.count(),
        Order.sum('totalAmount') || 0
      ]);

      res.json({
        totalProducts,
        totalSuppliers,
        totalOrders,
        totalRevenue
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req, res, next) {
    try {
      const supplierId = req.user.role === 'supplier' ? req.user.Supplier?.id : null;
      const whereClause = supplierId ? { supplierId } : {};

      const topCustomers = await Order.findAll({
        attributes: [
          'userId',
          [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSpent']
        ],
        include: [{
          model: User,
          attributes: ['name', 'email', 'companyName']
        }],
        where: whereClause,
        group: ['userId', 'User.id'],
        order: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'DESC']],
        limit: 10
      });

      res.json(topCustomers);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
