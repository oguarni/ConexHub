import { Product, Order, OrderItem, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class RecommendationService {
  async getRecommendationsForUser(userId, limit = 10) {
    try {
      const recommendations = await Promise.all([
        this.getCollaborativeRecommendations(userId, limit / 2),
        this.getContentBasedRecommendations(userId, limit / 2),
        this.getPopularProducts(limit / 3),
        this.getCategoryBasedRecommendations(userId, limit / 3)
      ]);

      const allRecommendations = [
        ...recommendations[0],
        ...recommendations[1],
        ...recommendations[2],
        ...recommendations[3]
      ];

      const uniqueRecommendations = this.removeDuplicates(allRecommendations);
      return this.scoreAndSort(uniqueRecommendations).slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      const userOrders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });

      if (userOrders.length === 0) return [];

      const userProductIds = userOrders.flatMap(order => 
        order.OrderItems.map(item => item.productId)
      );

      const similarUsers = await Order.findAll({
        where: {
          userId: { [Op.not]: userId }
        },
        include: [{
          model: OrderItem,
          where: {
            productId: { [Op.in]: userProductIds }
          },
          include: [Product]
        }],
        group: ['Order.userId'],
        having: sequelize.where(
          sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('OrderItems.productId'))), 
          Op.gte, 
          2
        )
      });

      const recommendedProducts = [];
      for (const order of similarUsers) {
        for (const item of order.OrderItems) {
          if (!userProductIds.includes(item.productId)) {
            recommendedProducts.push({
              ...item.Product.toJSON(),
              score: 0.8,
              reason: 'Usuarios similares também compraram'
            });
          }
        }
      }

      return recommendedProducts.slice(0, limit);
    } catch (error) {
      console.error('Error in collaborative filtering:', error);
      return [];
    }
  }

  async getContentBasedRecommendations(userId, limit = 5) {
    try {
      const userOrders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });

      if (userOrders.length === 0) return [];

      const userCategories = [...new Set(
        userOrders.flatMap(order => 
          order.OrderItems.map(item => item.Product.category)
        )
      )];

      const userProductIds = userOrders.flatMap(order => 
        order.OrderItems.map(item => item.productId)
      );

      const similarProducts = await Product.findAll({
        where: {
          category: { [Op.in]: userCategories },
          id: { [Op.notIn]: userProductIds },
          isActive: true
        },
        limit: limit * 2
      });

      return similarProducts.map(product => ({
        ...product.toJSON(),
        score: 0.7,
        reason: `Baseado no seu interesse em ${product.category}`
      })).slice(0, limit);
    } catch (error) {
      console.error('Error in content-based filtering:', error);
      return [];
    }
  }

  async getPopularProducts(limit = 3) {
    try {
      const popularProducts = await Product.findAll({
        attributes: [
          'id', 'name', 'category', 'price', 'description', 'image', 'unit',
          [sequelize.fn('COUNT', sequelize.col('OrderItems.id')), 'orderCount']
        ],
        include: [{
          model: OrderItem,
          attributes: [],
          required: true
        }],
        where: { isActive: true },
        group: ['Product.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('OrderItems.id')), 'DESC']],
        limit
      });

      return popularProducts.map(product => ({
        ...product.toJSON(),
        score: 0.6,
        reason: 'Produto popular entre compradores'
      }));
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  async getCategoryBasedRecommendations(userId, limit = 3) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.companyType) return [];

      const industryProducts = await Product.findAll({
        where: {
          category: this.getCategoriesForIndustry(user.companyType),
          isActive: true
        },
        order: [['createdAt', 'DESC']],
        limit
      });

      return industryProducts.map(product => ({
        ...product.toJSON(),
        score: 0.5,
        reason: `Recomendado para empresas de ${user.companyType}`
      }));
    } catch (error) {
      console.error('Error in category-based recommendations:', error);
      return [];
    }
  }

  async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) return [];

      const relatedProducts = await Product.findAll({
        where: {
          category: product.category,
          id: { [Op.not]: productId },
          isActive: true
        },
        order: [['createdAt', 'DESC']],
        limit
      });

      const alsoBoughtProducts = await this.getAlsoBoughtProducts(productId, limit / 2);

      return [
        ...alsoBoughtProducts,
        ...relatedProducts.slice(0, Math.max(1, limit - alsoBoughtProducts.length))
      ];
    } catch (error) {
      console.error('Error getting related products:', error);
      return [];
    }
  }

  async getAlsoBoughtProducts(productId, limit = 3) {
    try {
      const orders = await Order.findAll({
        include: [{
          model: OrderItem,
          where: { productId },
          required: true
        }]
      });

      const orderIds = orders.map(order => order.id);

      const alsoBoughtProducts = await OrderItem.findAll({
        where: {
          orderId: { [Op.in]: orderIds },
          productId: { [Op.not]: productId }
        },
        include: [Product],
        group: ['productId', 'Product.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'DESC']],
        limit
      });

      return alsoBoughtProducts.map(item => ({
        ...item.Product.toJSON(),
        score: 0.9,
        reason: 'Frequentemente comprado junto'
      }));
    } catch (error) {
      console.error('Error getting also bought products:', error);
      return [];
    }
  }

  async getTrendingProducts(limit = 10) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const trendingProducts = await Product.findAll({
        attributes: [
          'id', 'name', 'category', 'price', 'description', 'image', 'unit',
          [sequelize.fn('COUNT', sequelize.col('OrderItems.id')), 'recentOrders']
        ],
        include: [{
          model: OrderItem,
          attributes: [],
          required: true,
          include: [{
            model: Order,
            attributes: [],
            where: {
              createdAt: { [Op.gte]: oneWeekAgo }
            }
          }]
        }],
        where: { isActive: true },
        group: ['Product.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('OrderItems.id')), 'DESC']],
        limit
      });

      return trendingProducts.map(product => ({
        ...product.toJSON(),
        score: 0.8,
        reason: 'Produto em alta esta semana'
      }));
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  async getNewProducts(limit = 10) {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const newProducts = await Product.findAll({
        where: {
          isActive: true,
          createdAt: { [Op.gte]: oneMonthAgo }
        },
        order: [['createdAt', 'DESC']],
        limit
      });

      return newProducts.map(product => ({
        ...product.toJSON(),
        score: 0.4,
        reason: 'Produto recém-adicionado'
      }));
    } catch (error) {
      console.error('Error getting new products:', error);
      return [];
    }
  }

  getCategoriesForIndustry(industryType) {
    const industryMap = {
      'Construção': ['Materiais', 'Ferramentas', 'Maquinário'],
      'Manufactura': ['Maquinário', 'Equipamentos', 'Materiais'],
      'Agricultura': ['Equipamentos', 'Ferramentas', 'Maquinário'],
      'Tecnologia': ['Equipamentos', 'Materiais']
    };

    return industryMap[industryType] || ['Materiais', 'Equipamentos'];
  }

  removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }

  scoreAndSort(products) {
    return products.sort((a, b) => b.score - a.score);
  }

  async getFallbackRecommendations(limit = 10) {
    try {
      const fallbackProducts = await Product.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit
      });

      return fallbackProducts.map(product => ({
        ...product.toJSON(),
        score: 0.3,
        reason: 'Recomendação geral'
      }));
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }

  async updateUserPreferences(userId, productId, action) {
    try {
      // Track user interactions for better recommendations
      // This could be expanded to include view history, search history, etc.
      console.log(`User ${userId} performed ${action} on product ${productId}`);
      // Implementation would depend on having a user preferences table
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }
}

export default new RecommendationService();