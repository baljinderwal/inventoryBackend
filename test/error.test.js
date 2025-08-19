import request from 'supertest';
import app from '../src/app.js';

describe('Error Logging Middleware', () => {
  it('should return a 500 error and the error details', async () => {
    const res = await request(app).get('/products/error');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', 'This is a test error.');
    expect(res.body).toHaveProperty('stack');
    expect(res.body.stack).toContain('Error: This is a test error.');
  });
});
