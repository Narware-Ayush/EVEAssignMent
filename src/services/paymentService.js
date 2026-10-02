const crypto = require('crypto');
const { Op } = require('sequelize');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const {
  sequelize,
  Booking,
  Payment,
  ProcessedWebhook,
} = require('../models');
const logger = require('../utils/logger');

/**
 * Simulated payment processor.
 * Creates a Payment row and updates the booking status accordingly.
 */
const processPayment = async ({ bookingId, userId, role }) => {
  return sequelize.transaction(async (tx) => {
    const booking = await Booking.findByPk(bookingId, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    if (role !== 'ADMIN' && booking.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (booking.status === Booking.STATUS.CANCELLED) {
      throw new AppError('Cannot pay for a cancelled booking', 400, 'BOOKING_CANCELLED');
    }
    if (booking.status === Booking.STATUS.CONFIRMED) {
      throw new AppError('Booking already confirmed', 409, 'ALREADY_PAID');
    }

    // Simulate provider outcome
    const success = Math.random() >= env.payment.failureRate;
    const providerRef = `sim_${crypto.randomBytes(8).toString('hex')}`;
    const status = success ? Payment.STATUS.SUCCESS : Payment.STATUS.FAILED;

    const payment = await Payment.create(
      {
        bookingId: booking.id,
        amount: booking.amount,
        status,
        providerRef,
      },
      { transaction: tx }
    );

    booking.status = success ? Booking.STATUS.CONFIRMED : Booking.STATUS.FAILED;
    await booking.save({ transaction: tx });

    return { payment, booking };
  });
};

/**
 * Idempotent webhook handler.
 * Strategy:
 *  1. Insert eventId into processed_webhooks with unique constraint.
 *     - On unique violation, treat as already-processed and return early.
 *  2. In the same transaction, update booking + create payment (if new).
 */
const handleWebhook = async ({ eventId, eventType, bookingId, status, providerRef, rawPayload }) => {
  return sequelize.transaction(async (tx) => {
    // Idempotency guard
    try {
      await ProcessedWebhook.create(
        { eventId, eventType, payload: rawPayload || {} },
        { transaction: tx }
      );
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        logger.info(`Duplicate webhook ignored: ${eventId}`);
        return { duplicate: true };
      }
      throw err;
    }

    const booking = await Booking.findByPk(bookingId, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!booking) {
      // We still recorded the event so retries don't loop forever.
      logger.warn(`Webhook for missing booking ${bookingId}`);
      return { duplicate: false, bookingFound: false };
    }

    // Don't clobber terminal states unnecessarily
    if (booking.status === Booking.STATUS.CANCELLED) {
      logger.warn(`Webhook for cancelled booking ${bookingId}, ignoring`);
      return { duplicate: false, ignored: true };
    }

    if (status === 'SUCCESS') {
      booking.status = Booking.STATUS.CONFIRMED;
    } else if (status === 'FAILED') {
      booking.status = Booking.STATUS.FAILED;
    } else {
      throw new AppError('Invalid webhook status', 400, 'INVALID_STATUS');
    }
    await booking.save({ transaction: tx });

    // Find or create a payment record tied to this booking
    let payment = await Payment.findOne({
      where: { bookingId: booking.id, providerRef: providerRef || null },
      transaction: tx,
    });
    if (!payment) {
      payment = await Payment.create(
        {
          bookingId: booking.id,
          amount: booking.amount,
          status,
          providerRef: providerRef || null,
          eventId,
          rawPayload: rawPayload || {},
        },
        { transaction: tx }
      );
    } else {
      payment.status = status;
      await payment.save({ transaction: tx });
    }

    return { duplicate: false, booking, payment };
  });
};

module.exports = { processPayment, handleWebhook };