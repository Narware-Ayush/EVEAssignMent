const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { error } = require('../utils/response');

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode, err.code);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return error(res, 'Resource already exists', 409, 'DUPLICATE');
  }

  if (err.name === 'SequelizeValidationError') {
    return error(
      res,
      err.errors.map((e) => e.message),
      422,
      'DB_VALIDATION_ERROR'
    );
  }

  return error(res, 'Internal server error', 500, 'INTERNAL_ERROR');
};

module.exports = { notFound, errorHandler };