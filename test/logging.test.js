import request from 'supertest';
import app from '../src/app.js';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'server.log');

// Helper function to introduce a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Logging Middleware', () => {
  let token;

  beforeAll(async () => {
    // Register a user and get a token
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Logging Test User',
        email: 'logging@example.com',
        password: 'password123',
      });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'logging@example.com',
        password: 'password123',
      });
    token = res.body.token;
  });

  beforeEach(() => {
    // Clear the log file before each test
    if (fs.existsSync(logFilePath)) {
      fs.truncateSync(logFilePath, 0);
    }
  });

  it('should log request details and user information for a request with a valid token', async () => {
    await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`)
      .query({ category: 'Electronics' });

    await delay(100); // Wait for the log to be written

    const logContent = fs.readFileSync(logFilePath, 'utf-8');

    expect(logContent).toContain('Request: GET /products');
    expect(logContent).toContain('"category":"Electronics"');
    expect(logContent).toContain('Token: VALID');
    expect(logContent).toContain('"email":"logging@example.com"');
  });

  it('should log request details and "token not provided" for a request without a token', async () => {
    await request(app)
      .get('/products')
      .query({ category: 'Books' });

    await delay(100); // Wait for the log to be written

    const logContent = fs.readFileSync(logFilePath, 'utf-8');

    expect(logContent).toContain('Request: GET /products');
    expect(logContent).toContain('"category":"Books"');
    expect(logContent).toContain('Token: NOT PROVIDED');
  });

  it('should log request details and "invalid token" for a request with an invalid token', async () => {
    await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalidtoken');

    await delay(100); // Wait for the log to be written

    const logContent = fs.readFileSync(logFilePath, 'utf-8');

    expect(logContent).toContain('Request: GET /products');
    expect(logContent).toContain('Token: INVALID - jwt malformed');
  });
});
