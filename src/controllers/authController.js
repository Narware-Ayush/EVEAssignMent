const authService = require('../services/authService');
const { success } = require('../utils/response');

const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return success(res, { user }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    return success(res, {
      user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, me };