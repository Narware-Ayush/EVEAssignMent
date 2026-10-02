const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, env.jwt.secret);

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = { authenticate, authorize };