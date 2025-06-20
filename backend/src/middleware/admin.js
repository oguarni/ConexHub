import { User } from '../models/index.js';

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (user && user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authorization.' });
  }
};

export default isAdmin;
