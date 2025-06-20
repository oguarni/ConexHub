const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput, authValidation, cpfValidation } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const config = require('../config/environment');

const router = express.Router();

// Register
router.post('/register', [
  sanitizeInput,
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter ao menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  body('cpf')
    .optional()
    .custom((value) => {
      if (value && !require('../middleware/validation').validateCPF(value)) {
        throw new Error('CPF inválido');
      }
      return true;
    }),
  body('address').optional().isString().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { name, email, password, cpf, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Usuário já existe', 409, 'USER_ALREADY_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Set admin role for specific email
  const role = email === 'admin@b2bmarketplace.com' ? 'admin' : 'user';

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    cpf,
    address,
    role
  });

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.security.jwt.secret,
    { expiresIn: config.security.jwt.expiresIn }
  );

  res.status(201).json({
    success: true,
    message: 'Usuário criado com sucesso',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Login
router.post('/login', [
  sanitizeInput,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.security.jwt.secret,
    { expiresIn: config.security.jwt.expiresIn }
  );

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Get profile
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId, {
    attributes: ['id', 'name', 'email', 'cpf', 'address', 'role']
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }

  res.json({ 
    success: true,
    user 
  });
}));

module.exports = router;