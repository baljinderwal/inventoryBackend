import request from 'supertest';
import app from '../src/app.js';
import * as authService from '../src/services/authService.js';
import * as supplierService from '../src/services/supplierService.js';
import * as productService from '../src/services/productService.js';
import jwt from 'jsonwebtoken';
import redisClient from '../src/config/redisClient.js';

describe('Supplier APIs Enhancements', () => {
    let token;
    let productId;
    let userId;
    let supplierId;
    let emailCounter = 0;
    let email;
    let password = 'password123';

    beforeEach(async () => {
        email = `supplier${emailCounter}@example.com`;
        emailCounter++;
        // Auth
        const userRegistered = await authService.register({ name: 'Test User', email, password });
        token = await authService.login(email, password);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        userId = decodedToken.id;

        // Create a product
        const product = await productService.createProduct(userId, {
            sku: 'TEST-001',
            name: 'Test Product',
        });
        productId = product.id;

        // Create a supplier and associate the product
        const newSupplier = await supplierService.createSupplier(userId, {
            name: 'Test Supplier',
            products: [productId], // product id
        });
        supplierId = newSupplier.id;
    });

    afterEach(async () => {
        // Clean up the database
        await redisClient.flushall();
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
        const newSupplier = await supplierService.createSupplier(userId, {
            name: 'Another Supplier',
            products: [],
        });
        const newSupplierId = newSupplier.id;

        const res = await request(app)
            .get(`/suppliers/${newSupplierId}/products`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });

    it('should return an empty array for a non-existent supplier', async () => {
        const res = await request(app)
            .get('/suppliers/a-non-existent-id/products')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });
});
