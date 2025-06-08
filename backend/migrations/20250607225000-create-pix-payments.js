'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pix_payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      pixKey: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'PIX key (email, phone, CPF/CNPJ, or random key)'
      },
      pixKeyType: {
        type: Sequelize.ENUM('email', 'phone', 'cpf', 'cnpj', 'random'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payerDocument: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'CPF or CNPJ of the payer'
      },
      receiverName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      receiverDocument: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'CPF or CNPJ of the receiver'
      },
      transactionId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        comment: 'Unique transaction identifier'
      },
      endToEndId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        comment: 'End-to-end identifier for PIX transaction'
      },
      qrCode: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'PIX QR Code string (EMV format)'
      },
      qrCodeImage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Base64 encoded QR code image'
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled', 'expired', 'refunded'),
        defaultValue: 'pending'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'PIX payment expiration date'
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      quoteId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Associated quote ID',
        references: {
          model: 'Quotes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Associated order ID',
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional payment metadata'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('pix_payments', ['transactionId']);
    await queryInterface.addIndex('pix_payments', ['endToEndId']);
    await queryInterface.addIndex('pix_payments', ['status']);
    await queryInterface.addIndex('pix_payments', ['quoteId']);
    await queryInterface.addIndex('pix_payments', ['orderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pix_payments');
  }
};