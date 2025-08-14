import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

beforeAll(async () => {
  // Clear the cache before running the tests
  await redisClient.flushall();
});

afterAll(async () => {
  // Disconnect from Redis after all tests are done
  await redisClient.quit();
  server.close();
});

describe('User APIs', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: 'User',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });

  it('should get a user by id', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  it('should update a user', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({
        name: 'Updated Test User',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should get the updated user', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Test User');
  });

  it('should delete a user', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });

  it('should not find the deleted user', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toEqual(404);
  });
});
