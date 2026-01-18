// ===================================================================
// Mega E-Commerce Backend - Swagger/OpenAPI Configuration
// API Documentation Setup
// ===================================================================

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import config from './app/config';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Mega E-Commerce API',
        version: '2.0.0',
        description: `
## 🛒 Mega E-Commerce Backend API

A comprehensive e-commerce backend API with all the features you need to run a modern online store.

### Features:
- 🔐 **Authentication** - JWT-based auth with refresh tokens
- 👥 **User Management** - Customer, Admin, Super Admin roles
- 📦 **Products** - Full CRUD with variations, inventory
- 📂 **Categories** - Hierarchical category structure
- 🛒 **Cart** - Persistent shopping cart
- ❤️ **Wishlist** - Save favorites with price alerts
- 📋 **Orders** - Complete order lifecycle management
- 💳 **Payments** - SSLCommerz, bKash, COD integration
- 🚚 **Shipping** - Zones, rates, and tracking
- ⭐ **Reviews** - Product reviews with ratings
- 🏷️ **Coupons** - Discount code management
- 📧 **Notifications** - Email and in-app notifications
- 📊 **Analytics** - Sales and customer reports

### Authentication
Use Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`
        `,
        contact: {
            name: 'API Support',
            email: 'support@megaecommerce.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: `http://localhost:${config.port}`,
            description: 'Development Server',
        },
        {
            url: 'https://mega-ecommerce-api.vercel.app',
            description: 'Production Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            // Common Schemas
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error message' },
                    errorMessages: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                path: { type: 'string' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 10 },
                },
            },

            // Auth Schemas
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', minLength: 6, example: 'password123' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                        type: 'object',
                        properties: {
                            user: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    email: { type: 'string' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    role: { type: 'string', enum: ['customer', 'admin', 'super_admin'] },
                                },
                            },
                            tokens: {
                                type: 'object',
                                properties: {
                                    accessToken: { type: 'string' },
                                    refreshToken: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },

            // Product Schemas
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    comparePrice: { type: 'number' },
                    thumbnail: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    category: { type: 'string' },
                    quantity: { type: 'integer' },
                    status: { type: 'string', enum: ['active', 'draft', 'archived'] },
                    rating: { type: 'number' },
                    reviewCount: { type: 'integer' },
                },
            },
            CreateProduct: {
                type: 'object',
                required: ['name', 'description', 'price', 'thumbnail', 'category'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    comparePrice: { type: 'number' },
                    thumbnail: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    category: { type: 'string' },
                    quantity: { type: 'integer', default: 0 },
                    status: { type: 'string', enum: ['active', 'draft'], default: 'draft' },
                },
            },

            // Order Schemas
            Order: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    orderNumber: { type: 'string' },
                    user: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product: { type: 'string' },
                                name: { type: 'string' },
                                quantity: { type: 'integer' },
                                price: { type: 'number' },
                            },
                        },
                    },
                    total: { type: 'number' },
                    status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
                    paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
                },
            },

            // Cart Schemas
            Cart: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    user: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product: { type: 'string' },
                                quantity: { type: 'integer' },
                            },
                        },
                    },
                    totalItems: { type: 'integer' },
                    totalPrice: { type: 'number' },
                },
            },
        },
    },
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Products', description: 'Product catalog management' },
        { name: 'Categories', description: 'Category management' },
        { name: 'Cart', description: 'Shopping cart operations' },
        { name: 'Wishlist', description: 'User wishlist' },
        { name: 'Orders', description: 'Order management' },
        { name: 'Payments', description: 'Payment processing' },
        { name: 'Shipping', description: 'Shipping and delivery' },
        { name: 'Reviews', description: 'Product reviews' },
        { name: 'Coupons', description: 'Discount coupons' },
        { name: 'Analytics', description: 'Reports and analytics (Admin)' },
    ],
    paths: {
        // Auth Endpoints
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                    401: { description: 'Invalid credentials' },
                },
            },
        },

        // Products Endpoints
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'Get all products',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'minPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price-low', 'price-high', 'rating'] } },
                ],
                responses: {
                    200: { description: 'Products fetched successfully' },
                },
            },
            post: {
                tags: ['Products'],
                summary: 'Create a new product (Admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateProduct' },
                        },
                    },
                },
                responses: {
                    201: { description: 'Product created' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden - Admin only' },
                },
            },
        },
        '/api/products/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Product details' },
                    404: { description: 'Product not found' },
                },
            },
        },

        // Cart Endpoints
        '/api/cart': {
            get: {
                tags: ['Cart'],
                summary: 'Get user cart',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Cart fetched' },
                },
            },
        },
        '/api/cart/add': {
            post: {
                tags: ['Cart'],
                summary: 'Add item to cart',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId', 'quantity'],
                                properties: {
                                    productId: { type: 'string' },
                                    quantity: { type: 'integer', minimum: 1 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Item added to cart' },
                },
            },
        },

        // Orders Endpoints
        '/api/orders': {
            get: {
                tags: ['Orders'],
                summary: 'Get user orders',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Orders fetched' },
                },
            },
            post: {
                tags: ['Orders'],
                summary: 'Create order from cart',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Order created' },
                },
            },
        },

        // Payments Endpoints
        '/api/payments': {
            post: {
                tags: ['Payments'],
                summary: 'Initiate payment',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderId', 'method'],
                                properties: {
                                    orderId: { type: 'string' },
                                    method: { type: 'string', enum: ['sslcommerz', 'bkash', 'cod'] },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Payment initiated' },
                },
            },
        },
    },
};

const options = {
    swaggerDefinition,
    apis: ['./src/app/modules/**/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    // Swagger UI
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customCss: `
                .swagger-ui .topbar { display: none }
                .swagger-ui .info { margin-bottom: 20px }
                .swagger-ui .info .title { color: #2563eb }
            `,
            customSiteTitle: 'Mega E-Commerce API Docs',
            customfavIcon: '/favicon.ico',
        })
    );

    // JSON spec endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 API Documentation available at /api-docs');
};

export default swaggerSpec;
