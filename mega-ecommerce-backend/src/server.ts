// ===================================================================
// Mega E-Commerce Backend - Server Entry Point (Vercel Serverless Compatible)
// Professional server with Socket.io, Redis, and Winston logging
// ===================================================================

import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { setupSwagger } from './swagger.config';
import Logger, { httpLoggerMiddleware } from './app/utils/logger';
import { initRedis, CacheService } from './app/utils/redis';
import { initSocketIO, closeSocketIO, SocketEmitter } from './app/utils/socket';

// ==================== Uncaught Exception Handler ====================
process.on('uncaughtException', (error) => {
  Logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// ==================== MongoDB Connection Caching ====================
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    Logger.info('⚡ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    Logger.info('🔌 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(config.database_url, opts).then((mongoose) => {
      Logger.info('✅ MongoDB connected successfully!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    Logger.error('❌ MongoDB connection failed', { error: error.message });
    throw error;
  }

  return cached.conn;
}

// ==================== Cleanup Stale Indexes ====================
async function cleanupStaleIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const usersCollection = collections.find(c => c.name === 'users');

    if (usersCollection) {
      const indexes = await db.collection('users').indexes();
      const staleIndex = indexes.find((idx: any) => idx.name === 'id_1');

      if (staleIndex) {
        await db.collection('users').dropIndex('id_1');
        Logger.info('🧹 Dropped stale id_1 index from users collection');
      }
    }
  } catch (error) {
    // Silently ignore if index doesn't exist
  }
}

// ==================== Initialize All Services ====================
async function initializeServices() {
  const startTime = Date.now();
  Logger.info('🚀 Initializing services...');

  try {
    // 1. Connect to MongoDB
    await connectDB();
    await cleanupStaleIndexes();

    // 2. Initialize Redis (optional - graceful fallback)
    const redisConnected = await initRedis();
    if (redisConnected) {
      Logger.info('✅ Redis cache enabled');
    } else {
      Logger.warn('⚠️ Redis not available, running without cache');
    }

    const duration = Date.now() - startTime;
    Logger.performance('Services initialization', startTime);

    return true;
  } catch (error: any) {
    Logger.error('❌ Service initialization failed', { error: error.message });
    return false;
  }
}

// ==================== Apply HTTP Logger Middleware ====================
app.use(httpLoggerMiddleware);

// ==================== Setup Swagger ====================
setupSwagger(app);

// ==================== Initialize Services ====================
initializeServices().catch((error) => {
  Logger.error('❌ Initial service connection failed', { error: error.message });
});

// ==================== Local Development Server ====================
if (process.env.NODE_ENV !== 'production') {
  const httpServer = createServer(app);

  // Initialize Socket.io
  const io = initSocketIO(httpServer);

  // Start HTTP Server
  httpServer.listen(config.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║   🛒 Mega E-Commerce Backend Started!                        ║');
    console.log('║                                                              ║');
    console.log(`║   🌐 API:      http://localhost:${config.port}                        ║`);
    console.log(`║   📚 Docs:     http://localhost:${config.port}/api-docs               ║`);
    console.log(`║   🔌 Socket:   ws://localhost:${config.port}                          ║`);
    console.log(`║   🔧 Env:      ${config.env.padEnd(43)}║`);
    console.log('║                                                              ║');
    console.log('║   ✨ NEW PROFESSIONAL FEATURES:                              ║');
    console.log('║   ✅ Winston Logging (file rotation)                         ║');
    console.log('║   ✅ Redis Caching (if available)                            ║');
    console.log('║   ✅ Socket.io Real-time                                     ║');
    console.log('║   ✅ Jest Testing Framework                                  ║');
    console.log('║                                                              ║');
    console.log('║   📦 E-Commerce Features:                                    ║');
    console.log('║   ✅ Products & Categories                                   ║');
    console.log('║   ✅ Cart & Wishlist                                         ║');
    console.log('║   ✅ Orders & Payments (SSLCommerz, bKash)                   ║');
    console.log('║   ✅ Shipping & Tracking                                     ║');
    console.log('║   ✅ Reviews & Ratings                                       ║');
    console.log('║   ✅ Invoice Generation                                      ║');
    console.log('║   ✅ Analytics Dashboard                                     ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    Logger.info('🎉 Server started successfully', {
      port: config.port,
      env: config.env,
      socketEnabled: SocketEmitter.isInitialized(),
      cacheEnabled: CacheService.isAvailable(),
    });
  });

  // ==================== Graceful Shutdown ====================
  const gracefulShutdown = async (signal: string) => {
    Logger.info(`${signal} received. Starting graceful shutdown...`);

    httpServer.close(async () => {
      Logger.info('HTTP server closed');

      // Close Socket.io
      await closeSocketIO();

      // Close Redis
      await CacheService.close();

      // Close MongoDB
      await mongoose.connection.close();
      Logger.info('MongoDB connection closed');

      Logger.info('💤 Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      Logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('unhandledRejection', (error: Error) => {
    Logger.error('💥 UNHANDLED REJECTION! Shutting down...', {
      error: error.message,
      stack: error.stack,
    });
    httpServer.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// ==================== Export for Vercel ====================
export default app;
