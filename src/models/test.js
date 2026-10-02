const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Test = sequelize.define(
    'Test',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
    },
    {
      tableName: 'tests',
      underscored: true,
      timestamps: true,
    }
  );

  return Test;
};