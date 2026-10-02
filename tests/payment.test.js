const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  sequelize,
  User,
  Centre,
  Test,
  CentreTest,
  Booking,
  Payment,
} = require('../src/models');

let token, userId, bookingId, centreId, testId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const user = await User.create({
    name: 'Carol',
    email: 'carol@example.com',
    passwordHash: await bcrypt.hash('Password123', 4),
  });
  userId = user.id;
  token = jwt.sign({ sub: user.id, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const centre = await Centre.create({ name: 'C', location: 'L' });
  centreId = centre.id;
  const test = await Test.create({ name: 'T', price: 50 });
  testId = test.id;
  await CentreTest.create({ centreId, testId, price: 50, available: true });

  const booking = await Booking.create({
    userId,
    centreId,
    testId,
    appointmentAt: new Date(Date.now() + 86400000),
    amount: 50,
    status: 'PENDING',
  });
  bookingId = booking.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Payments', () => {
  it('processes a successful payment', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookingId });
    expect(res.status).toBe(201);
    expect(res.body.data.payment.status).toBe('SUCCESS');
    expect(res.body.data.booking.status).toBe('CONFIRMED');
  });

  it('rejects paying a confirmed booking', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookingId });
    expect(res.status).toBe(409);
  });
});

describe('Webhook', () => {
  let webhookBookingId;

  beforeAll(async () => {
    const b = await Booking.create({
      userId,
      centreId,
      testId,
      appointmentAt: new Date(Date.now() + 86400000),
      amount: 50,
      status: 'PENDING',
    });
    webhookBookingId = b.id;
  });

  it('updates a booking and is idempotent', async () => {
    const payload = {
      eventId: 'evt_001',
      eventType: 'payment.success',
      bookingId: webhookBookingId,
      status: 'SUCCESS',
      providerRef: 'ref_abc',
    };

    const r1 = await request(app).post('/payments/webhook').send(payload);
    expect(r1.status).toBe(200);
    expect(r1.body.data.duplicate).toBe(false);

    const b = await Booking.findByPk(webhookBookingId);
    expect(b.status).toBe('CONFIRMED');

    const r2 = await request(app).post('/payments/webhook').send(payload);
    expect(r2.status).toBe(200);
    expect(r2.body.data.duplicate).toBe(true);

    // No duplicate payments for same event
    const payments = await Payment.findAll({ where: { eventId: 'evt_001' } });
    expect(payments.length).toBe(1);
  });

  it('rejects invalid status', async () => {
    const res = await request(app).post('/payments/webhook').send({
      eventId: 'evt_002',
      eventType: 'x',
      bookingId: webhookBookingId,
      status: 'MAYBE',
    });
    expect(res.status).toBe(422);
  });
});