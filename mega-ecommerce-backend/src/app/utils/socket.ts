// ===================================================================
// Mega E-Commerce Backend - Socket.io Real-time Service
// Production-grade WebSocket implementation for real-time features
// ===================================================================

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import Logger from './logger';
import { CacheService, CacheKeys } from './redis';

// ==================== Types ====================
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userEmail?: string;
}

interface OrderUpdatePayload {
    orderId: string;
    orderNumber: string;
    status: string;
    message: string;
    timestamp: Date;
}

interface NotificationPayload {
    id: string;
    type: 'order' | 'payment' | 'promotion' | 'system';
    title: string;
    message: string;
    data?: any;
    timestamp: Date;
}

interface CartUpdatePayload {
    userId: string;
    itemCount: number;
    subtotal: number;
}

interface LiveActivityPayload {
    type: 'product_view' | 'add_to_cart' | 'purchase' | 'user_online';
    productName?: string;
    location?: string;
    timestamp: Date;
}

// ==================== Socket.io Server Instance ====================
let io: SocketIOServer | null = null;
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

// ==================== Initialize Socket.io ====================
export const initSocketIO = (server: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: [
                config.frontend_url,
                'http://localhost:3000',
                'https://mega-ecommerce.vercel.app',
            ],
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
    });

    // ==================== Authentication Middleware ====================
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (token) {
                const decoded = jwt.verify(token, config.jwt.access_secret) as any;
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                socket.userEmail = decoded.email;
                Logger.socket('authenticated', socket.id, { userId: decoded.userId });
            }
            next();
        } catch (error) {
            // Allow connection even without auth (for public features)
            Logger.socket('unauthenticated connection', socket.id);
            next();
        }
    });

    // ==================== Connection Handler ====================
    io.on('connection', (socket: AuthenticatedSocket) => {
        Logger.socket('connected', socket.id, { userId: socket.userId || 'guest' });

        // Track connected users
        if (socket.userId) {
            if (!connectedUsers.has(socket.userId)) {
                connectedUsers.set(socket.userId, new Set());
            }
            connectedUsers.get(socket.userId)!.add(socket.id);

            // Join user's personal room
            socket.join(`user:${socket.userId}`);

            // Admin joins admin room
            if (socket.userRole === 'admin' || socket.userRole === 'super_admin') {
                socket.join('admins');
                Logger.socket('admin joined', socket.id, { userId: socket.userId });
            }

            // Update active users count
            updateActiveUsersCount();
        }

        // ==================== Event Handlers ====================

        // Join order room for tracking
        socket.on('track:order', (orderId: string) => {
            socket.join(`order:${orderId}`);
            Logger.socket('tracking order', socket.id, { orderId });
        });

        // Leave order room
        socket.on('untrack:order', (orderId: string) => {
            socket.leave(`order:${orderId}`);
        });

        // Subscribe to product updates
        socket.on('subscribe:product', (productId: string) => {
            socket.join(`product:${productId}`);
        });

        // Unsubscribe from product
        socket.on('unsubscribe:product', (productId: string) => {
            socket.leave(`product:${productId}`);
        });

        // Live activity (for social proof)
        socket.on('activity:view', (data: { productId: string; productName: string }) => {
            // Broadcast to all except sender
            socket.broadcast.emit('live:activity', {
                type: 'product_view',
                productName: data.productName,
                timestamp: new Date(),
            } as LiveActivityPayload);
        });

        socket.on('activity:addToCart', (data: { productName: string }) => {
            socket.broadcast.emit('live:activity', {
                type: 'add_to_cart',
                productName: data.productName,
                timestamp: new Date(),
            } as LiveActivityPayload);
        });

        // Typing indicator for support chat
        socket.on('typing:start', (chatId: string) => {
            socket.to(`chat:${chatId}`).emit('typing:update', {
                userId: socket.userId,
                isTyping: true,
            });
        });

        socket.on('typing:stop', (chatId: string) => {
            socket.to(`chat:${chatId}`).emit('typing:update', {
                userId: socket.userId,
                isTyping: false,
            });
        });

        // Ping/Pong for connection health
        socket.on('ping', (callback) => {
            if (typeof callback === 'function') {
                callback({ status: 'ok', timestamp: Date.now() });
            }
        });

        // ==================== Disconnection ====================
        socket.on('disconnect', (reason) => {
            Logger.socket('disconnected', socket.id, { userId: socket.userId || 'guest', reason });

            if (socket.userId) {
                const userSockets = connectedUsers.get(socket.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        connectedUsers.delete(socket.userId);
                    }
                }
                updateActiveUsersCount();
            }
        });
    });

    Logger.info('🔌 Socket.io initialized');
    return io;
};

