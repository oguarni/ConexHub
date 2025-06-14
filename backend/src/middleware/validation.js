const { body, query, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Product validation rules
const productValidation = {
  create: [
    body('name')
      .isString()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .isString()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('category')
      .isString()
      .notEmpty()
      .withMessage('Category is required'),
    body('unit')
      .optional()
      .isString()
      .isLength({ max: 20 })
      .withMessage('Unit must be a string with max 20 characters'),
    body('minimumQuantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum quantity must be a positive integer'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
    handleValidationErrors
  ],
  update: [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('category')
      .optional()
      .isString()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('unit')
      .optional()
      .isString()
      .isLength({ max: 20 })
      .withMessage('Unit must be a string with max 20 characters'),
    body('minimumQuantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum quantity must be a positive integer'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Each image must be a valid URL'),
    handleValidationErrors
  ],
  search: [
    query('q')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('category')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Category must be a string with max 50 characters'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a non-negative number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a non-negative number'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items array is required and must not be empty'),
    body('items.*.productId')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('items.*.price')
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required'),
    body('shippingAddress.street')
      .isString()
      .notEmpty()
      .withMessage('Street is required'),
    body('shippingAddress.city')
      .isString()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .isString()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.zipCode')
      .isString()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('ZIP code must be in format 12345-678 or 12345678'),
    body('paymentMethod')
      .isIn(['credit_card', 'bank_transfer', 'pix'])
      .withMessage('Payment method must be credit_card, bank_transfer, or pix'),
    handleValidationErrors
  ]
};

// Auth validation rules
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('companyName')
      .isString()
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('cnpj')
      .optional()
      .isString()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      .withMessage('CNPJ must be in format XX.XXX.XXX/XXXX-XX'),
    body('phone')
      .optional()
      .isString()
      .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .withMessage('Phone must be in format (XX) XXXXX-XXXX'),
    handleValidationErrors
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ]
};

// Common parameter validations
const paramValidation = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  productValidation,
  orderValidation,
  authValidation,
  paramValidation
};