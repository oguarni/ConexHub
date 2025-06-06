const { Product, Category, Supplier, User } = require('./src/models');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar categorias
    const categories = await Category.bulkCreate([
      {
        name: 'Equipamentos Industriais',
        description: 'Máquinas e equipamentos para indústria'
      },
      {
        name: 'Ferramentas',
        description: 'Ferramentas manuais e elétricas'
      },
      {
        name: 'Materiais de Construção',
        description: 'Materiais para construção civil'
      },
      {
        name: 'Componentes Eletrônicos',
        description: 'Componentes e equipamentos eletrônicos'
      }
    ]);

    // Criar fornecedores
    const suppliers = await Supplier.bulkCreate([
      {
        name: 'TechSupply Ltda',
        description: 'Fornecedor especializado em equipamentos tecnológicos',
        contact_info: 'contato@techsupply.com.br'
      },
      {
        name: 'Industrial Solutions',
        description: 'Soluções completas para indústria',
        contact_info: 'vendas@industrialsolutions.com.br'
      },
      {
        name: 'Construfer Materiais',
        description: 'Materiais de construção de alta qualidade',
        contact_info: 'comercial@construfer.com.br'
      }
    ]);

    // Criar produtos
    await Product.bulkCreate([
      {
        name: 'Furadeira Industrial 1200W',
        description: 'Furadeira industrial de alta potência com velocidade variável',
        price: 450.00,
        stock_quantity: 15,
        category_id: categories[1].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Compressor de Ar 50L',
        description: 'Compressor de ar comprimido 2HP com tanque de 50 litros',
        price: 1200.00,
        stock_quantity: 8,
        category_id: categories[0].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Cimento Portland 50kg',
        description: 'Saco de cimento Portland CP-II-E-32 de 50kg',
        price: 35.00,
        stock_quantity: 200,
        category_id: categories[2].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Multímetro Digital',
        description: 'Multímetro digital com display LCD e múltiplas funções',
        price: 89.90,
        stock_quantity: 25,
        category_id: categories[3].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Serra Circular 7.1/4"',
        description: 'Serra circular elétrica 1400W com disco de 7.1/4 polegadas',
        price: 320.00,
        stock_quantity: 12,
        category_id: categories[1].id,
        supplier_id: suppliers[1].id
      },
      {
        name: 'Vergalhão de Aço 8mm',
        description: 'Barra de vergalhão de aço CA-50 com 8mm de diâmetro - 12 metros',
        price: 28.50,
        stock_quantity: 150,
        category_id: categories[2].id,
        supplier_id: suppliers[2].id
      },
      {
        name: 'Transformador 220V/110V',
        description: 'Transformador bivolt 1000VA com proteção térmica',
        price: 125.00,
        stock_quantity: 20,
        category_id: categories[3].id,
        supplier_id: suppliers[0].id
      },
      {
        name: 'Chave de Fenda Philips Set',
        description: 'Kit com 6 chaves de fenda Philips tamanhos variados',
        price: 45.00,
        stock_quantity: 30,
        category_id: categories[1].id,
        supplier_id: suppliers[1].id
      }
    ]);

    // Criar usuário de teste
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await User.create({
      name: 'Administrador',
      email: 'admin@b2bmarketplace.com',
      password: hashedPassword,
      cpf: '12345678901',
      role: 'admin'
    });

    await User.create({
      name: 'João Silva',
      email: 'joao@empresa.com',
      password: hashedPassword,
      cpf: '98765432100',
      role: 'buyer'
    });

    console.log('✅ Seed concluído com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   • ${categories.length} categorias`);
    console.log(`   • ${suppliers.length} fornecedores`);
    console.log(`   • 8 produtos`);
    console.log(`   • 2 usuários`);
    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('   Admin: admin@b2bmarketplace.com / 123456');
    console.log('   User:  joao@empresa.com / 123456');

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
