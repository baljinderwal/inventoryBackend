import request from 'supertest';
import app from '../src/app.js';
import { expect } from '@jest/globals';
import jwt from 'jsonwebtoken';
import * as authService from '../src/services/authService.js';

describe('Customer APIs', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const email = `customer-test-admin@example.com`;
    const password = 'password123';
    const registerRes = await authService.register({
      name: 'Customer Test Admin',
      email,
      password,
      role: 'admin',
    });

    token = await authService.login(email, password);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    userId = decodedToken.id;
  });

  it('should create a new customer and return it', async () => {
    const newCustomerData = {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '123-456-7890',
    };

    const res = await request(app)
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send(newCustomerData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/); // UUID format
    expect(res.body).toHaveProperty('name', newCustomerData.name);
    expect(res.body).toHaveProperty('email', newCustomerData.email);
  });

  it('should get a customer by their ID', async () => {
    // First, create a customer
    const newCustomerData = {
      name: 'Test Customer for GET',
      email: 'customerget@test.com',
    };
    const createRes = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(newCustomerData);

    const customerId = createRes.body.id;

    const res = await request(app)
      .get(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', customerId);
    expect(res.body).toHaveProperty('name', newCustomerData.name);
  });

  it('should update a customer by their ID', async () => {
    // First, create a customer
    const newCustomerData = {
      name: 'Test Customer to Update',
      email: 'customerupdate@test.com',
    };
    const createRes = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(newCustomerData);

    const customerId = createRes.body.id;

    const updates = {
      name: 'Updated Customer Name',
      phone: '987-654-3210',
    };

    const res = await request(app)
      .put(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Customer updated successfully');

    // Verify the update
    const getRes = await request(app)
      .get(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty('name', updates.name);
    expect(getRes.body).toHaveProperty('phone', updates.phone);
  });

  it('should delete a customer by their ID', async () => {
    // First, create a customer
    const newCustomerData = {
        name: 'Test Customer to Delete',
        email: 'customerdelete@test.com',
    };
    const createRes = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(newCustomerData);

    const customerId = createRes.body.id;

    const res = await request(app)
      .delete(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Customer deleted successfully');

    // Verify the deletion
    const getRes = await request(app)
      .get(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should get all customers for a user', async () => {
    // Create a couple of customers
    await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Customer A', email: 'a@test.com' });
    await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Customer B', email: 'b@test.com' });

    const res = await request(app)
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
