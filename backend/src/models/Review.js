export default (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 }
    },
    comment: DataTypes.TEXT
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Order, { foreignKey: 'orderId' });
    Review.belongsTo(models.User, { foreignKey: 'userId' });
    Review.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
  };

  return Review;
};
