import request from 'supertest';
import app from '../src/app.js';
import { expect, jest } from '@jest/globals';

describe('Product APIs', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Register and login an admin user to get a token
    const email = `product-test-admin@example.com`;
    const password = 'password123';
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Product Test Admin',
        email,
        password,
        role: 'Admin',
      });
    userId = registerRes.body.userId;
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email,
        password,
      });
    token = loginRes.body.token;
  });

  it('should create a new product and return it', async () => {
    const newProductData = {
      name: 'Test Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      costPrice: 18.50,
      lowStockThreshold: 15,
      barcode: '9876543210123',
      sku: 'TWM-001',
    };

    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProductData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/); // UUID format
    expect(res.body).toHaveProperty('name', newProductData.name);
    expect(res.body).toHaveProperty('price', newProductData.price);
  });

  it('should create a new product and trigger timeseries calls for each size', async () => {
    const newProductData = {
      name: 'Test Shoes',
      category: 'Footwear',
      price: 120.00,
      color: 'Red',
      sizes: [9, 10, 11],
      sku: 'SHOE-RED-TEST',
    };

    // Spy on the global fetch
    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy.mockResolvedValue({ ok: true }); // Mock a successful response

    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProductData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(newProductData.name);

    // Verify fetch was called for each size
    expect(fetchSpy).toHaveBeenCalledTimes(newProductData.sizes.length);

    for (const size of newProductData.sizes) {
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://inventorybackend-loop.onrender.com/timeseries/shoes',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            size,
            color: newProductData.color,
            quantity: 1,
            product_sku: newProductData.sku,
          }),
        })
      );
    }

    // Restore the original fetch
    fetchSpy.mockRestore();
  });

  it('should get a product by its ID', async () => {
    // First, create a product
    const newProductData = {
      name: 'Test Mouse for GET',
      category: 'Electronics',
      price: 35.99,
    };
    const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProductData);

    const productId = createRes.body.id;

    const res = await request(app)
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', productId);
    expect(res.body).toHaveProperty('name', newProductData.name);
  });

  it('should update a product by its ID', async () => {
    // First, create a product
    const newProductData = {
      name: 'Test Mouse to Update',
      category: 'Peripherals',
      price: 40.00,
    };
    const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProductData);

    const productId = createRes.body.id;

    const updates = {
      price: 38.50,
      lowStockThreshold: 12,
    };

    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product updated successfully');

    // Verify the update
    const getRes = await request(app)
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty('price', updates.price);
    expect(getRes.body).toHaveProperty('lowStockThreshold', updates.lowStockThreshold);
  });

  it('should delete a product by its ID', async () => {
    // First, create a product
    const newProductData = {
        name: 'Test Mouse to Delete',
        category: 'Disposable',
        price: 5.00,
    };
    const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProductData);

    const productId = createRes.body.id;

    const res = await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product deleted successfully');

    // Verify the deletion
    const getRes = await request(app)
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should get all products for a user', async () => {
    // Create a couple of products
    await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Product A' });
    await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Product B' });

    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // This assertion depends on the state of redis, so we check for at least the two we created.
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
