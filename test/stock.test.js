import request from 'supertest';
import app from '../src/app.js';
import * as authService from '../src/services/authService.js';
import * as stockService from '../src/services/stockService.js';

describe('Stock APIs', () => {
    let token;
    let emailCounter = 0;
    let email;
    let password = 'password123';

    beforeEach(async () => {
        email = `stock${emailCounter}@example.com`;
        emailCounter++;
        // Register and login a user to get a token
        await authService.register({
            name: 'Test User',
            email,
            password,
        });
        token = await authService.login(email, password);
    });

    afterEach(async () => {
        await stockService.deleteStock(1);
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
        await stockService.createStock({
            productId: 1,
            quantity: 100,
            warehouse: 'A',
            batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
        });
        const res = await request(app)
            .get('/stock')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
    });

    it('should get a stock entry by product id', async () => {
        await stockService.createStock({
            productId: 1,
            quantity: 100,
            warehouse: 'A',
            batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
        });
        const res = await request(app)
            .get('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('productId', 1);
        expect(res.body).toHaveProperty('quantity', 100);
    });

    it('should update a stock entry', async () => {
        await stockService.createStock({
            productId: 1,
            quantity: 100,
            warehouse: 'A',
            batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
        });
        const res = await request(app)
            .put('/stock/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 150,
            });
        expect(res.statusCode).toEqual(200);
    });

    it('should get the updated stock entry', async () => {
        await stockService.createStock({
            productId: 1,
            quantity: 100,
            warehouse: 'A',
            batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
        });
        await stockService.updateStock(1, { quantity: 150 });
        const res = await request(app)
            .get('/stock/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('quantity', 150);
    });

    it('should delete a stock entry', async () => {
        await stockService.createStock({
            productId: 1,
            quantity: 100,
            warehouse: 'A',
            batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31T23:59:59Z', quantity: 100 }],
        });
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
