import express from 'express';
const router = express.Router();
import { sequelize } from '../models/index.js';

// Endpoint de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Seed controller funcionando!' });
});

// Endpoint para popular o banco com dados de exemplo
router.post('/seed', async (req, res) => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Inserir categorias
    await sequelize.query(`
      INSERT INTO "Categories" (name, description, "createdAt", "updatedAt") VALUES
      ('Equipamentos Industriais', 'Máquinas e equipamentos para indústria', NOW(), NOW()),
      ('Ferramentas', 'Ferramentas manuais e elétricas', NOW(), NOW()),
      ('Materiais de Construção', 'Materiais para construção civil', NOW(), NOW()),
      ('Componentes Eletrônicos', 'Componentes e equipamentos eletrônicos', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // Inserir fornecedores
    await sequelize.query(`
      INSERT INTO "Suppliers" ("companyName", description, "contactEmail", verified, "createdAt", "updatedAt") VALUES
      ('TechSupply Ltda', 'Fornecedor especializado em equipamentos tecnológicos', 'contato@techsupply.com.br', true, NOW(), NOW()),
      ('Industrial Solutions', 'Soluções completas para indústria', 'vendas@industrialsolutions.com.br', true, NOW(), NOW()),
      ('Construfer Materiais', 'Materiais de construção de alta qualidade', 'comercial@construfer.com.br', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // Buscar IDs das categorias e fornecedores
    const [categories] = await sequelize.query('SELECT id, name FROM "Categories" ORDER BY id');
    const [suppliers] = await sequelize.query('SELECT id, "companyName" FROM "Suppliers" ORDER BY id');

    if (categories.length >= 4 && suppliers.length >= 3) {
      // Inserir produtos
      await sequelize.query(`
        INSERT INTO "Products" (name, description, price, stock, "isActive", featured, "supplierId", "categoryId", "createdAt", "updatedAt") VALUES
        ('Furadeira Industrial 1200W', 'Furadeira industrial de alta potência com velocidade variável', 450.00, 15, true, false, ${suppliers[0].id}, ${categories[1].id}, NOW(), NOW()),
        ('Compressor de Ar 50L', 'Compressor de ar comprimido 2HP com tanque de 50 litros', 1200.00, 8, true, true, ${suppliers[1].id}, ${categories[0].id}, NOW(), NOW()),
        ('Cimento Portland 50kg', 'Saco de cimento Portland CP-II-E-32 de 50kg', 35.00, 200, true, false, ${suppliers[2].id}, ${categories[2].id}, NOW(), NOW()),
        ('Multímetro Digital', 'Multímetro digital com display LCD e múltiplas funções', 89.90, 25, true, true, ${suppliers[0].id}, ${categories[3].id}, NOW(), NOW()),
        ('Serra Circular 7.1/4"', 'Serra circular elétrica 1400W com disco de 7.1/4 polegadas', 320.00, 12, true, false, ${suppliers[1].id}, ${categories[1].id}, NOW(), NOW()),
        ('Vergalhão de Aço 8mm', 'Barra de vergalhão de aço CA-50 com 8mm de diâmetro - 12 metros', 28.50, 150, true, false, ${suppliers[2].id}, ${categories[2].id}, NOW(), NOW()),
        ('Transformador 220V/110V', 'Transformador bivolt 1000VA com proteção térmica', 125.00, 20, true, false, ${suppliers[0].id}, ${categories[3].id}, NOW(), NOW()),
        ('Chave de Fenda Philips Set', 'Kit com 6 chaves de fenda Philips tamanhos variados', 45.00, 30, true, false, ${suppliers[1].id}, ${categories[1].id}, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);
    }

    // Inserir usuários de teste (senha hash para '123456')
    await sequelize.query(`
      INSERT INTO "Users" (name, email, password, role, "isActive", "createdAt", "updatedAt") VALUES
      ('Administrador', 'admin@b2bmarketplace.com', '$2b$10$rOK3tHQD1LYAhLkl4.LCZe0iGQbRzD7E9qQVFKmJc4xQT4.YxfG8m', 'admin', true, NOW(), NOW()),
      ('João Silva', 'joao@empresa.com', '$2b$10$rOK3tHQD1LYAhLkl4.LCZe0iGQbRzD7E9qQVFKmJc4xQT4.YxfG8m', 'buyer', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);

    const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Products"');
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"');
    const [supplierCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Suppliers"');
    const [categoryCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Categories"');

    console.log('✅ Seed concluído com sucesso!');
    
    res.json({
      success: true,
      message: 'Dados de exemplo criados com sucesso!',
      data: {
        products: productCount[0].count,
        users: userCount[0].count,
        suppliers: supplierCount[0].count,
        categories: categoryCount[0].count
      },
      credentials: {
        admin: { email: 'admin@b2bmarketplace.com', password: '123456' },
        user: { email: 'joao@empresa.com', password: '123456' }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar dados de exemplo',
      error: error.message
    });
  }
});

// Endpoint para limpar todos os dados
router.post('/reset', async (req, res) => {
  try {
    await sequelize.query('TRUNCATE "Products", "Users", "Suppliers", "Categories", "Orders", "Reviews" RESTART IDENTITY CASCADE');
    res.json({ success: true, message: 'Banco de dados limpo com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao limpar banco', error: error.message });
  }
});

export default router;
