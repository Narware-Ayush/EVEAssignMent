const { body } = require('express-validator');

const createPaymentValidator = [
  body('bookingId').isUUID().withMessage('bookingId must be a UUID'),
];

const webhookValidator = [
  body('eventId').isString().notEmpty().withMessage('eventId is required'),
  body('eventType').isString().notEmpty().withMessage('eventType is required'),
  body('bookingId').isUUID().withMessage('bookingId must be a UUID'),
  body('status')
    .isIn(['SUCCESS', 'FAILED'])
    .withMessage('status must be SUCCESS or FAILED'),
  body('providerRef').optional().isString(),
];

module.exports = { createPaymentValidator, webhookValidator };