export default (sequelize, DataTypes) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quoteNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    supplierNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deliveryTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'quoted', 'accepted', 'rejected', 'expired'),
      defaultValue: 'pending'
    }
  });

  Quote.associate = (models) => {
    Quote.belongsTo(models.User, { 
      foreignKey: 'buyerId', 
      as: 'Buyer'
    });
    Quote.belongsTo(models.User, { 
      foreignKey: 'supplierId', 
      as: 'Supplier'
    });
    Quote.belongsTo(models.Product, { 
      foreignKey: 'productId'
    });
  };

  return Quote;
};
