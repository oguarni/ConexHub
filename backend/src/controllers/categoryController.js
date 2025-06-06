const { Category } = require('../models');
const { validationResult } = require('express-validator');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']]
      });

      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await Category.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await Category.findByPk(req.params.id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await category.update(req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const category = await Category.findByPk(req.params.id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await category.destroy();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
