console.log('Testing remaining controllers...');
try { 
  require('./src/controllers/quoteController'); 
  console.log('✓ quoteController OK'); 
} catch(e) { 
  console.log('✗ quoteController FAILED:', e.message); 
}

try { 
  require('./src/controllers/supplierController'); 
  console.log('✓ supplierController OK'); 
} catch(e) { 
  console.log('✗ supplierController FAILED:', e.message); 
}

try { 
  require('./src/controllers/categoryController'); 
  console.log('✓ categoryController OK'); 
} catch(e) { 
  console.log('✗ categoryController FAILED:', e.message); 
}

try { 
  require('./src/controllers/reviewController'); 
  console.log('✓ reviewController OK'); 
} catch(e) { 
  console.log('✗ reviewController FAILED:', e.message); 
}

try { 
  require('./src/controllers/analyticsController'); 
  console.log('✓ analyticsController OK'); 
} catch(e) { 
  console.log('✗ analyticsController FAILED:', e.message); 
}

try { 
  require('./src/controllers/adminController'); 
  console.log('✓ adminController OK'); 
} catch(e) { 
  console.log('✗ adminController FAILED:', e.message); 
}

try { 
  require('./src/controllers/seedController'); 
  console.log('✓ seedController OK'); 
} catch(e) { 
  console.log('✗ seedController FAILED:', e.message); 
}
