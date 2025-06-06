const productController = require('./src/controllers/productController');

console.log('Available methods in productController:');
console.log(Object.keys(productController));

console.log('\nChecking specific methods:');
console.log('getAllProducts:', typeof productController.getAllProducts);
console.log('searchProducts:', typeof productController.searchProducts);
console.log('getProductById:', typeof productController.getProductById);
console.log('createProduct:', typeof productController.createProduct);
console.log('updateProduct:', typeof productController.updateProduct);
console.log('deleteProduct:', typeof productController.deleteProduct);
