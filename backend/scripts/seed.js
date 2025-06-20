import 'dotenv/config';
import { sequelize, User, Category, Supplier, Product } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@b2bmarketplace.com',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Machinery', slug: 'machinery' },
      { name: 'Raw Materials', slug: 'raw-materials' },
      { name: 'Components', slug: 'components' },
      { name: 'Tools', slug: 'tools' },
      { name: 'Equipment', slug: 'equipment' }
    ]);
    
    // Create buyer users
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    const buyers = await User.bulkCreate([
      {
        name: 'João Silva',
        email: 'joao@empresa.com',
        password: buyerPassword,
        role: 'buyer',
        companyName: 'Empresa Silva LTDA',
        cnpj: '12.345.678/0001-90'
      },
      {
        name: 'Maria Santos',
        email: 'maria@industria.com',
        password: buyerPassword,
        role: 'buyer',
        companyName: 'Indústria Santos S/A',
        cnpj: '98.765.432/0001-10'
      }
    ]);
    
    // Create supplier users
    const supplierPassword = await bcrypt.hash('supplier123', 10);
    const supplierUsers = await User.bulkCreate([
      {
        name: 'Carlos Fornecedor',
        email: 'carlos@fornecedor.com',
        password: supplierPassword,
        role: 'supplier',
        companyName: 'Fornecedor Industrial LTDA',
        cnpj: '11.222.333/0001-44'
      },
      {
        name: 'Ana Distribuidora',
        email: 'ana@distribuidora.com',
        password: supplierPassword,
        role: 'supplier',
        companyName: 'Distribuidora Ana S/A',
        cnpj: '55.666.777/0001-88'
      },
      {
        name: 'Pedro Máquinas',
        email: 'pedro@maquinas.com',
        password: supplierPassword,
        role: 'supplier',
        companyName: 'Pedro Máquinas Industriais',
        cnpj: '99.888.777/0001-22'
      }
    ]);
    
    // Create supplier profiles
    const suppliers = await Supplier.bulkCreate([
      {
        userId: supplierUsers[0].id,
        companyName: 'Fornecedor Industrial LTDA',
        cnpj: '11.222.333/0001-44',
        verified: true
      },
      {
        userId: supplierUsers[1].id,
        companyName: 'Distribuidora Ana S/A',
        cnpj: '55.666.777/0001-88',
        verified: true
      },
      {
        userId: supplierUsers[2].id,
        companyName: 'Pedro Máquinas Industriais',
        cnpj: '99.888.777/0001-22',
        verified: true
      }
    ]);
    
    // Create products
    const products = await Product.bulkCreate([
      // Machinery products
      {
        name: 'Industrial Lathe',
        description: 'High-precision mechanical lathe for industrial machining',
        price: 45000.00,
        stock: 5,
        category: 'Machinery',
        categoryId: categories[0].id,
        supplierId: suppliers[2].id,
        unit: 'unidade',
        minOrder: 1,
        image: '🔧',
        specifications: {
          potencia: '5 HP',
          peso: '2500 kg',
          dimensoes: '3m x 2m x 1.5m'
        },
        featured: true
      },
      {
        name: 'CNC Milling Machine',
        description: 'Computer numerical control milling machine',
        price: 85000.00,
        stock: 3,
        category: 'Machinery',
        categoryId: categories[0].id,
        supplierId: suppliers[2].id,
        unit: 'unidade',
        minOrder: 1,
        image: '⚙️',
        specifications: {
          eixos: '3 eixos',
          precisao: '0.01mm',
          area_trabalho: '1000x500x400mm'
        }
      },
      
      // Raw Materials products
      {
        name: 'Stainless Steel 304',
        description: 'AISI 304 stainless steel sheets for industrial use',
        price: 25.50,
        stock: 1000,
        category: 'Raw Materials',
        categoryId: categories[1].id,
        supplierId: suppliers[0].id,
        unit: 'kg',
        minOrder: 100,
        image: '🔩',
        specifications: {
          espessura: '3mm',
          largura: '1000mm',
          comprimento: '2000mm'
        },
        featured: true
      },
      {
        name: 'Aluminum 6061',
        description: '6061-T6 aluminum bars for machining',
        price: 18.75,
        stock: 500,
        category: 'Raw Materials',
        categoryId: categories[1].id,
        supplierId: suppliers[0].id,
        unit: 'kg',
        minOrder: 50,
        image: '🔗',
        specifications: {
          diametro: '25mm',
          comprimento: '3000mm',
          liga: '6061-T6'
        }
      },
      {
        name: 'Cast Iron',
        description: 'Cast iron blocks for industrial foundry',
        price: 12.00,
        stock: 2000,
        category: 'Raw Materials',
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        unit: 'kg',
        minOrder: 200,
        image: '⚫',
        specifications: {
          tipo: 'Ferro fundido cinzento',
          resistencia: '250 MPa',
          dureza: '200 HB'
        }
      },
      
      // Components products
      {
        name: 'SKF Bearings',
        description: 'Ball bearings for industrial applications',
        price: 145.00,
        stock: 200,
        category: 'Components',
        categoryId: categories[2].id,
        supplierId: suppliers[1].id,
        unit: 'unidade',
        minOrder: 10,
        image: '⚪',
        specifications: {
          diametro_interno: '20mm',
          diametro_externo: '47mm',
          largura: '14mm'
        },
        featured: true
      },
      {
        name: 'M8 Bolts',
        description: 'M8 hex bolts in galvanized steel',
        price: 2.50,
        stock: 5000,
        category: 'Components',
        categoryId: categories[2].id,
        supplierId: suppliers[1].id,
        unit: 'unidade',
        minOrder: 100,
        image: '🔩',
        specifications: {
          rosca: 'M8 x 1.25',
          comprimento: '40mm',
          material: 'Aço galvanizado'
        }
      },
      {
        name: 'O-Ring Seals',
        description: 'Nitrile rubber sealing rings',
        price: 5.25,
        stock: 1000,
        category: 'Components',
        categoryId: categories[2].id,
        supplierId: suppliers[0].id,
        unit: 'unidade',
        minOrder: 50,
        image: '⭕',
        specifications: {
          diametro_interno: '30mm',
          espessura: '3mm',
          material: 'NBR'
        }
      }
    ]);
    
    console.log('Seed completed successfully');
    console.log(`Created ${admin ? 1 : 0} admin user`);
    console.log(`Created ${buyers.length} buyer users`);
    console.log(`Created ${supplierUsers.length} supplier users`);
    console.log(`Created ${suppliers.length} supplier profiles`);
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${products.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
