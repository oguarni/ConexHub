const { Product, Supplier } = require('./src/models');

const seedProducts = async () => {
  try {
    console.log('🌱 Quick seeding products...');

    // Get first supplier
    const supplier = await Supplier.findOne();
    if (!supplier) {
      console.error('❌ No suppliers found');
      return;
    }

    console.log(`Using supplier: ${supplier.companyName} (ID: ${supplier.id})`);

    // Sample products matching frontend expectations
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

    let created = 0;
    for (const productData of products) {
      try {
        const existing = await Product.findOne({ where: { name: productData.name } });
        if (!existing) {
          await Product.create(productData);
          console.log(`✅ Created: ${productData.name}`);
          created++;
        } else {
          console.log(`⏭️ Exists: ${productData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error with ${productData.name}:`, error.message);
      }
    }

    console.log(`✅ Seed completed! Created ${created} new products.`);

  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};

// Execute
const { sequelize } = require('./src/models');
sequelize.sync({ force: false }).then(() => {
  seedProducts().then(() => process.exit(0));
});