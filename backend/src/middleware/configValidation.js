import config from '../config/index.js';

const validateConfig = (req, res, next) => {
  // Skip validation in Docker environment where config is provided via environment variables
  console.log('Environment check:', {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NODE_ENV: !!process.env.NODE_ENV
  });
  
  if (process.env.DATABASE_URL && process.env.JWT_SECRET && process.env.NODE_ENV) {
    console.log('Skipping config validation - Docker environment detected');
    return next();
  }
  
  console.log('Config check:', {
    NODE_ENV: !!config.NODE_ENV,
    PORT: !!config.PORT,
    JWT_SECRET: !!config.JWT_SECRET
  });
  
  if (!config.NODE_ENV || !config.PORT || !config.JWT_SECRET) {
    console.error('FATAL ERROR: Missing critical configuration.');
    return res.status(500).json({
      message: 'Server configuration error. Please contact an administrator.',
    });
  }
  next();
};

export default validateConfig;