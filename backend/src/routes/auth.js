import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { handleValidationErrors, sanitizeInput, authValidation, cpfValidation } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import config from '../config/index.js';

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
    .custom(async (value) => {
      if (value) {
        const { validateCPF } = await import('../middleware/validation.js');
        if (!validateCPF(value)) {
          throw new Error('CPF inválido');
        }
      }
      return true;
    }),
  body('address').optional().isString().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { name, email, password, cpf, address, role: requestedRole } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Usuário já existe', 409, 'USER_ALREADY_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Set role: admin for specific email, requested role if valid, otherwise buyer as default
  let role = 'buyer'; // default role for B2B marketplace
  if (email === 'admin@b2bmarketplace.com') {
    role = 'admin';
  } else if (requestedRole && ['buyer', 'supplier'].includes(requestedRole)) {
    role = requestedRole;
  }

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
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
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
  console.log('Login attempt for:', email);

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log('User not found:', email);
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }
  console.log('User found, checking password...');

  // Check password
  console.log('Input password:', JSON.stringify(password));
  console.log('Stored hash:', user.password);
  const isValidPassword = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValidPassword);
  if (!isValidPassword) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
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

export default router;