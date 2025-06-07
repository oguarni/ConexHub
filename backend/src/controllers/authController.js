const { User, Supplier } = require('../models');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, cpf, role, companyName, cnpj } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        cpf,
        role: role || 'buyer',
        companyName,
        cnpj
      });

      // If supplier, create supplier profile
      if (role === 'supplier' && cnpj) {
        await Supplier.create({
          userId: user.id,
          companyName,
          cnpj
        });
      }

      // Generate token
      const token = this.generateToken(user);

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json({
        user: userResponse,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user with supplier data if applicable
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Supplier,
          required: false
        }]
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account deactivated' });
      }

      // FIXED: Use this.generateToken instead of authController.generateToken
      const token = this.generateToken(user);

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Supplier,
          required: false
        }]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, phone, address, companyName } = req.body;
      
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({
        name,
        phone,
        address,
        companyName
      });

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, // Change id to userId
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

const authController = new AuthController();
module.exports = authController;  // Export the instance, not the class