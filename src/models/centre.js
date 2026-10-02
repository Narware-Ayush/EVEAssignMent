const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Centre = sequelize.define(
    'Centre',
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
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'centres',
      underscored: true,
      timestamps: true,
    }
  );

  return Centre;
};