const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const validate = require('../middleware/validate');
const { createBookingValidator } = require('../validators/bookingValidator');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createBookingValidator, validate, ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/:id/cancel', ctrl.cancel);

module.exports = router;