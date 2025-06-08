'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing Quotes table if it exists
    await queryInterface.dropTable('Quotes');
    
    // Create the new Quotes table with improved schema
    await queryInterface.createTable('Quotes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      quoteNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      buyerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      supplierNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deliveryTime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'quoted', 'accepted', 'rejected', 'expired'),
        defaultValue: 'pending',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Quotes', ['buyerId']);
    await queryInterface.addIndex('Quotes', ['supplierId']);
    await queryInterface.addIndex('Quotes', ['productId']);
    await queryInterface.addIndex('Quotes', ['status']);
    await queryInterface.addIndex('Quotes', ['quoteNumber']);
  },

  async down(queryInterface, Sequelize) {
    // Drop the new table
    await queryInterface.dropTable('Quotes');
    
    // Recreate the old simple table structure
    await queryInterface.createTable('Quotes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  }
};