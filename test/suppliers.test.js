import request from 'supertest';
import app from '../src/app.js';
import * as authService from '../src/services/authService.js';
import * as supplierService from '../src/services/supplierService.js';
import * as productService from '../src/services/productService.js';

describe('Supplier APIs Enhancements', () => {
    let token;
    let productId;
    const supplierId = 1;
    let emailCounter = 0;
    let email;
    let password = 'password123';

    beforeEach(async () => {
        email = `supplier${emailCounter}@example.com`;
        emailCounter++;
        // Auth
        await authService.register({ name: 'Test User', email, password });
        token = await authService.login(email, password);

        // Create a product
        const product = await productService.createProduct({
            sku: 'TEST-001',
            name: 'Test Product',
        });
        productId = product.id;

        // Create a supplier and associate the product
        await supplierService.createSupplier({
            id: supplierId,
            name: 'Test Supplier',
            products: [productId], // product id
        });
    });

    afterEach(async () => {
        await supplierService.deleteSupplier(supplierId);
        await productService.deleteProduct(productId);
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
        await supplierService.createSupplier({
            id: newSupplierId,
            name: 'Another Supplier',
            products: [],
        });

        const res = await request(app)
            .get(`/suppliers/${newSupplierId}/products`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);

        await supplierService.deleteSupplier(newSupplierId);
    });

    it('should return an empty array for a non-existent supplier', async () => {
        const res = await request(app)
            .get('/suppliers/999/products')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(0);
    });
});
