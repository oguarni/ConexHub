const { User, Supplier } = require('./src/models');

const createTestUsers = async () => {
  try {
    console.log('🔑 Criando usuários de teste...');

    // Criar carlos@fornecedor.com
    const [carlosUser] = await User.findOrCreate({
      where: { email: 'carlos@fornecedor.com' },
      defaults: {
        name: 'Carlos Fornecedor',
        email: 'carlos@fornecedor.com',
        password: 'supplier123',
        cpf: '55555555555',
        cnpj: '55555555000155',
        role: 'supplier'
      }
    });

    // Criar supplier para Carlos se não existir
    if (carlosUser.role === 'supplier') {
      const [supplier] = await Supplier.findOrCreate({
        where: { userId: carlosUser.id },
        defaults: {
          userId: carlosUser.id,
          companyName: 'Carlos Fornecedor Ltda',
          cnpj: '55555555000155',
          description: 'Fornecedor de equipamentos especializados',
          verified: true
        }
      });
      console.log('✅ Supplier criado para Carlos:', supplier.companyName);
    }

    // Atualizar joao@empresa.com com senha correta
    const joaoUser = await User.findOne({ where: { email: 'joao@empresa.com' } });
    if (joaoUser) {
      await joaoUser.update({ password: 'buyer123' });
      console.log('✅ Senha do João atualizada');
    }

    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('   Comprador: joao@empresa.com / buyer123');
    console.log('   Fornecedor: carlos@fornecedor.com / supplier123');
    console.log('   Admin: admin@b2bmarketplace.com / admin123');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    process.exit(0);
  }
};

createTestUsers();