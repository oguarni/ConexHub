console.log('Testing middleware...');
try {
  const { authenticate, isAdmin, isSupplier, isSupplierOrAdmin } = require('./src/middleware/auth');
  console.log('authenticate:', typeof authenticate);
  console.log('isAdmin:', typeof isAdmin);
  console.log('isSupplier:', typeof isSupplier);
  console.log('isSupplierOrAdmin:', typeof isSupplierOrAdmin);
} catch(e) {
  console.log('Auth middleware FAILED:', e.message);
}

try {
  const { body } = require('express-validator');
  console.log('body validator:', typeof body);
} catch(e) {
  console.log('Express-validator FAILED:', e.message);
}
