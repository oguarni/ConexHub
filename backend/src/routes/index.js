import express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import pixRoutes from './pix.js';
import seedRoutes from './seed.js';
import swaggerSpec from '../docs/swagger.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Existing routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/pix', pixRoutes);

// Seed route (for development/testing)
if (process.env.NODE_ENV !== 'production') {
  router.use('/seed', seedRoutes);
}

// Swagger API documentation
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;