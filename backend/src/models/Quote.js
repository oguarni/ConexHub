module.exports = (sequelize, DataTypes) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'accepted', 'rejected'),
      defaultValue: 'pending'
    }
  });

  Quote.associate = (models) => {
    Quote.belongsTo(models.Order, { foreignKey: 'orderId' });
    Quote.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
  };

  return Quote;
};
