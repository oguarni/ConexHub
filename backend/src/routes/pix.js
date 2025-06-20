import express from 'express';
import { body } from 'express-validator';
import { authenticate as auth } from '../middleware/auth.js';
import PixController from '../controllers/pixController.js';

const router = express.Router();

// Validation middleware for PIX payment creation
const pixPaymentValidation = [
  body('pixKey')
    .notEmpty()
    .withMessage('PIX key is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('PIX key must be between 1 and 100 characters'),
  
  body('pixKeyType')
    .isIn(['email', 'phone', 'cpf', 'cnpj', 'random'])
    .withMessage('PIX key type must be one of: email, phone, cpf, cnpj, random'),
  
  body('receiverName')
    .notEmpty()
    .withMessage('Receiver name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Receiver name must be between 2 and 100 characters'),
  
  body('receiverDocument')
    .notEmpty()
    .withMessage('Receiver document is required')
    .matches(/^\d{11}$|^\d{14}$/)
    .withMessage('Receiver document must be a valid CPF (11 digits) or CNPJ (14 digits)'),
  
  body('expirationMinutes')
    .optional()
    .isInt({ min: 5, max: 1440 })
    .withMessage('Expiration must be between 5 and 1440 minutes (24 hours)')
];

// Create PIX payment for quote
router.post('/quotes/:quoteId/payment', 
  auth, 
  pixPaymentValidation,
  PixController.createPixPaymentForQuote
);

// Create PIX payment for order
router.post('/orders/:orderId/payment', 
  auth, 
  pixPaymentValidation,
  PixController.createPixPaymentForOrder
);

// Get PIX payment details
router.get('/payments/:pixPaymentId', 
  auth, 
  PixController.getPixPayment
);

// Update PIX payment status (webhook simulation)
router.patch('/payments/:pixPaymentId/status', 
  auth, 
  [
    body('status')
      .isIn(['pending', 'paid', 'cancelled', 'expired', 'refunded'])
      .withMessage('Status must be one of: pending, paid, cancelled, expired, refunded'),
    
    body('endToEndId')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('End-to-end ID must be between 1 and 50 characters')
  ],
  PixController.updatePixPaymentStatus
);

// Get user's PIX payments
router.get('/payments', 
  auth, 
  PixController.getUserPixPayments
);

// Validate PIX key
router.post('/validate-key', 
  auth,
  [
    body('pixKey').notEmpty().withMessage('PIX key is required'),
    body('pixKeyType').isIn(['email', 'phone', 'cpf', 'cnpj', 'random']).withMessage('Invalid PIX key type')
  ],
  PixController.validatePixKey
);

export default router;