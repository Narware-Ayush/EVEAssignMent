const { body } = require('express-validator');

const signupValidator = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 chars'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be 8-72 chars'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

module.exports = { signupValidator, loginValidator };