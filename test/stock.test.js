import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

beforeAll(async () => {
  await redisClient.flushall();
});

afterAll(async () => {
  await redisClient.quit();
  server.close();
});

describe('Stock APIs', () => {
  it('should create a new stock entry', async () => {
    const res = await request(app)
      .post('/stock')
      .send({
        productId: 1,
        quantity: 100,
        warehouse: 'A',
        batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Stock created successfully');
  });

  it('should get all stock entries', async () => {
    const res = await request(app).get('/stock');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });

  it('should get a stock entry by product id', async () => {
    const res = await request(app).get('/stock/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('productId', 1);
    expect(res.body).toHaveProperty('quantity', 100);
  });

  it('should update a stock entry', async () => {
    const res = await request(app)
      .put('/stock/1')
      .send({
        quantity: 150,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Stock updated successfully');
  });

  it('should get the updated stock entry', async () => {
    const res = await request(app).get('/stock/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('quantity', 150);
  });

  it('should delete a stock entry', async () => {
    const res = await request(app).delete('/stock/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Stock deleted successfully');
  });

  it('should not find the deleted stock entry', async () => {
    const res = await request(app).get('/stock/1');
    expect(res.statusCode).toEqual(404);
  });
});
