// ===================================================================
// Mega E-Commerce Backend - Redis Cache Service
// Production-grade caching system with Redis
// ===================================================================

import Redis from 'ioredis';
import config from '../config';
import Logger from './logger';

// ==================== Redis Configuration ====================
interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    retryDelayMs?: number;
    maxRetries?: number;
}

const redisConfig: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
    keyPrefix: 'megaecom:',
    retryDelayMs: 1000,
    maxRetries: 3,
};

// ==================== Redis Client ====================
let redisClient: Redis | null = null;
let isConnected = false;
let connectionAttempts = 0;

// ==================== Initialize Redis ====================
export const initRedis = async (): Promise<boolean> => {
    if (redisClient && isConnected) {
        return true;
    }

    try {
        redisClient = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            keyPrefix: redisConfig.keyPrefix,
            retryStrategy: (times) => {
                connectionAttempts = times;
                if (times > (redisConfig.maxRetries || 3)) {
                    Logger.warn('Redis max retries exceeded, running without cache');
                    return null; // Stop retrying
                }
                return Math.min(times * 100, 3000);
            },
            lazyConnect: true,
            connectTimeout: 5000,
        });

        // Event handlers
        redisClient.on('connect', () => {
            isConnected = true;
            connectionAttempts = 0;
            Logger.info('✅ Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            isConnected = false;
            Logger.error('Redis error', { error: err.message });
        });

        redisClient.on('close', () => {
            isConnected = false;
            Logger.warn('Redis connection closed');
        });

        redisClient.on('reconnecting', () => {
            Logger.info('Redis reconnecting...');
        });

        await redisClient.connect();
        return true;
    } catch (error: any) {
        Logger.warn('Redis connection failed, running without cache', { error: error.message });
        isConnected = false;
        return false;
    }
};

// ==================== Cache Service ====================
export const CacheService = {
    // Check if Redis is available
    isAvailable: (): boolean => isConnected && redisClient !== null,

    // Get value from cache
    async get<T>(key: string): Promise<T | null> {
        if (!this.isAvailable()) return null;

        try {
            const value = await redisClient!.get(key);
            if (value) {
                Logger.cache('hit', key);
                return JSON.parse(value) as T;
            }
            Logger.cache('miss', key);
            return null;
        } catch (error: any) {
            Logger.error('Redis GET error', { key, error: error.message });
            return null;
        }
    },

    // Set value in cache with TTL (seconds)
    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            await redisClient!.set(key, JSON.stringify(value), 'EX', ttlSeconds);
            Logger.cache('set', key, { ttl: ttlSeconds });
            return true;
        } catch (error: any) {
            Logger.error('Redis SET error', { key, error: error.message });
            return false;
        }
    },

    // Delete key from cache
    async delete(key: string): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            await redisClient!.del(key);
            Logger.cache('delete', key);
            return true;
        } catch (error: any) {
            Logger.error('Redis DELETE error', { key, error: error.message });
            return false;
        }
    },

    // Delete keys by pattern
    async deletePattern(pattern: string): Promise<number> {
        if (!this.isAvailable()) return 0;

        try {
            const keys = await redisClient!.keys(pattern);
            if (keys.length > 0) {
                // Remove prefix from keys for deletion
                const keysWithoutPrefix = keys.map(k => k.replace(redisConfig.keyPrefix || '', ''));
                const deleted = await redisClient!.del(...keysWithoutPrefix);
                Logger.cache('delete', pattern, { count: deleted });
                return deleted;
            }
            return 0;
        } catch (error: any) {
            Logger.error('Redis DELETE PATTERN error', { pattern, error: error.message });
            return 0;
        }
    },

    // Check if key exists
    async exists(key: string): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            const result = await redisClient!.exists(key);
            return result === 1;
        } catch (error: any) {
            Logger.error('Redis EXISTS error', { key, error: error.message });
            return false;
        }
    },

    // Get TTL of key
    async getTTL(key: string): Promise<number> {
        if (!this.isAvailable()) return -1;

        try {
            return await redisClient!.ttl(key);
        } catch (error: any) {
            Logger.error('Redis TTL error', { key, error: error.message });
            return -1;
        }
    },

    // Increment value
    async increment(key: string, amount: number = 1): Promise<number> {
        if (!this.isAvailable()) return 0;

        try {
            return await redisClient!.incrby(key, amount);
        } catch (error: any) {
            Logger.error('Redis INCREMENT error', { key, error: error.message });
            return 0;
        }
    },

    // Decrement value
    async decrement(key: string, amount: number = 1): Promise<number> {
        if (!this.isAvailable()) return 0;

        try {
            return await redisClient!.decrby(key, amount);
        } catch (error: any) {
            Logger.error('Redis DECREMENT error', { key, error: error.message });
            return 0;
        }
    },

    // Hash operations
    async hSet(key: string, field: string, value: any): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            await redisClient!.hset(key, field, JSON.stringify(value));
            return true;
        } catch (error: any) {
            Logger.error('Redis HSET error', { key, field, error: error.message });
            return false;
        }
    },

    async hGet<T>(key: string, field: string): Promise<T | null> {
        if (!this.isAvailable()) return null;

        try {
            const value = await redisClient!.hget(key, field);
            return value ? (JSON.parse(value) as T) : null;
        } catch (error: any) {
            Logger.error('Redis HGET error', { key, field, error: error.message });
            return null;
        }
    },

    async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
        if (!this.isAvailable()) return null;

        try {
            const data = await redisClient!.hgetall(key);
            if (Object.keys(data).length === 0) return null;

            const result: Record<string, T> = {};
            for (const [field, value] of Object.entries(data)) {
                result[field] = JSON.parse(value) as T;
            }
            return result;
        } catch (error: any) {
            Logger.error('Redis HGETALL error', { key, error: error.message });
            return null;
        }
    },

    // Flush all cache
    async flushAll(): Promise<boolean> {
        if (!this.isAvailable()) return false;

        try {
            await redisClient!.flushdb();
            Logger.info('Redis cache flushed');
            return true;
        } catch (error: any) {
            Logger.error('Redis FLUSH error', { error: error.message });
            return false;
        }
    },

    // Get Redis info
    async getStats(): Promise<object | null> {
        if (!this.isAvailable()) return null;

        try {
            const info = await redisClient!.info();
            const dbSize = await redisClient!.dbsize();
            return {
                connected: isConnected,
                dbSize,
                info: info.split('\n').slice(0, 10).join('\n'),
            };
        } catch (error: any) {
            Logger.error('Redis STATS error', { error: error.message });
            return null;
        }
    },

    // Close connection
    async close(): Promise<void> {
        if (redisClient) {
            await redisClient.quit();
            redisClient = null;
            isConnected = false;
            Logger.info('Redis connection closed');
        }
    },
};

