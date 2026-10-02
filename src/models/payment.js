const { DataTypes } = require('sequelize');

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'booking_id',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
        defaultValue: PAYMENT_STATUS.PENDING,
      },
      providerRef: {
        type: DataTypes.STRING(120),
        field: 'provider_ref',
      },
      // Unique event id from provider for idempotency
      eventId: {
        type: DataTypes.STRING(120),
        unique: true,
        field: 'event_id',
      },
      // Free-form payload snapshot for audit
      rawPayload: {
        type: DataTypes.JSONB,
        field: 'raw_payload',
      },
    },
    {
      tableName: 'payments',
      underscored: true,
      timestamps: true,
    }
  );

  Payment.STATUS = PAYMENT_STATUS;
  return Payment;
};