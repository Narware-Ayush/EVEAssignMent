const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { User } = require('../models');

const signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  return sanitize(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return { token, user: sanitize(user) };
};

const sanitize = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

module.exports = { signup, login };