import config from '../config/environment.js';

/**
 * Classe para erros customizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware centralizado de tratamento de erros
 * Captura todos os erros da aplicação e retorna respostas padronizadas
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro (em produção, usar um logger apropriado)
  if (config.isDevelopment()) {
    console.error('Error Stack:', err.stack);
  } else {
    console.error('Error:', {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Dados de entrada inválidos',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'unknown';
    return res.status(409).json({
      success: false,
      status: 'fail',
      message: 'Recurso já existe',
      code: 'DUPLICATE_RESOURCE',
      details: { field, value: err.errors[0]?.value },
      timestamp: new Date().toISOString()
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Referência inválida',
      code: 'FOREIGN_KEY_CONSTRAINT',
      timestamp: new Date().toISOString()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Token inválido',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Token expirado',
      code: 'EXPIRED_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  // Cast errors (MongoDB ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Formato de ID inválido',
      code: 'INVALID_ID_FORMAT',
      timestamp: new Date().toISOString()
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Arquivo muito grande',
      code: 'FILE_TOO_LARGE',
      details: { maxSize: config.upload.maxFileSize },
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors customizados
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: err.message,
      code: 'VALIDATION_ERROR',
      details: err.details,
      timestamp: new Date().toISOString()
    });
  }

  // Erros de permissão
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      status: 'fail',
      message: 'Acesso negado',
      code: 'ACCESS_DENIED',
      timestamp: new Date().toISOString()
    });
  }

  // Erros de autenticação
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: err.message || 'Não autorizado',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    });
  }

  // Erros de recurso não encontrado
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: err.message || 'Recurso não encontrado',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  // Erros customizados da aplicação
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
      timestamp: new Date().toISOString()
    });
  }

  // Erro genérico/desconhecido
  const statusCode = err.statusCode || 500;
  const message = config.isProduction() 
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.isDevelopment() && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para capturar rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota ${req.originalUrl} não encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Wrapper para funções async que automaticamente chama next(error)
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};