// ==================== Helper Functions ====================
const updateActiveUsersCount = async () => {
    const count = connectedUsers.size;
    if (io) {
        io.emit('stats:activeUsers', count);
    }
    // Cache active users count
    await CacheService.set(CacheKeys.activeUsers(), count, 60);
};

// ==================== Socket Emitters ====================
export const SocketEmitter = {
    // Get io instance
    getIO: (): SocketIOServer | null => io,

    // Check if socket is initialized
    isInitialized: (): boolean => io !== null,

    // Get connected users count
    getConnectedUsersCount: (): number => connectedUsers.size,

    // Check if user is online
    isUserOnline: (userId: string): boolean => connectedUsers.has(userId),

    // ==================== Order Events ====================
    orderStatusUpdated: (orderId: string, userId: string, data: OrderUpdatePayload) => {
        if (!io) return;

        // Notify user
        io.to(`user:${userId}`).emit('order:statusUpdated', data);

        // Notify order trackers
        io.to(`order:${orderId}`).emit('order:statusUpdated', data);

        // Notify admins
        io.to('admins').emit('admin:orderUpdated', data);

        Logger.socket('order status updated', '', { orderId, status: data.status });
    },

    newOrder: (orderData: { orderId: string; orderNumber: string; total: number; customerName: string }) => {
        if (!io) return;

        // Notify admins about new order
        io.to('admins').emit('admin:newOrder', {
            ...orderData,
            timestamp: new Date(),
        });

        Logger.socket('new order notification', '', { orderId: orderData.orderId });
    },

    // ==================== Payment Events ====================
    paymentReceived: (userId: string, data: { orderId: string; amount: number; method: string }) => {
        if (!io) return;

        io.to(`user:${userId}`).emit('payment:received', {
            ...data,
            timestamp: new Date(),
        });

        io.to('admins').emit('admin:paymentReceived', {
            ...data,
            userId,
            timestamp: new Date(),
        });
    },

    paymentFailed: (userId: string, data: { orderId: string; reason: string }) => {
        if (!io) return;

        io.to(`user:${userId}`).emit('payment:failed', {
            ...data,
            timestamp: new Date(),
        });
    },

    // ==================== Cart Events ====================
    cartUpdated: (userId: string, data: CartUpdatePayload) => {
        if (!io) return;

        io.to(`user:${userId}`).emit('cart:updated', data);
    },

    // ==================== Notification Events ====================
    sendNotification: (userId: string, notification: NotificationPayload) => {
        if (!io) return;

        io.to(`user:${userId}`).emit('notification:new', notification);
        Logger.socket('notification sent', '', { userId, type: notification.type });
    },

    sendNotificationToAll: (notification: NotificationPayload) => {
        if (!io) return;

        io.emit('notification:new', notification);
        Logger.socket('broadcast notification', '', { type: notification.type });
    },

    sendNotificationToAdmins: (notification: NotificationPayload) => {
        if (!io) return;

        io.to('admins').emit('admin:notification', notification);
    },

    // ==================== Product Events ====================
    productUpdated: (productId: string, data: { name: string; stock: number; price: number }) => {
        if (!io) return;

        io.to(`product:${productId}`).emit('product:updated', {
            productId,
            ...data,
            timestamp: new Date(),
        });
    },

    stockAlert: (productId: string, productName: string, stock: number) => {
        if (!io) return;

        if (stock <= 5) {
            io.to('admins').emit('admin:stockAlert', {
                productId,
                productName,
                stock,
                level: stock === 0 ? 'out_of_stock' : 'low_stock',
                timestamp: new Date(),
            });
        }
    },

    // ==================== Live Activity (Social Proof) ====================
    broadcastPurchase: (productName: string, location?: string) => {
        if (!io) return;

        io.emit('live:activity', {
            type: 'purchase',
            productName,
            location,
            timestamp: new Date(),
        } as LiveActivityPayload);
    },

    // ==================== Admin Dashboard Real-time Stats ====================
    updateDashboardStats: (stats: {
        todayOrders: number;
        todayRevenue: number;
        activeUsers: number;
        pendingOrders: number;
    }) => {
        if (!io) return;

        io.to('admins').emit('admin:dashboardStats', {
            ...stats,
            timestamp: new Date(),
        });
    },

    // ==================== Chat/Support ====================
    newChatMessage: (chatId: string, message: { senderId: string; content: string }) => {
        if (!io) return;

        io.to(`chat:${chatId}`).emit('chat:newMessage', {
            ...message,
            chatId,
            timestamp: new Date(),
        });
    },
};

// ==================== Cleanup ====================
export const closeSocketIO = async (): Promise<void> => {
    if (io) {
        await new Promise<void>((resolve) => {
            io!.close(() => {
                Logger.info('Socket.io server closed');
                resolve();
            });
        });
        io = null;
    }
};

export default SocketEmitter;
