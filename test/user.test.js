import request from 'supertest';
import app from '../src/app.js';
import * as userService from '../src/services/userService.js';
import * as authService from '../src/services/authService.js';

describe('User APIs', () => {
    let token;
    let userId;
    let emailCounter = 0;
    let email;
    let password = 'password123';

    beforeEach(async () => {
        email = `user${emailCounter}@example.com`;
        emailCounter++;
        // Register and login a user to get a token
        const user = await authService.register({
            name: 'Test User',
            email,
            password,
        });
        userId = user.id;
        token = await authService.login(email, password);
    });

    afterEach(async () => {
        await userService.deleteUser(userId);
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
        await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Test User',
            });
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
        await request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        const res = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });
});
