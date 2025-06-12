const { Product, Category, Supplier, User } = require('./src/models');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar categorias
    const categories = await Category.bulkCreate([
      {
        name: 'Equipamentos Industriais',
        slug: 'equipamentos-industriais',
        description: 'Máquinas e equipamentos para indústria'
      },
      {
        name: 'Ferramentas',
        slug: 'ferramentas',
        description: 'Ferramentas manuais e elétricas'
      },
      {
        name: 'Materiais de Construção',
        slug: 'materiais-construcao',
        description: 'Materiais para construção civil'
      },
      {
        name: 'Componentes Eletrônicos',
        slug: 'componentes-eletronicos',
        description: 'Componentes e equipamentos eletrônicos'
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
        name: 'Furadeira Industrial 1200W',
        description: 'Furadeira industrial de alta potência com velocidade variável',
        price: 450.00,
        stock_quantity: 15,
        category_id: categories[1].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Compressor de Ar 50L',
        description: 'Compressor de ar comprimido 2HP com tanque de 50 litros',
        price: 1200.00,
        stock_quantity: 8,
        category_id: categories[0].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Cimento Portland 50kg',
        description: 'Saco de cimento Portland CP-II-E-32 de 50kg',
        price: 35.00,
        stock_quantity: 200,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Multímetro Digital',
        description: 'Multímetro digital com display LCD e múltiplas funções',
        price: 89.90,
        stock_quantity: 25,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Serra Circular 7.1/4"',
        description: 'Serra circular elétrica 1400W com disco de 7.1/4 polegadas',
        price: 320.00,
        stock_quantity: 12,
        category_id: categories[1].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Vergalhão de Aço 8mm',
        description: 'Barra de vergalhão de aço CA-50 com 8mm de diâmetro - 12 metros',
        price: 28.50,
        stock_quantity: 150,
        category_id: categories[2].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Transformador 220V/110V',
        description: 'Transformador bivolt 1000VA com proteção térmica',
        price: 125.00,
        stock_quantity: 20,
        category_id: categories[3].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Chave de Fenda Philips Set',
        description: 'Kit com 6 chaves de fenda Philips tamanhos variados',
        price: 45.00,
        stock_quantity: 30,
        category_id: categories[1].id,
        supplier_id: suppliers[2].id
      }
    ]);

    console.log('✅ Seed concluído com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   • ${categories.length} categorias`);
    console.log(`   • ${suppliers.length} fornecedores`);
    console.log(`   • 8 produtos`);
    console.log(`   • 6 usuários`);
    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('   Comprador: joao@empresa.com / buyer123');
    console.log('   Fornecedor: carlos@fornecedor.com / supplier123');
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
