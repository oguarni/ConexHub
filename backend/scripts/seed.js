require('dotenv').config();
const { sequelize, User, Category, Supplier, Product } = require('../src/models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@b2bmarketplace.com',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Machinery', slug: 'machinery' },
      { name: 'Raw Materials', slug: 'raw-materials' },
      { name: 'Components', slug: 'components' }
    ]);
    
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
