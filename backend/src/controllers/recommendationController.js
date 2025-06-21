import recommendationService from '../services/recommendationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class RecommendationController {
  getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const recommendations = await recommendationService.getRecommendationsForUser(
      userId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      recommendations
    });
  });

  getRelatedProducts = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    const relatedProducts = await recommendationService.getRelatedProducts(
      productId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      relatedProducts
    });
  });

  getTrendingProducts = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const trendingProducts = await recommendationService.getTrendingProducts(
      parseInt(limit)
    );

    res.json({
      success: true,
      trendingProducts
    });
  });

  getNewProducts = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const newProducts = await recommendationService.getNewProducts(
      parseInt(limit)
    );

    res.json({
      success: true,
      newProducts
    });
  });

  trackInteraction = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId, action } = req.body;

    await recommendationService.updateUserPreferences(userId, productId, action);

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  });

  getHomepageRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    if (userId) {
      // Personalized recommendations for logged-in users
      const personalizedRecommendations = await recommendationService.getRecommendationsForUser(
        userId, 
        Math.floor(limit * 0.6)
      );
      
      const trendingProducts = await recommendationService.getTrendingProducts(
        Math.floor(limit * 0.3)
      );
      
      const newProducts = await recommendationService.getNewProducts(
        Math.floor(limit * 0.1)
      );

      res.json({
        success: true,
        sections: {
          personalized: personalizedRecommendations,
          trending: trendingProducts,
          new: newProducts
        }
      });
    } else {
      // General recommendations for anonymous users
      const trendingProducts = await recommendationService.getTrendingProducts(
        Math.floor(limit * 0.7)
      );
      
      const newProducts = await recommendationService.getNewProducts(
        Math.floor(limit * 0.3)
      );

      res.json({
        success: true,
        sections: {
          trending: trendingProducts,
          new: newProducts
        }
      });
    }
  });
}

export default new RecommendationController();