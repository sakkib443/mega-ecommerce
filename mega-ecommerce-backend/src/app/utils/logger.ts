// ===================================================================
// Mega E-Commerce Backend - Professional Winston Logger
// Production-grade logging system with file rotation & multiple transports
// ===================================================================

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import config from '../config';

// ==================== Custom Log Levels ====================
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// ==================== Log Format ====================
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add meta data if present
        if (Object.keys(meta).length > 0) {
            log += ` | ${JSON.stringify(meta)}`;
        }

        // Add stack trace for errors
        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

// ==================== Console Format (Colorized) ====================
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} ${level}: ${message}`;
        if (Object.keys(meta).length > 0 && !meta.stack) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// ==================== JSON Format for Production ====================
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// ==================== Define Log Directory ====================
const logDir = path.join(process.cwd(), 'logs');

// ==================== Transports ====================
const transports: winston.transport[] = [];

// Console Transport (Always)
transports.push(
    new winston.transports.Console({
        level: config.env === 'development' ? 'debug' : 'info',
        format: consoleFormat,
    })
);

// File Transports (Production/Development)
if (config.env !== 'test') {
    // Combined logs - all logs
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d', // Keep logs for 14 days
            level: 'info',
            format: logFormat,
        })
    );

    // Error logs - only errors
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d', // Keep error logs for 30 days
            level: 'error',
            format: logFormat,
        })
    );

    // HTTP logs - request logs
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'http-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
            level: 'http',
            format: jsonFormat,
        })
    );
}

// ==================== Create Logger Instance ====================
const logger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    levels,
    transports,
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
        }),
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
        }),
    ],
    exitOnError: false,
});

// ==================== Logger Utility Functions ====================
export const Logger = {
    // Basic logging
    info: (message: string, meta?: object) => logger.info(message, meta),
    warn: (message: string, meta?: object) => logger.warn(message, meta),
    error: (message: string, meta?: object) => logger.error(message, meta),
    debug: (message: string, meta?: object) => logger.debug(message, meta),
    http: (message: string, meta?: object) => logger.http(message, meta),

    // Request logging
    request: (req: {
        method: string;
        url: string;
        ip?: string;
        userId?: string;
        userAgent?: string;
        responseTime?: number;
        statusCode?: number;
    }) => {
        logger.http('HTTP Request', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userId: req.userId || 'anonymous',
            userAgent: req.userAgent,
            responseTime: req.responseTime ? `${req.responseTime}ms` : undefined,
            statusCode: req.statusCode,
        });
    },

    // Database logging
    database: (operation: string, collection: string, duration?: number) => {
        logger.debug(`DB ${operation}`, {
            collection,
            duration: duration ? `${duration}ms` : undefined,
        });
    },

    // Authentication logging
    auth: (event: string, userId: string, meta?: object) => {
        logger.info(`Auth: ${event}`, { userId, ...meta });
    },

    // Payment logging
    payment: (event: string, orderId: string, amount: number, meta?: object) => {
        logger.info(`Payment: ${event}`, { orderId, amount, ...meta });
    },

    // Order logging
    order: (event: string, orderId: string, userId: string, meta?: object) => {
        logger.info(`Order: ${event}`, { orderId, userId, ...meta });
    },

    // Error with context
    errorWithContext: (error: Error, context: string, meta?: object) => {
        logger.error(`${context}: ${error.message}`, {
            stack: error.stack,
            ...meta,
        });
    },

    // Performance logging
    performance: (operation: string, startTime: number, meta?: object) => {
        const duration = Date.now() - startTime;
        logger.debug(`Performance: ${operation}`, {
            duration: `${duration}ms`,
            ...meta,
        });
    },

    // Security logging
    security: (event: string, ip: string, meta?: object) => {
        logger.warn(`Security: ${event}`, { ip, ...meta });
    },

    // Cache logging
    cache: (event: 'hit' | 'miss' | 'set' | 'delete', key: string, meta?: object) => {
        logger.debug(`Cache ${event}`, { key, ...meta });
    },

    // Socket logging
    socket: (event: string, socketId: string, meta?: object) => {
        logger.debug(`Socket: ${event}`, { socketId, ...meta });
    },
};

// ==================== HTTP Request Logger Middleware ====================
export const httpLoggerMiddleware = (req: any, res: any, next: any) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        Logger.request({
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user?.userId,
            userAgent: req.headers['user-agent'],
            responseTime,
            statusCode: res.statusCode,
        });
    });

    next();
};

export default Logger;
