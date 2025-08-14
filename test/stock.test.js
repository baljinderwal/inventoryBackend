import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

describe('Stock APIs', () => {
    let token;

    beforeAll(async () => {
        await redisClient.flushall();
        // Register and login a user to get a token
        await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await redisClient.quit();
        server.close();
    });

    it('should create a new stock entry', async () => {
        const res = await request(app)
            .post('/stock')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: 1,
                quantity: 100,
                warehouse: 'A',
                batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
            });
        expect(res.statusCode).toEqual(201);
    });

    it('should get all stock entries', async () => {
        const res = await request(app)
            .get('/stock')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
    });

    it('should get a stock entry by product id', async () => {
        const res = await request(app)
            .get('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('productId', 1);
        expect(res.body).toHaveProperty('quantity', 100);
    });

    it('should update a stock entry', async () => {
        const res = await request(app)
            .put('/stock/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 150,
            });
        expect(res.statusCode).toEqual(200);
    });

    it('should get the updated stock entry', async () => {
        const res = await request(app)
            .get('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('quantity', 150);
    });

    it('should delete a stock entry', async () => {
        const res = await request(app)
            .delete('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    it('should not find the deleted stock entry', async () => {
        const res = await request(app)
            .get('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });
});
