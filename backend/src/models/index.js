import { Sequelize } from 'sequelize';
import config from '../config/index.js';

// Import model definitions
import UserModel from './User.js';
import ProductModel from './Product.js';
import SupplierModel from './Supplier.js';
import CategoryModel from './Category.js';
import OrderModel from './Order.js';
import OrderItemModel from './OrderItem.js';
import QuoteModel from './Quote.js';
import ReviewModel from './Review.js';
import PixPaymentModel from './PixPayment.js';

// Create Sequelize instance with proper configuration
const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: config.DATABASE_URL.includes('sqlite') ? 'sqlite' : 'postgres',
  storage: config.DATABASE_URL.includes('sqlite') ? './test.db' : undefined,
  logging: config.isDevelopment() ? console.log : false,
  pool: {
    max: config.DB_POOL_MAX || 5,
    min: config.DB_POOL_MIN || 0,
    acquire: config.DB_POOL_ACQUIRE || 30000,
    idle: config.DB_POOL_IDLE || 10000
  },
  dialectOptions: config.isProduction() ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

// Initialize models
const models = {
  User: UserModel(sequelize, Sequelize.DataTypes),
  Product: ProductModel(sequelize, Sequelize.DataTypes),
  Supplier: SupplierModel(sequelize, Sequelize.DataTypes),
  Category: CategoryModel(sequelize, Sequelize.DataTypes),
  Order: OrderModel(sequelize, Sequelize.DataTypes),
  OrderItem: OrderItemModel(sequelize, Sequelize.DataTypes),
  Quote: QuoteModel(sequelize, Sequelize.DataTypes),
  Review: ReviewModel(sequelize, Sequelize.DataTypes),
  PixPayment: PixPaymentModel(sequelize, Sequelize.DataTypes),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export const { User, Product, Supplier, Category, Order, OrderItem, Quote, Review, PixPayment } = models;
export default { sequelize, ...models };
