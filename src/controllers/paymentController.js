const paymentService = require('../services/paymentService');
const { success } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const result = await paymentService.processPayment({
      bookingId: req.body.bookingId,
      userId: req.user.id,
      role: req.user.role,
    });
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const result = await paymentService.handleWebhook({
      eventId: req.body.eventId,
      eventType: req.body.eventType,
      bookingId: req.body.bookingId,
      status: req.body.status,
      providerRef: req.body.providerRef,
      rawPayload: req.body,
    });
    // Always 200 for webhooks (idempotent ack)
    return success(res, { received: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, webhook };