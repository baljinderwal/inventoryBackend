import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

beforeAll(async () => {
  await redisClient.flushall();

  // Create a supplier
  await request(app)
    .post('/suppliers')
    .send({
      id: 1,
      name: 'Test Supplier',
      products: [1],
    });

  // Create a product
  await request(app)
    .post('/products')
    .send({
      id: 1,
      sku: 'TEST-001',
      name: 'Test Product',
    });
});

afterAll(async () => {
  await redisClient.quit();
  server.close();
});

describe('Order APIs Enhancements', () => {
  let orderId;

  it('should create a new order', async () => {
    const res = await request(app)
      .post('/orders')
      .send({
        supplier: { id: 1, name: 'Test Supplier' },
        status: 'Pending',
        products: [{ productId: 1, quantity: 10 }],
      });
    expect(res.statusCode).toEqual(201);
    orderId = res.body.id;
  });

  it('should get all orders for a specific supplier', async () => {
    const res = await request(app).get('/orders/supplier/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].supplier.id).toBe(1);
  });

  it('should get all orders with a specific status', async () => {
    const res = await request(app).get('/orders/status/Pending');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('Pending');
  });

  it('should return empty array for non-existent supplier', async () => {
    const res = await request(app).get('/orders/supplier/999');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });

  it('should return empty array for non-existent status', async () => {
    const res = await request(app).get('/orders/status/NonExistent');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });
});
