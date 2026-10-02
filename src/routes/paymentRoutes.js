const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const validate = require('../middleware/validate');
const {
  createPaymentValidator,
  webhookValidator,
} = require('../validators/paymentValidator');
const { authenticate } = require('../middleware/auth');

// Webhook must be public (provider cannot send user JWT)
router.post('/webhook', webhookValidator, validate, ctrl.webhook);

// Everything else requires auth
router.post('/', authenticate, createPaymentValidator, validate, ctrl.create);

module.exports = router;