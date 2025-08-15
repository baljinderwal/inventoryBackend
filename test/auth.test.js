import request from 'supertest';
import app from '../src/app.js';

describe('Auth APIs', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Auth Test User',
        email: 'auth@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Auth Test User');
    expect(res.body).toHaveProperty('email', 'auth@example.com');
    expect(res.body).toHaveProperty('role', 'Staff');
  });

  it('should not register a user with a duplicate email', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Another User',
        email: 'auth@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('An account with this email already exists.');
  });

  it('should login the new user', async () => {
    const res = await request(app)
      .get('/users?email=auth@example.com&password=password123')
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name', 'Auth Test User');
    expect(res.body[0]).toHaveProperty('email', 'auth@example.com');
  });

  it('should not login with incorrect password', async () => {
    const res = await request(app)
      .get('/users?email=auth@example.com&password=wrongpassword')
      .send();
    expect(res.statusCode).toEqual(401);
  });
});
