import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import {
  requestQuote,
  getSupplierQuotes,
  submitQuote,
  getBuyerQuotes,
  acceptQuote,
  rejectQuote,
  getQuote,
  convertQuoteToOrder
} from '../controllers/quoteController.js';

const router = express.Router();

// Apply authentication middleware to all quote routes
router.use(authMiddleware);

// --- Buyer-Specific Routes ---
// Role-based authorization is handled for each endpoint

// POST: Request a new quote from suppliers
router.post('/request', requirePermission('quotes:write'), requestQuote);

// GET: Retrieve all quotes for the authenticated buyer
router.get('/buyer', requirePermission('quotes:read_own'), getBuyerQuotes);

// GET: Retrieve a single quote by its ID (MUST come AFTER specific text routes)
router.get('/:quoteId', requirePermission('quotes:read_own'), getQuote);

// POST: Accept a specific quote
router.post('/:quoteId/accept', requirePermission('quotes:accept'), acceptQuote);

// POST: Reject a specific quote
router.post('/:quoteId/reject', requirePermission('quotes:reject'), rejectQuote);

// POST: Convert accepted quote to order
router.post('/:quoteId/create-order', requirePermission('orders:write'), convertQuoteToOrder);

// --- Supplier-Specific Routes ---
// Role-based authorization is handled for each endpoint

// GET: Retrieve all quote requests for the authenticated supplier
router.get('/supplier', requirePermission('quotes:read_own'), getSupplierQuotes);

// POST: Submit a price and details for a specific quote request
router.post('/:quoteId/submit', requirePermission('quotes:respond'), submitQuote);

export default router;