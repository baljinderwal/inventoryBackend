import request from 'supertest';
import app from '../src/app.js';
import { expect } from '@jest/globals';
import https from 'https';
import * as timeseriesService from '../src/services/timeseriesService.js';

const createBucket = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      orgID: process.env.INFLUXDB_ORG,
      name: process.env.INFLUXDB_BUCKET,
      retentionRules: [{ type: 'expire', everySeconds: 86400 * 30 }], // 30 days
    });

    const options = {
      hostname: new URL(process.env.INFLUXDB_URL).hostname,
      port: 443,
      path: '/api/v2/buckets',
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.INFLUXDB_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      // Buckets API returns 201 on success, 422 if bucket already exists.
      // Both are acceptable for our test setup.
      if (res.statusCode === 201 || res.statusCode === 422) {
        resolve();
      } else {
        let responseBody = '';
        res.on('data', (chunk) => {
            responseBody += chunk;
        });
        res.on('end', () => {
            console.error('Error creating bucket:', responseBody);
            reject(new Error(`Failed to create bucket: ${res.statusCode}`));
        });
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};


describe('Timeseries API', () => {
  let token;

  beforeAll(async () => {
    await createBucket();
    // Register and login a user to get a token
    const email = `timeseries-test@example.com`;
    const password = 'password123';
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Timeseries Test User',
        email,
        password,
        role: 'Admin',
      });
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email,
        password,
      });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await timeseriesService.close();
  });

  it('should add a shoe to the timeseries data', async () => {
    const res = await request(app)
      .post('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '10', color: 'blue', quantity: 100 });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Shoe data added successfully');
  });

  it('should not add a shoe if required fields are missing', async () => {
    const res = await request(app)
        .post('/timeseries/shoes')
        .set('Authorization', `Bearer ${token}`)
        .send({ size: '10' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields: size, color, quantity');
  });

  it('should get all available shoes', async () => {
    await request(app)
      .post('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '9', color: 'red', quantity: 50 });

    const res = await request(app)
      .get('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    const redShoes = res.body.filter(shoe => shoe.color === 'red');
    expect(redShoes.length).toBeGreaterThanOrEqual(1);
  });

  it('should get shoes filtered by size', async () => {
    await request(app)
      .post('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '11', color: 'green', quantity: 20 });

    const res = await request(app)
      .get('/timeseries/shoes?size=11')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].size).toBe('11');
  });

  it('should get shoes filtered by color', async () => {
    await request(app)
      .post('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '12', color: 'black', quantity: 30 });

    const res = await request(app)
      .get('/timeseries/shoes?color=black')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].color).toBe('black');
  });

  it('should sell a shoe and it should not appear in get requests', async () => {
    // Add a shoe
    await request(app)
      .post('/timeseries/shoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '8', color: 'white', quantity: 10 });

    // Sell the shoe
    const res = await request(app)
      .post('/timeseries/shoes/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({ size: '8', color: 'white' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Shoe sold successfully');

    // Verify it's not returned in get requests
    const getRes = await request(app)
        .get('/timeseries/shoes?size=8&color=white')
        .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.length).toBe(0);
  });
});
