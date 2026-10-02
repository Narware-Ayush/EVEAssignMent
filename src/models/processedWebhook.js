const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProcessedWebhook = sequelize.define(
    'ProcessedWebhook',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventId: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        field: 'event_id',
      },
      eventType: {
        type: DataTypes.STRING(80),
        field: 'event_type',
      },
      payload: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: 'processed_webhooks',
      underscored: true,
      timestamps: true,
    }
  );

  return ProcessedWebhook;
};