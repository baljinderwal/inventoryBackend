import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

describe('Order APIs Enhancements', () => {
    let token;
    let supplierId = 1;
    let productId;

    beforeAll(async () => {
        await redisClient.flushall();
        // Auth
        await request(app).post('/auth/register').send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
        const loginRes = await request(app).post('/auth/login').send({ email: 'test@example.com', password: 'password123' });
        token = loginRes.body.token;

        // Create a product
        const productRes = await request(app).post('/products').set('Authorization', `Bearer ${token}`).send({ sku: 'ORDER-TEST-001', name: 'Order Test Product' });
        productId = productRes.body.id;

        // Create stock for the product
        await request(app).post('/stock').set('Authorization', `Bearer ${token}`).send({ productId: productId, quantity: 50 });

        // Create a supplier
        await request(app).post('/suppliers').set('Authorization', `Bearer ${token}`).send({ id: supplierId, name: 'Test Supplier', products: [productId] });
    });

    afterAll(async () => {
        await redisClient.quit();
        server.close();
    });

    it('should create a new order', async () => {
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                supplier: { id: supplierId, name: 'Test Supplier' },
                status: 'Pending',
                items: [{ productId: productId, quantity: 10 }],
            });
        expect(res.statusCode).toEqual(201);
    });

    it('should get all orders for a specific supplier', async () => {
        const res = await request(app)
            .get(`/orders/supplier/${supplierId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].supplier.id).toBe(supplierId);
    });

    it('should get all orders with a specific status', async () => {
        const res = await request(app)
            .get('/orders/status/Pending')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].status).toBe('Pending');
    });

    it('should return empty array for non-existent supplier', async () => {
        const res = await request(app)
            .get('/orders/supplier/999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });

    it('should return empty array for non-existent status', async () => {
        const res = await request(app)
            .get('/orders/status/NonExistent')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });
});

describe('Order Stock Validation', () => {
    let token;
    let productId;

    beforeAll(async () => {
        await redisClient.flushall();
        // Auth
        await request(app).post('/auth/register').send({ name: 'Test User 2', email: 'test2@example.com', password: 'password123' });
        const loginRes = await request(app).post('/auth/login').send({ email: 'test2@example.com', password: 'password123' });
        token = loginRes.body.token;

        // Create a product
        const productRes = await request(app).post('/products').set('Authorization', `Bearer ${token}`).send({ sku: 'STOCK-TEST-001', name: 'Stock Test Product' });
        productId = productRes.body.id;

        // Create stock for the product
        await request(app).post('/stock').set('Authorization', `Bearer ${token}`).send({ productId: productId, quantity: 100 });
    });

    it('should create an order successfully when stock is sufficient', async () => {
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerName: 'Sufficient Stock',
                items: [{ productId: productId, quantity: 10 }],
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');

        // Verify stock was decremented
        const stockRes = await request(app)
            .get(`/stock/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(stockRes.statusCode).toEqual(200);
        expect(stockRes.body.quantity).toBe(90);
    });

    it('should fail to create an order if product does not exist', async () => {
        const nonExistentProductId = 999;
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerName: 'Non-existent Product',
                items: [{ productId: nonExistentProductId, quantity: 1 }],
            });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toContain(`Product with ID ${nonExistentProductId} not found`);
    });

    it('should fail to create an order when stock is insufficient', async () => {
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerName: 'Insufficient Stock',
                items: [{ productId: productId, quantity: 101 }], // We have 90 left
            });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toContain('Insufficient stock');
    });
});
