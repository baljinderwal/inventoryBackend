import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

describe('Supplier APIs Enhancements', () => {
    let token;
    let productId;
    const supplierId = 1;

    beforeAll(async () => {
        await redisClient.flushall();
        // Auth
        await request(app).post('/auth/register').send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
        const loginRes = await request(app).post('/auth/login').send({ email: 'test@example.com', password: 'password123' });
        token = loginRes.body.token;

        // Create a product
        const productRes = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                sku: 'TEST-001',
                name: 'Test Product',
            });
        productId = productRes.body.id;

        // Create a supplier and associate the product
        await request(app)
            .post('/suppliers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: supplierId,
                name: 'Test Supplier',
                products: [productId], // product id
            });
    });

    afterAll(async () => {
        await redisClient.quit();
        server.close();
    });

    it('should get all products for a specific supplier', async () => {
        const res = await request(app)
            .get(`/suppliers/${supplierId}/products`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(productId);
        expect(res.body[0].name).toBe('Test Product');
    });

    it('should return an empty array for a supplier with no products', async () => {
        // Create a supplier with no products
        const newSupplierId = 2;
        await request(app)
            .post('/suppliers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: newSupplierId,
                name: 'Another Supplier',
                products: [],
            });

        const res = await request(app)
            .get(`/suppliers/${newSupplierId}/products`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });

    it('should return an empty array for a non-existent supplier', async () => {
        const res = await request(app)
            .get('/suppliers/999/products')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });
});
