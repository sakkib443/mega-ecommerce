// ===================================================================
// Mega E-Commerce Backend - Security Middleware
// Rate Limiting, Security Headers, and Protection
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import AppError from '../utils/AppError';

// ==================== RATE LIMITERS ====================

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after 1 hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Order creation limiter
export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 orders per hour
    message: {
        success: false,
        message: 'Order limit exceeded, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment limiter (very strict)
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour
    message: {
        success: false,
        message: 'Payment attempt limit exceeded, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Search limiter
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        success: false,
        message: 'Too many search requests, please slow down',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Review limiter
export const reviewLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 reviews per day
    message: {
        success: false,
        message: 'Review limit exceeded for today, please try again tomorrow',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ==================== SECURITY MIDDLEWARES ====================

// Security headers using helmet
export const securityHeaders = helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
});

// Prevent NoSQL injection
export const sanitizeData = mongoSanitize();

// XSS Protection - sanitize user input
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
    // Simple XSS sanitization for string values in body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query as any);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

// Helper function to sanitize object
const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
        return obj
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
        }
        const sanitized: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    return obj;
};

// Request size limiter
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB max

    if (contentLength > maxSize) {
        throw new AppError(413, 'Request entity too large');
    }
    next();
};

// Suspicious activity detector
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction): void => {
    const userAgent = req.headers['user-agent'] || '';

    // Block known bad bots/crawlers
    const blockedAgents = [
        'curl/',
        'wget/',
        'python-requests/',
        'go-http-client/',
        'scrapy',
        'spider',
        'bot',
    ];

    // Only block if no user agent or matches blocked patterns
    // Comment out for development
    // const isBlocked = blockedAgents.some(agent => 
    //     userAgent.toLowerCase().includes(agent.toLowerCase())
    // );

    // if (!userAgent || isBlocked) {
    //     throw new AppError(403, 'Access denied');
    // }

    next();
};

// API version check
export const apiVersionCheck = (req: Request, res: Response, next: NextFunction): void => {
    const apiVersion = req.headers['x-api-version'];

    // If version header is provided, validate it
    if (apiVersion && apiVersion !== 'v1' && apiVersion !== 'v2') {
        throw new AppError(400, 'Invalid API version');
    }

    next();
};

// Log security events
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
    // Log failed auth attempts, suspicious activities, etc.
    res.on('finish', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.log(`[SECURITY] ${new Date().toISOString()} | ${req.ip} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | UA: ${req.headers['user-agent']}`);
        }
    });
    next();
};

// Combine all security middlewares
export const applySecurityMiddleware = (app: any): void => {
    // Security headers
    app.use(securityHeaders);

    // Prevent NoSQL injection
    app.use(sanitizeData);

    // XSS protection
    app.use(xssProtection);

    // Request size limiter
    app.use(requestSizeLimiter);

    // Security logging
    app.use(securityLogger);

    // API version check
    app.use(apiVersionCheck);

    // Apply rate limiters to specific routes
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/auth/forgot-password', passwordResetLimiter);
    app.use('/api/auth/reset-password', passwordResetLimiter);
    app.use('/api/orders', orderLimiter);
    app.use('/api/payments', paymentLimiter);
    app.use('/api/products/search', searchLimiter);
    app.use('/api/reviews', reviewLimiter);

    // General rate limiter for all other routes
    app.use('/api/', generalLimiter);
};

export default {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    orderLimiter,
    paymentLimiter,
    searchLimiter,
    reviewLimiter,
    securityHeaders,
    sanitizeData,
    xssProtection,
    requestSizeLimiter,
    suspiciousActivityDetector,
    apiVersionCheck,
    securityLogger,
    applySecurityMiddleware,
};
