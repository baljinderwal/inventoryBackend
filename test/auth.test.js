import request from 'supertest';
import app from '../src/app.js';

describe('Auth APIs', () => {
  let token;
  let emailCounter = 0;
  let email;
  let password = 'password123';

  beforeEach(() => {
    email = `auth${emailCounter}@example.com`;
    emailCounter++;
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Auth Test User',
        email,
        password,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('should login the new user and get a token', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Auth Test User',
        email,
        password,
      });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email,
        password,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with incorrect password', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Auth Test User',
        email,
        password,
      });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email,
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
  });

  it('should update the user profile', async () => {
    await request(app)
        .post('/auth/register')
        .send({
            name: 'Auth Test User',
            email,
            password,
        });
    const loginRes = await request(app)
        .post('/auth/login')
        .send({
            email,
            password,
        });
    token = loginRes.body.token;

    const newEmail = `new${email}`;
    const newPassword = 'newpassword123';

    const res = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: newEmail,
        password: newPassword,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', newEmail);
  });

  it('should login with the new credentials', async () => {
    await request(app)
        .post('/auth/register')
        .send({
            name: 'Auth Test User',
            email,
            password,
        });
    const loginRes = await request(app)
        .post('/auth/login')
        .send({
            email,
            password,
        });
    token = loginRes.body.token;

    const newEmail = `new${email}`;
    const newPassword = 'newpassword123';

    await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: newEmail,
        password: newPassword,
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: newEmail,
        password: newPassword,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
