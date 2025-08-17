import request from 'supertest';
import app from '../src/app.js';
import { expect } from '@jest/globals';

describe('Product APIs', () => {
  let token;
  let skuCounter = 0;
  let productSku;

  beforeAll(async () => {
    // Register and login an admin user to get a token
    const email = `product-test-admin@example.com`;
    const password = 'password123';
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Product Test Admin',
        email,
        password,
        role: 'admin',
      });
    const res = await request(app)
      .post('/auth/login')
      .send({
        email,
        password,
      });
    token = res.body.token;
  });

  beforeEach(() => {
    productSku = `WM-TEST-${skuCounter}`;
    skuCounter++;
  });

  it('should create a new product with the updated schema', async () => {
    const newProduct = {
      name: 'Test Wireless Mouse',
      sku: productSku,
      category: 'Electronics',
      price: 29.99,
      costPrice: 18.50,
      lowStockThreshold: 15,
      createdAt: new Date().toISOString(),
      barcode: '9876543210123',
    };

    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', newProduct.name);
    expect(res.body).toHaveProperty('sku', newProduct.sku);
    expect(res.body).toHaveProperty('lowStockThreshold', newProduct.lowStockThreshold);
    expect(res.body).toHaveProperty('barcode', newProduct.barcode);
  });

  it('should get a product by SKU', async () => {
    // First, create a product to get
    const newProduct = {
      name: 'Test Wireless Mouse for GET',
      sku: productSku,
      category: 'Electronics',
      price: 35.99,
      costPrice: 22.00,
      lowStockThreshold: 25,
      createdAt: new Date().toISOString(),
      barcode: '5432109876543',
    };
    await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);

    const res = await request(app)
      .get(`/products/${productSku}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('sku', productSku);
    expect(res.body).toHaveProperty('name', newProduct.name);
  });

  it('should update a product by SKU', async () => {
    // First, create a product to update
    const newProduct = {
      name: 'Test Mouse to Update',
      sku: productSku,
      category: 'Peripherals',
      price: 40.00,
      costPrice: 25.00,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      barcode: '1122334455667',
    };
    await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);

    const updates = {
      price: 38.50,
      lowStockThreshold: 12,
    };

    const res = await request(app)
      .put(`/products/${productSku}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product updated successfully');

    // Verify the update
    const getRes = await request(app)
      .get(`/products/${productSku}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty('price', updates.price);
    expect(getRes.body).toHaveProperty('lowStockThreshold', updates.lowStockThreshold);
  });

  it('should delete a product by SKU', async () => {
    // First, create a product to delete
    const newProduct = {
        name: 'Test Mouse to Delete',
        sku: productSku,
        category: 'Disposable',
        price: 5.00,
        costPrice: 2.00,
        lowStockThreshold: 5,
        createdAt: new Date().toISOString(),
        barcode: '9988776655443',
    };
    await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);

    const res = await request(app)
      .delete(`/products/${productSku}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product deleted successfully');

    // Verify the deletion
    const getRes = await request(app)
      .get(`/products/${productSku}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(404);
  });
});
