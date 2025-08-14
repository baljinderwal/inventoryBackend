import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

describe('Auth APIs', () => {
  let token;

  beforeAll(async () => {
    await redisClient.flushall();
  });

  afterAll(async () => {
    await redisClient.quit();
    server.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Auth Test User',
        email: 'auth@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('should not register a user with a duplicate email', async () => {
    const res = await request(app)
        .post('/auth/register')
        .send({
            name: 'Another User',
            email: 'auth@example.com',
            password: 'password123',
        });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toContain('User with this email already exists');
  });

  it('should login the new user and get a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'auth@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'auth@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
  });

  it('should access a protected route with a valid token', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should not access a protected route without a token', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toEqual(401);
  });

  it('should not access a protected route with an invalid token', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toEqual(401);
  });
});
