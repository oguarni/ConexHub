import { User, Supplier, Order, Product, sequelize } from '../models/index.js';

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

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Cannot delete admin users' });
      }

      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getSuppliers(req, res, next) {
    try {
      const { page = 1, limit = 20, verified } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (verified !== undefined) {
        where.verified = verified === 'true';
      }

      const { rows: suppliers, count } = await Supplier.findAndCountAll({
        where,
        include: [{
          model: User,
          attributes: ['name', 'email', 'phone']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        suppliers,
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

  async updateSupplierStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { verified, isActive } = req.body;

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      const updates = {};
      if (verified !== undefined) updates.verified = verified;
      if (isActive !== undefined) updates.isActive = isActive;

      await supplier.update(updates);
      res.json({ message: 'Supplier status updated successfully', supplier });
    } catch (error) {
      next(error);
    }
  }

  async getProductsForAdmin(req, res, next) {
    try {
      const { page = 1, limit = 20, category, supplierId, isActive } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (category) where.category = category;
      if (supplierId) where.supplierId = supplierId;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const { rows: products, count } = await Product.findAndCountAll({
        where,
        include: [{
          model: Supplier,
          attributes: ['companyName', 'tradingName']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        products,
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

  async updateProductStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, featured } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updates = {};
      if (isActive !== undefined) updates.isActive = isActive;
      if (featured !== undefined) updates.featured = featured;

      await product.update(updates);
      res.json({ message: 'Product status updated successfully', product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req, res, next) {
    try {
      const stats = {
        users: {
          total: await User.count(),
          active: await User.count({ where: { isActive: true } }),
          byRole: await User.findAll({
            attributes: [
              'role',
              [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['role']
          })
        },
        suppliers: {
          total: await Supplier.count(),
          verified: await Supplier.count({ where: { verified: true } }),
          pending: await Supplier.count({ where: { verified: false } })
        },
        products: {
          total: await Product.count(),
          active: await Product.count({ where: { isActive: true } }),
          featured: await Product.count({ where: { featured: true } })
        },
        orders: {
          total: await Order.count(),
          pending: await Order.count({ where: { status: 'pending' } }),
          completed: await Order.count({ where: { status: 'completed' } })
        }
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
