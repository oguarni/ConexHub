const { User, Supplier, Order, Product } = require('../models');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, role } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;

      const { rows: users, count } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        include: [{
          model: Supplier,
          required: false
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, emailVerified } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ isActive, emailVerified });

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async verifySupplier(req, res, next) {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      await supplier.update({ verified: true });
      res.json({ message: 'Supplier verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const [totalUsers, totalSuppliers, totalOrders, totalProducts] = await Promise.all([
        User.count(),
        Supplier.count(),
        Order.count(),
        Product.count()
      ]);

      const recentActivity = await Order.findAll({
        limit: 10,
        include: [User, Supplier],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        summary: {
          totalUsers,
          totalSuppliers,
          totalOrders,
          totalProducts
        },
        recentActivity
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
