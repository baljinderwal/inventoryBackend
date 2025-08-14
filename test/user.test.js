import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import server from '../src/server.js';

describe('User APIs', () => {
    let token;
    let userId;

    beforeAll(async () => {
        await redisClient.flushall();
        // Register and login a user to get a token
        const registerRes = await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        userId = registerRes.body.userId;

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

    it('should get all users', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
    });

    it('should get a user by id', async () => {
        const res = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body).toHaveProperty('name', 'Test User');
    });

    it('should update a user', async () => {
        const res = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Test User',
            });
        expect(res.statusCode).toEqual(200);
    });

    it('should get the updated user', async () => {
        const res = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Test User');
    });

    it('should delete a user', async () => {
        const res = await request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    it('should not find the deleted user', async () => {
        const res = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });
});
