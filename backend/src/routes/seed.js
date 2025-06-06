const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Product } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Starting database seed...');

    // Clear existing data
    await User.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });

    // Create users
    const hashedPassword = await bcrypt.hash('123456', 12);

    const users = await User.bulkCreate([
      {
        name: 'Administrador',
        email: 'admin@b2bmarketplace.com',
        password: hashedPassword,
        role: 'admin',
        cpf: '000.000.000-00',
        address: 'Rua Admin, 123 - Centro - Francisco Beltrão - PR'
      },
      {
        name: 'João Silva',
        email: 'joao@empresa.com',
        password: hashedPassword,
        role: 'user',
        cpf: '123.456.789-00',
        address: 'Rua das Empresas, 456 - Industrial - Francisco Beltrão - PR'
      },
      {
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        password: hashedPassword,
        role: 'user',
        cpf: '987.654.321-00',
        address: 'Av. Comercial, 789 - Centro - Pato Branco - PR'
      }
    ]);

    // Create products
    const products = await Product.bulkCreate([
      {
        name: 'Luva Térmica Profissional',
        category: 'EPI',
        price: 45.90,
        unit: 'par',
        description: 'Luva térmica resistente para uso industrial, suporta até 350°C',
        image: '🧤'
      },
      {
        name: 'Óleo Lubrificante Industrial 20L',
        category: 'Manutenção',
        price: 189.90,
        unit: 'balde',
        description: 'Óleo lubrificante de alta performance para máquinas industriais',
        image: '🛢️'
      },
      {
        name: 'Caixa Térmica EPS 20kg',
        category: 'Embalagem',
        price: 35.50,
        unit: 'unidade',
        description: 'Caixa térmica isolante para transporte de produtos refrigerados',
        image: '📦'
      },
      {
        name: 'Disco de Corte 7"',
        category: 'Ferramenta',
        price: 8.90,
        unit: 'unidade',
        description: 'Disco de corte para metal e alvenaria, alta durabilidade',
        image: '⚙️'
      },
      {
        name: 'Detergente Industrial 5L',
        category: 'Limpeza',
        price: 28.90,
        unit: 'galão',
        description: 'Detergente concentrado para limpeza pesada industrial',
        image: '🧴'
      },
      {
        name: 'Capacete de Segurança',
        category: 'EPI',
        price: 25.50,
        unit: 'unidade',
        description: 'Capacete de segurança classe A, alta resistência',
        image: '⛑️'
      },
      {
        name: 'Filtro de Ar Industrial',
        category: 'Manutenção',
        price: 145.00,
        unit: 'unidade',
        description: 'Filtro de ar de alta eficiência para sistemas industriais',
        image: '🔧'
      },
      {
        name: 'Papel Kraft 80g 1m x 200m',
        category: 'Embalagem',
        price: 89.90,
        unit: 'rolo',
        description: 'Papel kraft resistente para embalagem e proteção',
        image: '📜'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created ${users.length} users and ${products.length} products`);

    res.json({
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        products: products.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Erro ao popular banco de dados' });
  }
});

module.exports = router;
