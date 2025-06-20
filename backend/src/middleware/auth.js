import jwt from 'jsonwebtoken';
import { User, Supplier } from '../models/index.js';
import { AppError } from './errorHandler.js';
import config from '../config/environment.js';

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AppError('Token de acesso requerido', 401, 'MISSING_TOKEN');
    }

    const decoded = jwt.verify(token, config.security.jwt.secret);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Supplier, required: false }]
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 401, 'USER_NOT_FOUND');
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401, 'INVALID_TOKEN'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401, 'EXPIRED_TOKEN'));
    }
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Acesso de administrador requerido', 403, 'ADMIN_ACCESS_REQUIRED'));
  }
  next();
};

const isSupplier = (req, res, next) => {
  if (!req.user.Supplier && req.user.role !== 'admin') {
    return next(new AppError('Acesso de fornecedor requerido', 403, 'SUPPLIER_ACCESS_REQUIRED'));
  }
  next();
};

const isSupplierOrAdmin = (req, res, next) => {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    return next(new AppError('Permissões insuficientes', 403, 'INSUFFICIENT_PERMISSIONS'));
  }
  next();
};

export {
  authenticate,
  isAdmin,
  isSupplier,
  isSupplierOrAdmin
};

export default authenticate;