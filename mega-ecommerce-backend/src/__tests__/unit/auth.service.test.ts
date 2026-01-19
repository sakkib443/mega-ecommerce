// ===================================================================
// Mega E-Commerce Backend - Auth Service Tests
// Unit tests for authentication functionality
// ===================================================================

import { describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import AuthService from '../../app/modules/auth/auth.service';
import type { TRegisterInput } from '../../app/modules/auth/auth.validation';

// Helper to create test user data with all required fields
const createTestUser = (overrides: Partial<TRegisterInput> = {}): TRegisterInput => ({
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    password: 'SecurePass123!',
    role: 'customer',
    ...overrides,
});

describe('Auth Service', () => {
    // ==================== Register Tests ====================
    describe('register', () => {
        it('should successfully register a new user', async () => {
            const userData = createTestUser({
                firstName: 'John',
                lastName: 'Doe',
            });

            const result = await AuthService.register(userData);

            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(userData.email);
            expect(result.user.firstName).toBe(userData.firstName);
            expect(result.tokens).toBeDefined();
            expect(result.tokens.accessToken).toBeDefined();
            expect(result.tokens.refreshToken).toBeDefined();
        });

        it('should throw error if email already exists', async () => {
            const email = `duplicate-${Date.now()}@example.com`;

            // First registration
            await AuthService.register(createTestUser({ email }));

            // Second registration with same email
            await expect(
                AuthService.register(createTestUser({ email }))
            ).rejects.toThrow('Email already registered');
        });
    });

    // ==================== Login Tests ====================
    describe('login', () => {
        let testEmail: string;
        const testPassword = 'TestPassword123!';

        beforeEach(async () => {
            testEmail = `login-test-${Date.now()}@example.com`;
            await AuthService.register(createTestUser({
                email: testEmail,
                password: testPassword,
            }));
        });

        it('should successfully login with valid credentials', async () => {
            const result = await AuthService.login({
                email: testEmail,
                password: testPassword,
            });

            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(testEmail);
            expect(result.tokens.accessToken).toBeDefined();
        });

        it('should throw error for invalid email', async () => {
            await expect(
                AuthService.login({
                    email: 'nonexistent@example.com',
                    password: testPassword,
                })
            ).rejects.toThrow('Invalid email or password');
        });

        it('should throw error for invalid password', async () => {
            await expect(
                AuthService.login({
                    email: testEmail,
                    password: 'WrongPassword123!',
                })
            ).rejects.toThrow('Invalid email or password');
        });
    });

    // ==================== Token Tests ====================
    describe('generateTokens', () => {
        it('should generate valid access and refresh tokens', () => {
            const payload = {
                userId: new mongoose.Types.ObjectId().toString(),
                email: 'test@example.com',
                role: 'customer' as const,
            };

            const tokens = AuthService.generateTokens(payload);

            expect(tokens).toBeDefined();
            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
        });
    });

    // ==================== Refresh Token Tests ====================
    describe('refreshToken', () => {
        it('should generate new tokens from valid refresh token', async () => {
            const registerResult = await AuthService.register(createTestUser({
                firstName: 'Refresh',
                lastName: 'Test',
            }));
            const newTokens = await AuthService.refreshToken(registerResult.tokens.refreshToken);

            expect(newTokens).toBeDefined();
            expect(newTokens.accessToken).toBeDefined();
            expect(newTokens.refreshToken).toBeDefined();
        });

        it('should throw error for invalid refresh token', async () => {
            await expect(
                AuthService.refreshToken('invalid-token')
            ).rejects.toThrow();
        });
    });

    // ==================== Password Tests ====================
    describe('updatePassword', () => {
        it('should successfully update password', async () => {
            const email = `password-${Date.now()}@example.com`;
            const result = await AuthService.register(createTestUser({
                email,
                password: 'OldPassword123!',
            }));

            await AuthService.updatePassword(
                result.user._id,
                'OldPassword123!',
                'NewPassword456!'
            );

            // Should be able to login with new password
            const loginResult = await AuthService.login({
                email,
                password: 'NewPassword456!',
            });

            expect(loginResult.user.email).toBe(email);
        });

        it('should throw error for wrong current password', async () => {
            const result = await AuthService.register(createTestUser({
                password: 'CurrentPass123!',
            }));

            await expect(
                AuthService.updatePassword(
                    result.user._id,
                    'WrongCurrentPass!',
                    'NewPassword456!'
                )
            ).rejects.toThrow('Current password is incorrect');
        });
    });
});
