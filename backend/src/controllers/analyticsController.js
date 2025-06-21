import { Order, OrderItem, Product, User, Supplier, Quote, Review, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

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

  async getAdminDashboardStats(req, res, next) {
    try {
      const [totalOrders, totalUsers, totalProducts, totalSuppliers] = await Promise.all([
        Order.count(),
        User.count(),
        Product.count(),
        Supplier.count(),
      ]);

      const lastMonthOrders = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      const lastMonthRevenue = await Order.sum('totalAmount', {
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      const pendingQuotes = await Quote.count({
        where: { status: 'pending' }
      });

      const activeSuppliers = await Supplier.count({
        where: { verified: true }
      });

      const monthlyGrowth = await this.calculateGrowthMetrics();

      res.json({
        totalOrders,
        totalUsers,
        totalProducts,
        totalSuppliers,
        lastMonthOrders,
        lastMonthRevenue: lastMonthRevenue || 0,
        pendingQuotes,
        activeSuppliers,
        monthlyGrowth
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateGrowthMetrics() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1);

    const [currentMonthOrders, lastMonthOrdersCount] = await Promise.all([
      Order.count({
        where: {
          createdAt: {
            [Op.gte]: lastMonth,
            [Op.lt]: currentMonth
          }
        }
      }),
      Order.count({
        where: {
          createdAt: {
            [Op.gte]: twoMonthsAgo,
            [Op.lt]: lastMonth
          }
        }
      })
    ]);

    const ordersGrowth = lastMonthOrdersCount ? 
      ((currentMonthOrders - lastMonthOrdersCount) / lastMonthOrdersCount * 100) : 0;

    return {
      ordersGrowth: Math.round(ordersGrowth * 100) / 100
    };
  }

  async getOrderStats(req, res, next) {
    try {
      const { period = '7d' } = req.query;
      
      let dateFilter = new Date();
      let groupBy = 'day';
      
      switch(period) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          groupBy = 'day';
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          groupBy = 'day';
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          groupBy = 'week';
          break;
        case '1y':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          groupBy = 'month';
          break;
      }

      let dateFunction;
      switch(groupBy) {
        case 'day':
          dateFunction = sequelize.fn('DATE', sequelize.col('createdAt'));
          break;
        case 'week':
          dateFunction = sequelize.fn('DATE_TRUNC', 'week', sequelize.col('createdAt'));
          break;
        case 'month':
          dateFunction = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'));
          break;
      }

      const orderStats = await Order.findAll({
        attributes: [
          [dateFunction, 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
          [sequelize.fn('AVG', sequelize.col('totalAmount')), 'avgOrderValue']
        ],
        where: {
          createdAt: {
            [Op.gte]: dateFilter
          }
        },
        group: [dateFunction],
        order: [[dateFunction, 'ASC']]
      });

      const statusDistribution = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: dateFilter
          }
        },
        group: ['status']
      });

      res.json({
        orderStats,
        statusDistribution
      });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierDashboardStats(req, res, next) {
    try {
      const supplierId = req.user.Supplier?.id;
      
      if (!supplierId) {
        return res.status(400).json({ error: 'Supplier profile not found' });
      }

      const [totalProducts, totalOrders, totalRevenue, pendingQuotes] = await Promise.all([
        Product.count({ where: { supplierId, isActive: true } }),
        Order.count({ where: { supplierId } }),
        Order.sum('totalAmount', { where: { supplierId, status: 'completed' } }) || 0,
        Quote.count({ where: { supplierId, status: 'pending' } })
      ]);

      const monthlyRevenue = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
        ],
        where: {
          supplierId,
          status: 'completed',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
          }
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      const topProducts = await OrderItem.findAll({
        attributes: [
          'productId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
          [sequelize.fn('SUM', sequelize.col('subtotal')), 'revenue']
        ],
        include: [{
          model: Product,
          where: { supplierId },
          attributes: ['name', 'category', 'price']
        }],
        group: ['productId', 'Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('subtotal')), 'DESC']],
        limit: 5
      });

      const recentOrders = await Order.findAll({
        where: { supplierId },
        include: [{
          model: User,
          attributes: ['name', 'companyName']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      res.json({
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingQuotes,
        monthlyRevenue,
        topProducts,
        recentOrders
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRegistrationStats(req, res, next) {
    try {
      const userRegistrations = await User.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      });

      const roleDistribution = await User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role']
      });

      res.json({
        userRegistrations,
        roleDistribution
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuoteStats(req, res, next) {
    try {
      const quoteStats = await Quote.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('totalPrice')), 'avgValue']
        ],
        group: ['status']
      });

      const recentQuotes = await Quote.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      });

      const conversionRate = await this.calculateQuoteConversionRate();

      res.json({
        quoteStats,
        recentQuotes,
        conversionRate
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateQuoteConversionRate() {
    const [totalQuotes, convertedQuotes] = await Promise.all([
      Quote.count(),
      Quote.count({ where: { status: 'accepted' } })
    ]);

    return totalQuotes ? (convertedQuotes / totalQuotes * 100) : 0;
  }

  async getCategoryAnalytics(req, res, next) {
    try {
      const categoryStats = await Product.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'productCount'],
          [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
        ],
        group: ['category'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      const categoryRevenue = await OrderItem.findAll({
        attributes: [
          [sequelize.col('Product.category'), 'category'],
          [sequelize.fn('SUM', sequelize.col('subtotal')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']
        ],
        include: [{
          model: Product,
          attributes: [],
          required: true
        }],
        group: [sequelize.col('Product.category')],
        order: [[sequelize.fn('SUM', sequelize.col('subtotal')), 'DESC']]
      });

      res.json({
        categoryStats,
        categoryRevenue
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();

export { AnalyticsController };
