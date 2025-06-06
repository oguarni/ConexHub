const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/b2b_marketplace',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const models = {
  User: require('./User')(sequelize, Sequelize.DataTypes),
  Product: require('./Product')(sequelize, Sequelize.DataTypes),
  Supplier: require('./Supplier')(sequelize, Sequelize.DataTypes),
  Category: require('./Category')(sequelize, Sequelize.DataTypes),
  Order: require('./Order')(sequelize, Sequelize.DataTypes),
  OrderItem: require('./OrderItem')(sequelize, Sequelize.DataTypes),
  Quote: require('./Quote')(sequelize, Sequelize.DataTypes),
  Review: require('./Review')(sequelize, Sequelize.DataTypes),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
