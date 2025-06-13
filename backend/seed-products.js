const { Product, Category, Supplier, User } = require('./src/models');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample products...');

    // Create test users first
    const bcrypt = require('bcryptjs');
    
    const supplierPassword = await bcrypt.hash('demo123', 10);
    
    // Check if users already exist
    let supplierUser = await User.findOne({ where: { email: 'supplier@demo.com' } });
    if (!supplierUser) {
      supplierUser = await User.create({
        name: 'Industrial Tools Ltda',
        email: 'supplier@demo.com',
        password: supplierPassword,
        role: 'supplier',
        companyName: 'Industrial Tools Ltda',
        phone: '(11) 99999-5678',
        address: 'Av. das Indústrias, 456'
      });
    }

    // Check if supplier profile exists
    let supplier = await Supplier.findOne({ where: { userId: supplierUser.id } });
    if (!supplier) {
      supplier = await Supplier.create({
        userId: supplierUser.id,
        companyName: 'Industrial Tools Ltda',
        cnpj: '98765432000199'
      });
    }

    // Create categories first
    const categories = [];
    
    const categoryData = [
      { name: 'Tools', slug: 'tools', description: 'Industrial tools and equipment' },
      { name: 'Raw Materials', slug: 'raw-materials', description: 'Construction materials' },
      { name: 'Components', slug: 'components', description: 'Electronic and mechanical components' },
      { name: 'Machinery', slug: 'machinery', description: 'Heavy industrial machinery' },
      { name: 'Equipment', slug: 'equipment', description: 'Industrial equipment' }
    ];

    for (const catData of categoryData) {
      let category = await Category.findOne({ where: { slug: catData.slug } });
      if (!category) {
        category = await Category.create(catData);
      }
      categories.push(category);
    }

    // Create products with correct field names from model
    const products = [
      {
        name: 'Furadeira Industrial HD-2000',
        description: 'Furadeira de alta precisão para uso industrial, com motor de 2000W',
        price: 1299.99,
        category: 'Tools',
        unit: 'un',
        image: '🔧',
        minOrder: 1,
        stock: 50,
        supplierId: supplier.id
      },
      {
        name: 'Chapa de Aço Inox 304',
        description: 'Chapa de aço inoxidável 304, espessura 2mm, ideal para equipamentos alimentícios',
        price: 89.50,
        category: 'Raw Materials',
        unit: 'm²',
        image: '⚒️',
        minOrder: 10,
        stock: 200,
        supplierId: supplier.id
      },
      {
        name: 'Motor Elétrico Trifásico 5CV',
        description: 'Motor elétrico trifásico de 5CV, 220/380V, para uso industrial',
        price: 2450.00,
        category: 'Components',
        unit: 'un',
        image: '⚡',
        minOrder: 1,
        stock: 25,
        supplierId: supplier.id
      },
      {
        name: 'Válvula Pneumática 1/2"',
        description: 'Válvula pneumática de 1/2 polegada, pressão máxima 10 bar',
        price: 156.75,
        category: 'Components',
        unit: 'un',
        image: '🔧',
        minOrder: 5,
        stock: 100,
        supplierId: supplier.id
      },
      {
        name: 'Torno CNC Compacto',
        description: 'Torno CNC compacto para pequenas peças de precisão',
        price: 45000.00,
        category: 'Machinery',
        unit: 'un',
        image: '🏭',
        minOrder: 1,
        stock: 3,
        supplierId: supplier.id
      },
      {
        name: 'Compressor de Ar 50L',
        description: 'Compressor de ar de 50 litros, 2HP, ideal para oficinas',
        price: 1850.00,
        category: 'Equipment',
        unit: 'un',
        image: '💨',
        minOrder: 1,
        stock: 15,
        supplierId: supplier.id
      }
    ];

    // Create products one by one to handle any errors
    for (const productData of products) {
      try {
        const existingProduct = await Product.findOne({ where: { name: productData.name } });
        if (!existingProduct) {
          await Product.create(productData);
          console.log(`✅ Created: ${productData.name}`);
        } else {
          console.log(`⏭️ Already exists: ${productData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${productData.name}:`, error.message);
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('📊 Data created:');
    console.log(`   • ${categories.length} categories`);
    console.log(`   • ${products.length} products`);
    console.log('');
    console.log('🔑 Test credentials:');
    console.log('   supplier@demo.com / demo123');

  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};

module.exports = { seedData };

// Execute seed if called directly
if (require.main === module) {
  const { sequelize } = require('./src/models');
  
  const runSeed = async () => {
    try {
      await sequelize.sync({ force: false });
      await seedData();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  };
  
  runSeed();
}