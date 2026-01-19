// ===================================================================
// Mega E-Commerce Backend - Jest Configuration
// Professional testing setup with TypeScript support
// ===================================================================

/** @type {import('jest').Config} */
module.exports = {
    // Use ts-jest for TypeScript
    preset: 'ts-jest',

    // Test environment
    testEnvironment: 'node',

    // Root directory
    roots: ['<rootDir>/src'],

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
    ],

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Transform TypeScript files
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
        '!src/scripts/**',
        '!src/**/__tests__/**',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

    // Module name mapper for aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/app/config/$1',
        '^@modules/(.*)$': '<rootDir>/src/app/modules/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/app/middlewares/$1',
        '^@utils/(.*)$': '<rootDir>/src/app/utils/$1',
    },

    // Test timeout
    testTimeout: 30000,

    // Verbose output
    verbose: true,

    // Force exit after tests complete
    forceExit: true,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Global teardown
    globalTeardown: '<rootDir>/src/__tests__/teardown.ts',
};