// ==================== Cache Keys ====================
export const CacheKeys = {
    // Products
    product: (id: string) => `product:${id}`,
    productBySlug: (slug: string) => `product:slug:${slug}`,
    productList: (page: number, limit: number, filters: string) =>
        `products:list:${page}:${limit}:${filters}`,
    featuredProducts: () => 'products:featured',
    newProducts: () => 'products:new',
    bestSellers: () => 'products:bestsellers',

    // Categories
    category: (id: string) => `category:${id}`,
    categoryTree: () => 'categories:tree',
    categoryProducts: (categoryId: string, page: number) =>
        `category:${categoryId}:products:${page}`,

    // Users
    user: (id: string) => `user:${id}`,
    userCart: (userId: string) => `user:${userId}:cart`,
    userWishlist: (userId: string) => `user:${userId}:wishlist`,

    // Orders
    order: (id: string) => `order:${id}`,
    userOrders: (userId: string, page: number) => `user:${userId}:orders:${page}`,

    // Site settings
    siteSettings: () => 'site:settings',
    siteContent: (key: string) => `site:content:${key}`,

    // Analytics
    dashboardStats: () => 'analytics:dashboard',
    realtimeVisitors: () => 'analytics:visitors:realtime',

    // Sessions
    userSession: (userId: string) => `session:${userId}`,
    activeUsers: () => 'users:active',
};

// ==================== Cache TTL (in seconds) ====================
export const CacheTTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    DEFAULT: 3600,       // 1 hour
    LONG: 86400,         // 24 hours
    PRODUCT: 1800,       // 30 minutes
    CATEGORY: 3600,      // 1 hour
    USER: 600,           // 10 minutes
    CART: 1800,          // 30 minutes
    SETTINGS: 86400,     // 24 hours
    ANALYTICS: 300,      // 5 minutes
};

// ==================== Cache Middleware ====================
export const cacheMiddleware = (keyGenerator: (req: any) => string, ttl: number = CacheTTL.DEFAULT) => {
    return async (req: any, res: any, next: any) => {
        if (!CacheService.isAvailable()) {
            return next();
        }

        const key = keyGenerator(req);
        const cached = await CacheService.get(key);

        if (cached) {
            return res.json(cached);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (body: any) => {
            if (res.statusCode === 200) {
                CacheService.set(key, body, ttl);
            }
            return originalJson(body);
        };

        next();
    };
};

// ==================== Cache Invalidation Helpers ====================
export const CacheInvalidation = {
    // Invalidate product cache
    async product(productId: string): Promise<void> {
        await CacheService.delete(CacheKeys.product(productId));
        await CacheService.deletePattern('products:*');
        await CacheService.deletePattern('category:*:products:*');
    },

    // Invalidate category cache
    async category(categoryId?: string): Promise<void> {
        if (categoryId) {
            await CacheService.delete(CacheKeys.category(categoryId));
        }
        await CacheService.delete(CacheKeys.categoryTree());
        await CacheService.deletePattern('category:*:products:*');
    },

    // Invalidate user cache
    async user(userId: string): Promise<void> {
        await CacheService.delete(CacheKeys.user(userId));
        await CacheService.delete(CacheKeys.userCart(userId));
        await CacheService.delete(CacheKeys.userWishlist(userId));
        await CacheService.deletePattern(`user:${userId}:orders:*`);
    },

    // Invalidate all cache
    async all(): Promise<void> {
        await CacheService.flushAll();
    },
};

export default CacheService;
