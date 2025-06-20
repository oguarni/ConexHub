import productService from '../services/productService.js';

const getAllProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      featured: req.query.featured,
      inStock: req.query.inStock
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const sorting = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await productService.getProducts(filters, pagination, sorting);
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const filters = {
      q: req.query.q,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      supplierId: req.query.supplierId
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    const sorting = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await productService.getProducts(filters, pagination, sorting);
    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Error searching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

const createProduct = async (req, res) => {
  try {
    let supplierId = req.user.Supplier?.id;
    
    // Se for admin e não tiver supplier, pegar o primeiro supplier disponível
    if (req.user.role === 'admin' && !supplierId) {
      const { Supplier } = await import('../models/index.js');
      const firstSupplier = await Supplier.findOne();
      supplierId = firstSupplier?.id;
    }

    const product = await productService.createProduct(req.body, supplierId);
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const success = await productService.deleteProduct(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

export {
  getAllProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};