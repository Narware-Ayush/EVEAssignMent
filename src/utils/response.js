const success = (res, data, statusCode = 200, meta = null) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const error = (res, message, statusCode = 400, code = null) => {
  const payload = { success: false, error: { message } };
  if (code) payload.error.code = code;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };