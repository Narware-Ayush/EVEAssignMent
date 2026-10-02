const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(
      res,
      errors.array().map((e) => ({ field: e.path, message: e.msg })),
      422,
      'VALIDATION_ERROR'
    );
  }
  next();
};

module.exports = validate;