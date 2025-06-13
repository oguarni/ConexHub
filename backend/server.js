const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
