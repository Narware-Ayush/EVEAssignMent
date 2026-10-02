const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CentreTest = sequelize.define(
    'CentreTest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      centreId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'centre_id',
      },
      testId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'test_id',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'centre_tests',
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ['centre_id', 'test_id'] },
      ],
    }
  );

  return CentreTest;
};