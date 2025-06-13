const { Product, Category, Supplier, User } = require('./src/models');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar categorias
    const categories = await Category.bulkCreate([
      {
        name: 'Equipment',
        slug: 'equipment',
        description: 'Industrial machinery and equipment'
      },
      {
        name: 'Tools',
        slug: 'tools',
        description: 'Manual and electric tools'
      },
      {
        name: 'Raw Materials',
        slug: 'raw-materials',
        description: 'Construction and industrial materials'
      },
      {
        name: 'Components',
        slug: 'components',
        description: 'Electronic and mechanical components'
      },
      {
        name: 'Machinery',
        slug: 'machinery',
        description: 'Heavy industrial machinery'
      }
    ]);

    // Criar usuários de teste primeiro
    const bcrypt = require('bcrypt');
    
    // Hash das senhas específicas para cada usuário
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    const supplierPassword = await bcrypt.hash('supplier123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Usuário Comprador
    const buyerUser = await User.create({
      name: 'João Silva',
      email: 'joao@empresa.com',
      password: buyerPassword,
      cpf: '12345678901',
      cnpj: '12345678000123',
      role: 'buyer'
    });

    // Usuário Fornecedor  
    const supplierUser = await User.create({
      name: 'Carlos Santos',
      email: 'carlos@fornecedor.com',
      password: supplierPassword,
      cpf: '98765432100',
      cnpj: '98765432000199',
      role: 'supplier'
    });

    // Usuário Administrador
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@b2bmarketplace.com',
      password: adminPassword,
      cpf: '11111111111',
      cnpj: '11111111000111',
      role: 'admin'
    });

    // Criar fornecedores relacionados aos usuários
    const suppliers = [];

    // Supplier para Carlos
    const carlosSupplier = await Supplier.create({
      userId: supplierUser.id,
      companyName: 'Carlos Santos - Fornecedor',
      cnpj: '98765432000199'
    });
    suppliers.push(carlosSupplier);

    // Fornecedores adicionais para produtos
    const techUser = await User.create({
      name: 'TechSupply Ltda',
      email: 'contato@techsupply.com.br',
      password: supplierPassword,
      cpf: '12312312312',
      cnpj: '12312312000112',
      role: 'supplier'
    });

    const techSupplier = await Supplier.create({
      userId: techUser.id,
      companyName: 'TechSupply Ltda',
      cnpj: '12312312000112'
    });
    suppliers.push(techSupplier);

    const industrialUser = await User.create({
      name: 'Industrial Solutions',
      email: 'vendas@industrialsolutions.com.br',
      password: supplierPassword,
      cpf: '45645645645',
      cnpj: '45645645000145',
      role: 'supplier'
    });

    const industrialSupplier = await Supplier.create({
      userId: industrialUser.id,
      companyName: 'Industrial Solutions',
      cnpj: '45645645000145'
    });
    suppliers.push(industrialSupplier);

    // Criar produtos
    await Product.bulkCreate([
      {
        name: 'Industrial Drill 1200W',
        description: 'High-power industrial drill with variable speed control',
        price: 450.00,
        stock_quantity: 15,
        category_id: categories[1].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Air Compressor 50L',
        description: '2HP compressed air compressor with 50-liter tank',
        price: 1200.00,
        stock_quantity: 8,
        category_id: categories[0].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Portland Cement 50kg',
        description: 'Portland cement CP-II-E-32 bag of 50kg',
        price: 35.00,
        stock_quantity: 200,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Digital Multimeter',
        description: 'Digital multimeter with LCD display and multiple functions',
        price: 89.90,
        stock_quantity: 25,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Circular Saw 7.1/4"',
        description: 'Electric circular saw 1400W with 7.1/4 inch disc',
        price: 320.00,
        stock_quantity: 12,
        category_id: categories[1].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Steel Rebar 8mm',
        description: 'CA-50 steel rebar bar 8mm diameter - 12 meters',
        price: 28.50,
        stock_quantity: 150,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Transformer 220V/110V',
        description: 'Dual voltage transformer 1000VA with thermal protection',
        price: 125.00,
        stock_quantity: 20,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Phillips Screwdriver Set',
        description: 'Kit with 6 Phillips screwdrivers in various sizes',
        price: 45.00,
        stock_quantity: 30,
        category_id: categories[1].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'CNC Milling Machine',
        description: 'Computer numerical control milling machine with 3-axis precision',
        price: 85000.00,
        stock_quantity: 2,
        category_id: categories[4].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Industrial Lathe',
        description: 'High-precision mechanical lathe for industrial machining',
        price: 45000.00,
        stock_quantity: 3,
        category_id: categories[4].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Stainless Steel 304',
        description: 'AISI 304 stainless steel sheets for industrial use',
        price: 25.50,
        stock_quantity: 1000,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Aluminum 6061',
        description: '6061-T6 aluminum bars for machining applications',
        price: 18.75,
        stock_quantity: 500,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'SKF Bearings',
        description: 'Ball bearings for industrial applications',
        price: 145.00,
        stock_quantity: 200,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'M8 Bolts',
        description: 'M8 hex bolts in galvanized steel',
        price: 2.50,
        stock_quantity: 5000,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'O-Ring Seals',
        description: 'Nitrile rubber sealing rings',
        price: 5.25,
        stock_quantity: 1000,
        category_id: categories[3].id,
        supplier_id: suppliers[0].id
      }
    ]);

    console.log('✅ Seed concluído com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   • ${categories.length} categories`);
    console.log(`   • ${suppliers.length} suppliers`);
    console.log(`   • 15 products`);
    console.log(`   • 6 users`);
    console.log('');
    console.log('🔑 Test credentials');
    console.log('   Buyer: joao@empresa.com / buyer123');
    console.log('   Supplier: carlos@fornecedor.com / supplier123');
    console.log('   Admin: admin@b2bmarketplace.com / admin123');

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
  }
};

module.exports = { seedData };

// Executar o seed se chamado diretamente
if (require.main === module) {
  const { sequelize } = require('./src/models');
  
  const runSeed = async () => {
    try {
      await sequelize.sync({ force: false });
      await seedData();
      process.exit(0);
    } catch (error) {
      console.error('Erro:', error);
      process.exit(1);
    }
  };
  
  runSeed();
}
