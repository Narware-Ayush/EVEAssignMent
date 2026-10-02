const { DataTypes } = require('sequelize');

const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

module.exports = (sequelize) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      testId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'test_id',
      },
      centreId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'centre_id',
      },
      appointmentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'appointment_at',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)),
        defaultValue: BOOKING_STATUS.PENDING,
      },
    },
    {
      tableName: 'bookings',
      underscored: true,
      timestamps: true,
    }
  );

  Booking.STATUS = BOOKING_STATUS;
  return Booking;
};