import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

beforeAll(async () => {
  await redisClient.flushall();

  // Create a product
  await request(app)
    .post('/products')
    .send({
      id: 1,
      sku: 'TEST-001',
      name: 'Test Product',
    });

  // Create a supplier and associate the product
  await request(app)
    .post('/suppliers')
    .send({
      id: 1,
      name: 'Test Supplier',
      products: [1], // product id
    });
});

afterAll(async () => {
  await redisClient.quit();
  server.close();
});

describe('Supplier APIs Enhancements', () => {
  it('should get all products for a specific supplier', async () => {
    const res = await request(app).get('/suppliers/1/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(1);
    expect(res.body[0].name).toBe('Test Product');
  });

  it('should return an empty array for a supplier with no products', async () => {
    // Create a supplier with no products
    await request(app)
      .post('/suppliers')
      .send({
        id: 2,
        name: 'Another Supplier',
        products: [],
      });

    const res = await request(app).get('/suppliers/2/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });

  it('should return an empty array for a non-existent supplier', async () => {
    const res = await request(app).get('/suppliers/999/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });
});
