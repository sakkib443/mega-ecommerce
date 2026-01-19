// ===================================================================
// Mega E-Commerce Backend - Test Setup
// Global test configuration and utilities
// ===================================================================

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// ==================== Global Setup ====================
beforeAll(async () => {
    // Create in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    console.log('✅ Test database connected');
});

// ==================== Clean Up After Each Test ====================
afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ==================== Global Teardown ====================
afterAll(async () => {
    // Close database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();

    console.log('✅ Test database disconnected');
});

// ==================== Test Utilities ====================
export const testUtils = {
    // Generate random email
    randomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`,

    // Generate random phone
    randomPhone: () => `+8801${Math.floor(Math.random() * 900000000 + 100000000)}`,

    // Wait for a specified time
    wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

    // Create test user data
    createTestUserData: (overrides = {}) => ({
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@test.com`,
        password: 'Test@123456',
        phone: '+8801712345678',
        ...overrides,
    }),

    // Create test product data
    createTestProductData: (categoryId: string, overrides = {}) => ({
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'This is a test product description',
        shortDescription: 'Test product',
        price: 999,
        comparePrice: 1299,
        quantity: 100,
        category: categoryId,
        thumbnail: 'https://example.com/image.jpg',
        status: 'active',
        ...overrides,
    }),

    // Create test category data
    createTestCategoryData: (overrides = {}) => ({
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        description: 'Test category description',
        status: 'active',
        ...overrides,
    }),

    // Create test order data
    createTestOrderData: (userId: string, productData: any, overrides = {}) => ({
        user: userId,
        items: [
            {
                product: productData._id,
                name: productData.name,
                price: productData.price,
                quantity: 1,
                subtotal: productData.price,
            },
        ],
        subtotal: productData.price,
        shippingCost: 60,
        total: productData.price + 60,
        shippingAddress: {
            fullName: 'Test User',
            phone: '+8801712345678',
            street: '123 Test Street',
            city: 'Dhaka',
            state: 'Dhaka',
            zipCode: '1000',
            country: 'Bangladesh',
        },
        paymentMethod: 'cod',
        ...overrides,
    }),
};

// ==================== Mock JWT Token Generator ====================
import jwt from 'jsonwebtoken';

export const generateTestToken = (userId: string, role: 'super_admin' | 'admin' | 'customer' = 'customer') => {
    return jwt.sign(
        {
            userId,
            email: 'test@test.com',
            role,
        },
        process.env.JWT_ACCESS_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
    );
};

// ==================== Suppress Console During Tests ====================
if (process.env.NODE_ENV === 'test') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        // Keep error and warn for debugging
        // error: jest.fn(),
        // warn: jest.fn(),
    };
}
