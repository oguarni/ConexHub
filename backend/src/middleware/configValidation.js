import config from '../config/index.js';

const validateConfig = (req, res, next) => {
  if (!config.app?.env || !config.app?.port || !config.security?.jwt?.secret) {
    console.error('FATAL ERROR: Missing critical configuration.');
    return res.status(500).json({
      message: 'Server configuration error. Please contact an administrator.',
    });
  }
  next();
};

export default validateConfig;