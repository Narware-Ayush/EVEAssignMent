const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth', () => {
  const user = { name: 'Alice', email: 'alice@example.com', password: 'Password123' };

  it('signs up a user', async () => {
    const res = await request(app).post('/auth/signup').send(user);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/auth/signup').send(user);
    expect(res.status).toBe(409);
  });

  it('rejects invalid payload', async () => {
    const res = await request(app).post('/auth/signup').send({ email: 'bad' });
    expect(res.status).toBe(422);
  });

  it('logs in and returns JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects /me without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns /me with token', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    const token = login.body.data.token;
    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });
});