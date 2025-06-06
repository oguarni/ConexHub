const { sequelize } = require('../src/models');
const { seedData } = require('../seed');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Wait for database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    
    // Check if database is empty
    const { User } = require('../src/models');
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('📦 Database is empty, running seed...');
      await seedData();
    } else {
      console.log('📊 Database already has data');
    }
    
    console.log('🚀 Database ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();