const { AppError } = require('./errorHandler');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Acesso negado. Apenas administradores.', 403, 'ADMIN_ACCESS_REQUIRED'));
  }
  next();
};

module.exports = adminMiddleware;
