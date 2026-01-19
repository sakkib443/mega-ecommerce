// ===================================================================
// Mega E-Commerce Backend - API Integration Tests
// End-to-end tests for API endpoints
// ===================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { generateTestToken } from '../setup';
import mongoose from 'mongoose';

describe('API Integration Tests', () => {
    // ==================== Health Check Tests ====================
    describe('Health Check', () => {
        it('GET / should return server status', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('running');
        });

        it('GET /api/health should return health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.uptime).toBeDefined();
        });
    });

    // ==================== Auth API Tests ====================
    describe('Auth API', () => {
        const testEmail = `api-test-${Date.now()}@example.com`;
        const testPassword = 'SecurePass123!';
        let accessToken: string;

        it('POST /api/auth/register should create new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'API',
                    lastName: 'Test',
                    email: testEmail,
                    password: testPassword,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.tokens).toBeDefined();

            accessToken = response.body.data.tokens.accessToken;
        });

        it('POST /api/auth/register should fail with existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Duplicate',
                    lastName: 'User',
                    email: testEmail,
                    password: 'AnotherPass123!',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('POST /api/auth/login should authenticate user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.tokens.accessToken).toBeDefined();
        });

        it('POST /api/auth/login should fail with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'WrongPassword123!',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('GET /api/users/me should return current user', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(testEmail);
        });

        it('GET /api/users/me should fail without token', async () => {
            const response = await request(app).get('/api/users/me');

            expect(response.status).toBe(401);
        });
    });

    // ==================== Product API Tests ====================
    describe('Product API', () => {
        it('GET /api/products should return product list', async () => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('GET /api/products should support pagination', async () => {
            const response = await request(app)
                .get('/api/products')
                .query({ page: 1, limit: 5 });

            expect(response.status).toBe(200);
            expect(response.body.meta).toBeDefined();
            expect(response.body.meta.page).toBe(1);
            expect(response.body.meta.limit).toBe(5);
        });

        it('GET /api/products/:id should return 404 for invalid id', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const response = await request(app).get(`/api/products/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    // ==================== Category API Tests ====================
    describe('Category API', () => {
        it('GET /api/categories should return category list', async () => {
            const response = await request(app).get('/api/categories');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('GET /api/categories/tree should return category tree', async () => {
            const response = await request(app).get('/api/categories/tree');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ==================== Protected Route Tests ====================
    describe('Protected Routes', () => {
        const adminToken = generateTestToken(
            new mongoose.Types.ObjectId().toString(),
            'admin'
        );
        const customerToken = generateTestToken(
            new mongoose.Types.ObjectId().toString(),
            'customer'
        );

        it('Admin routes should be accessible by admin', async () => {
            const response = await request(app)
                .get('/api/orders/admin/all')
                .set('Authorization', `Bearer ${adminToken}`);

            // Should not return 403 (forbidden)
            expect(response.status).not.toBe(403);
        });

        it('Admin routes should be blocked for customers', async () => {
            const response = await request(app)
                .get('/api/orders/admin/all')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(403);
        });
    });

    // ==================== Cart API Tests ====================
    describe('Cart API', () => {
        let customerToken: string;

        beforeAll(() => {
            customerToken = generateTestToken(
                new mongoose.Types.ObjectId().toString(),
                'customer'
            );
        });

        it('GET /api/cart should return user cart', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    // ==================== Error Handling Tests ====================
    describe('Error Handling', () => {
        it('Should return 404 for unknown routes', async () => {
            const response = await request(app).get('/api/unknown-route');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('Should handle invalid JSON body', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }');

            expect(response.status).toBe(400);
        });

        it('Should validate request body', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    // Missing required fields
                    email: 'invalid-email',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
