import express from 'express';
import * as swaggerUi from 'swagger-ui-express'; // Corrected import for ES module compatibility
import productRoutes from './products.js';
import authRoutes from './auth.js';
import orderRoutes from './orders.js';
import pixRoutes from './pix.js';
import seedRoutes from './seed.js';
import swaggerSpec from '../docs/swagger.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// API routes
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/pix', pixRoutes);

// Seed route (for development/testing)
if (process.env.NODE_ENV !== 'production') {
  router.use('/seed', seedRoutes);
}

// Swagger API documentation
// The swaggerUi object now has serve and setup properties that can be accessed directly.
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;