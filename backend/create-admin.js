const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    console.log('🔑 Criando usuário administrador...');

    // Verificar se já existe admin
    const existingAdmin = await User.findOne({
      where: { email: 'admin@b2bmarketplace.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe');
      // Atualizar role para admin se necessário
      if (existingAdmin.role !== 'admin') {
        await existingAdmin.update({ role: 'admin' });
        console.log('✅ Role atualizada para admin');
      }
      return;
    }

    // Criar novo admin
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@b2bmarketplace.com',
      password: 'admin123',
      cpf: '11111111111',
      cnpj: '11111111000111',
      role: 'admin'
    });

    console.log('✅ Usuário administrador criado:', adminUser.email);
    console.log('');
    console.log('🔑 Credenciais do admin:');
    console.log('   Email: admin@b2bmarketplace.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    process.exit(0);
  }
};

createAdmin();