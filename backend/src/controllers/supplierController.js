import { Supplier, Product, Review, Quote, Order, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

const getSuppliers = async (req, res) => {
  try {
    const { verified, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (verified === 'true') {
      where.verified = true;
    }

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { tradingName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: suppliers, count } = await Supplier.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['name', 'email'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['totalOrders', 'DESC']]
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
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Error fetching suppliers' });
  }
};

const getSupplierProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone', 'address']
        },
        {
          model: Product,
          where: { isActive: true },
          required: false,
          limit: 10
        }
      ]
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier profile:', error);
    res.status(500).json({ error: 'Error fetching supplier profile' });
  }
};

const getSupplierProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: products, count } = await Product.findAndCountAll({
      where: {
        supplierId: id,
        isActive: true
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['featured', 'DESC'], ['createdAt', 'DESC']]
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
    res.status(500).json({ error: 'Error fetching supplier products' });
  }
};

const getSupplierReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: reviews, count } = await Review.findAndCountAll({
      where: { supplierId: id },
      include: [{
        model: User,
        attributes: ['name', 'companyName']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching supplier reviews' });
  }
};

const updateSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      where: { userId: req.user.id }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier profile not found' });
    }

    const { tradingName, description, logo } = req.body;

    await supplier.update({
      tradingName,
      description,
      logo
    });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error updating supplier profile' });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    
    const supplier = await Supplier.findOne({
      where: { userId: req.user.id }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier profile not found' });
    }

    const planDurations = {
      basic: 30,
      pro: 30
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planDurations[plan]);

    await supplier.update({
      subscriptionPlan: plan,
      subscriptionExpiresAt: expiresAt
    });

    res.json({
      message: 'Subscription updated successfully',
      supplier
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating subscription' });
  }
};

export {
  getSuppliers,
  getSupplierProfile,
  getSupplierProducts,
  getSupplierReviews,
  updateSupplierProfile,
  updateSubscription
};