const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const {
  sequelize,
  Booking,
  Centre,
  Test,
  CentreTest,
  Payment,
} = require('../models');

const createBooking = async ({ userId, centreId, testId, appointmentAt }) => {
  return sequelize.transaction(async (tx) => {
    const centre = await Centre.findByPk(centreId, { transaction: tx });
    if (!centre || !centre.isActive) {
      throw new AppError('Centre not found or inactive', 404, 'CENTRE_NOT_FOUND');
    }

    const test = await Test.findByPk(testId, { transaction: tx });
    if (!test) {
      throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
    }

    const centreTest = await CentreTest.findOne({
      where: { centreId, testId, available: true },
      transaction: tx,
    });
    if (!centreTest) {
      throw new AppError('Test not available at this centre', 400, 'TEST_NOT_AVAILABLE');
    }

    const booking = await Booking.create(
      {
        userId,
        centreId,
        testId,
        appointmentAt,
        amount: centreTest.price,
        status: Booking.STATUS.PENDING,
      },
      { transaction: tx }
    );

    return booking;
  });
};

const listBookings = async ({ userId, role, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const where = role === 'ADMIN' ? {} : { userId };

  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: [
      { model: Test, as: 'test', attributes: ['id', 'name', 'price'] },
      { model: Centre, as: 'centre', attributes: ['id', 'name', 'location'] },
      { model: Payment, as: 'payments', attributes: ['id', 'status', 'amount', 'providerRef'] },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
};

const getBooking = async ({ bookingId, userId, role }) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Test, as: 'test' },
      { model: Centre, as: 'centre' },
      { model: Payment, as: 'payments' },
    ],
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (role !== 'ADMIN' && booking.userId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  return booking;
};

const cancelBooking = async ({ bookingId, userId, role }) => {
  return sequelize.transaction(async (tx) => {
    const booking = await Booking.findByPk(bookingId, { transaction: tx, lock: tx.LOCK.UPDATE });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    if (role !== 'ADMIN' && booking.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (booking.status === Booking.STATUS.CONFIRMED) {
      throw new AppError('Confirmed bookings cannot be cancelled', 400, 'CANNOT_CANCEL');
    }
    if (booking.status === Booking.STATUS.CANCELLED) {
      return booking; // idempotent
    }

    booking.status = Booking.STATUS.CANCELLED;
    await booking.save({ transaction: tx });
    return booking;
  });
};

module.exports = { createBooking, listBookings, getBooking, cancelBooking };