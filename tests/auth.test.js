const { test, expect } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
    test('should reject registration with invalid data', async() => {
        const response = await request (app)
        .post('/api/auth/register')
        .send({
            username: 'ab',
            email: 'not-an-email',
            password: '123',
        });

        expect(response.statusCode).toBe(400);
    });
});