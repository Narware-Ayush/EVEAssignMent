const request = require('supertest');
const app = require('../src/app');
const {
  sequelize,
  User,
  Centre,
  Test,
  CentreTest,
} = require('../src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let token, userId, centreId, testId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('Password123', 4);
  const user = await User.create({
    name: 'Bob',
    email: 'bob@example.com',
    passwordHash,
  });
  userId = user.id;
  token = jwt.sign({ sub: user.id, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const centre = await Centre.create({ name: 'Test Centre', location: 'X' });
  centreId = centre.id;
  const test = await Test.create({ name: 'CBC', price: 25.0 });
  testId = test.id;
  await CentreTest.create({ centreId, testId, price: 25.0, available: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Bookings', () => {
  let bookingId;

  it('requires auth', async () => {
    const res = await request(app).post('/bookings').send({});
    expect(res.status).toBe(401);
  });

  it('rejects invalid payload', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ centreId: 'nope', testId: 'nope', appointmentAt: 'past' });
    expect(res.status).toBe(422);
  });

  it('rejects past appointment', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        centreId,
        testId,
        appointmentAt: new Date(Date.now() - 1000).toISOString(),
      });
    expect(res.status).toBe(422);
  });

  it('creates a booking', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        centreId,
        testId,
        appointmentAt: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
    bookingId = res.body.data.id;
  });

  it('lists bookings (paginated)', async () => {
    const res = await request(app)
      .get('/bookings?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.page).toBe(1);
  });

  it('cancels a booking', async () => {
    const res = await request(app)
      .post(`/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('is idempotent on cancel', async () => {
    const res = await request(app)
      .post(`/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('404s for unknown booking', async () => {
    const res = await request(app)
      .get('/bookings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});