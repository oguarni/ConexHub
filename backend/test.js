console.log('Testing controllers...');
try { 
  require('./src/controllers/authController'); 
  console.log('✓ authController OK'); 
} catch(e) { 
  console.log('✗ authController FAILED:', e.message); 
}

try { 
  require('./src/controllers/productController'); 
  console.log('✓ productController OK'); 
} catch(e) { 
  console.log('✗ productController FAILED:', e.message); 
}

try { 
  require('./src/controllers/orderController'); 
  console.log('✓ orderController OK'); 
} catch(e) { 
  console.log('✗ orderController FAILED:', e.message); 
}
