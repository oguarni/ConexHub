const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PixPayment = sequelize.define('PixPayment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pixKey: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'PIX key (email, phone, CPF/CNPJ, or random key)'
    },
    pixKeyType: {
      type: DataTypes.ENUM('email', 'phone', 'cpf', 'cnpj', 'random'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payerDocument: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CPF or CNPJ of the payer'
    },
    receiverName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiverDocument: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CPF or CNPJ of the receiver'
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'Unique transaction identifier'
    },
    endToEndId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      comment: 'End-to-end identifier for PIX transaction'
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'PIX QR Code string (EMV format)'
    },
    qrCodeImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded QR code image'
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'expired', 'refunded'),
      defaultValue: 'pending'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'PIX payment expiration date'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quoteId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Associated quote ID'
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Associated order ID'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional payment metadata'
    }
  }, {
    tableName: 'pix_payments',
    timestamps: true,
    indexes: [
      {
        fields: ['transactionId']
      },
      {
        fields: ['endToEndId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['quoteId']
      },
      {
        fields: ['orderId']
      }
    ]
  });

  PixPayment.associate = (models) => {
    PixPayment.belongsTo(models.Quote, { 
      foreignKey: 'quoteId',
      as: 'Quote'
    });
    PixPayment.belongsTo(models.Order, { 
      foreignKey: 'orderId',
      as: 'Order'
    });
  };

  return PixPayment;
};