import express from 'express';
import recommendationController from '../controllers/recommendationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/trending', recommendationController.getTrendingProducts);
router.get('/new', recommendationController.getNewProducts);
router.get('/homepage', recommendationController.getHomepageRecommendations);
router.get('/related/:productId', recommendationController.getRelatedProducts);

// Protected routes
router.get('/personalized', auth, recommendationController.getPersonalizedRecommendations);
router.post('/track-interaction', auth, recommendationController.trackInteraction);

export default router;