const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupValidator, validate, ctrl.signup);
router.post('/login', authLimiter, loginValidator, validate, ctrl.login);
router.get('/me', authenticate, ctrl.me);

module.exports = router;