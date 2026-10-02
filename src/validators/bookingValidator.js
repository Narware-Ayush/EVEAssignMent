const { body } = require('express-validator');

const createBookingValidator = [
  body('centreId').isUUID().withMessage('centreId must be a UUID'),
  body('testId').isUUID().withMessage('testId must be a UUID'),
  body('appointmentAt')
    .isISO8601()
    .withMessage('appointmentAt must be ISO8601')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('appointmentAt must be in the future');
      }
      return true;
    }),
];

module.exports = { createBookingValidator };