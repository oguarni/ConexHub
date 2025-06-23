export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Suppliers',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'quote_requested', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'invoice',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quoteId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Quotes',
        key: 'id',
      },
    }
  }, {
    timestamps: true,
    tableName: 'Orders',
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    Order.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    Order.hasMany(models.Review, { foreignKey: 'orderId' });
    Order.belongsTo(models.Quote, {
      foreignKey: 'quoteId',
      as: 'quote',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  };

  return Order;
};