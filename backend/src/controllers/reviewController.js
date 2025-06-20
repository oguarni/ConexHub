import { Review, User, Order, Supplier, OrderItem, Product } from '../models/index.js';
import { validationResult } from 'express-validator';

class ReviewController {
  async createReview(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, supplierId, rating, comment } = req.body;

      // Check if order belongs to user
      const order = await Order.findOne({
        where: { id: orderId, userId: req.user.id }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        where: { orderId, userId: req.user.id }
      });

      if (existingReview) {
        return res.status(409).json({ error: 'Review already exists for this order' });
      }

      const review = await Review.create({
        orderId,
        userId: req.user.id,
        supplierId,
        rating,
        comment
      });

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      
      const reviews = await Review.findAll({
        include: [
          {
            model: User,
            attributes: ['name', 'companyName']
          },
          {
            model: Order,
            include: [{
              model: OrderItem,
              where: { productId },
              include: [Product]
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const review = await Review.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      await review.update(req.body);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const review = await Review.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      await review.destroy();
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
