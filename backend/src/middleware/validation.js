const { body, query, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: formattedErrors,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Sanitização de dados de entrada
const sanitizeInput = (req, res, next) => {
  // Sanitiza strings no body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitiza strings nos query parameters
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// Validador customizado para CEP brasileiro
const validateCEP = (value) => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(value);
};

// Validador customizado para CPF brasileiro
const validateCPF = (value) => {
  const cpf = value.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Validador customizado para CNPJ brasileiro
const validateCNPJ = (value) => {
  const cnpj = value.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
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
      .custom((value) => {
        if (!validateCEP(value)) {
          throw new Error('CEP deve estar no formato 12345-678 ou 12345678');
        }
        return true;
      }),
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
      .custom((value) => {
        if (value && !validateCNPJ(value)) {
          throw new Error('CNPJ inválido');
        }
        return true;
      }),
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

// Validação para CPF
const cpfValidation = [
  body('cpf')
    .optional()
    .isString()
    .custom((value) => {
      if (value && !validateCPF(value)) {
        throw new Error('CPF inválido');
      }
      return true;
    }),
  handleValidationErrors
];

// Validação para CEP
const cepValidation = [
  body('cep')
    .isString()
    .notEmpty()
    .withMessage('CEP é obrigatório')
    .custom((value) => {
      if (!validateCEP(value)) {
        throw new Error('CEP deve estar no formato 12345-678 ou 12345678');
      }
      return true;
    }),
  handleValidationErrors
];

// Validação para paginação
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser um número entre 1 e 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateCEP,
  validateCPF,
  validateCNPJ,
  productValidation,
  orderValidation,
  authValidation,
  paramValidation,
  cpfValidation,
  cepValidation,
  paginationValidation
};