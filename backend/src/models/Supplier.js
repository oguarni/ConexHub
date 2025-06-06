module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Supplier.associate = (models) => {
    Supplier.belongsTo(models.User, { foreignKey: 'userId' });
    Supplier.hasMany(models.Product, { foreignKey: 'supplierId' });
  };

  return Supplier;
};
