module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Suppliers',
        key: 'id',
      },
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'unidade',
    },
    minOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '📦',
    },
    images: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        try {
          return JSON.parse(this.getDataValue('images') || '[]');
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('images', JSON.stringify(value || []));
      }
    },
    specifications: {
      type: DataTypes.TEXT,
      defaultValue: '{}',
      get() {
        try {
          return JSON.parse(this.getDataValue('specifications') || '{}');
        } catch {
          return {};
        }
      },
      set(value) {
        this.setDataValue('specifications', JSON.stringify(value || {}));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    timestamps: true,
    tableName: 'Products',
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
    Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Product.hasMany(models.OrderItem, { foreignKey: 'productId' });
    Product.hasMany(models.Quote, { foreignKey: 'productId' });
  };

  return Product;
};