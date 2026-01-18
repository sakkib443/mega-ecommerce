// ===================================================================
// Mega E-Commerce Backend - Notification Module
// User and Admin notifications
// ===================================================================

import express, { Request, Response, Router } from 'express';
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// ============ INTERFACE ============
export interface INotification extends Document {
    type: 'order' | 'order_status' | 'review' | 'user' | 'product' | 'system' | 'wishlist' | 'promotion';
    title: string;
    message: string;
    data?: {
        orderId?: Types.ObjectId;
        userId?: Types.ObjectId;
        productId?: Types.ObjectId;
        reviewId?: Types.ObjectId;
        amount?: number;
        link?: string;
        image?: string;
    };
    isRead: boolean;
    forAdmin: boolean;
    forUser?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ============ SCHEMA ============
const NotificationSchema = new Schema<INotification>(
    {
        type: {
            type: String,
            enum: ['order', 'order_status', 'review', 'user', 'product', 'system', 'wishlist', 'promotion'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        data: {
            orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            productId: { type: Schema.Types.ObjectId, ref: 'Product' },
            reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
            amount: Number,
            link: String,
            image: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        forAdmin: {
            type: Boolean,
            default: true,
        },
        forUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
NotificationSchema.index({ forAdmin: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ forUser: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

// ============ SERVICE ============
export const NotificationService = {
    // Create notification
    async createNotification(data: Partial<INotification>): Promise<INotification> {
        const notification = await Notification.create(data);
        return notification;
    },

    // Create order notification (for admin)
    async createOrderNotification(orderData: {
        orderId: Types.ObjectId;
        userId: Types.ObjectId;
        userName: string;
        amount: number;
        productName: string;
    }): Promise<INotification> {
        return this.createNotification({
            type: 'order',
            title: 'নতুন অর্ডার! 🛒',
            message: `${orderData.userName} ৳${orderData.amount} এর অর্ডার করেছেন - "${orderData.productName}"`,
            data: {
                orderId: orderData.orderId,
                userId: orderData.userId,
                amount: orderData.amount,
                link: `/dashboard/admin/orders`,
            },
            forAdmin: true,
        });
    },

    // Create order status notification (for user)
    async createOrderStatusNotification(data: {
        orderId: Types.ObjectId;
        userId: Types.ObjectId;
        orderNumber: string;
        status: string;
    }): Promise<INotification> {
        const statusMessages: Record<string, { title: string; message: string }> = {
            confirmed: {
                title: 'অর্ডার নিশ্চিত! ✅',
                message: `আপনার অর্ডার #${data.orderNumber} নিশ্চিত করা হয়েছে`
            },
            processing: {
                title: 'অর্ডার প্রস্তুত হচ্ছে 📦',
                message: `আপনার অর্ডার #${data.orderNumber} প্রস্তুত করা হচ্ছে`
            },
            shipped: {
                title: 'অর্ডার শিপ করা হয়েছে 🚚',
                message: `আপনার অর্ডার #${data.orderNumber} শিপ করা হয়েছে`
            },
            delivered: {
                title: 'অর্ডার ডেলিভারি হয়েছে! 🎉',
                message: `আপনার অর্ডার #${data.orderNumber} ডেলিভারি সম্পন্ন হয়েছে`
            },
            cancelled: {
                title: 'অর্ডার বাতিল ❌',
                message: `আপনার অর্ডার #${data.orderNumber} বাতিল করা হয়েছে`
            },
        };

        const { title, message } = statusMessages[data.status] || {
            title: 'অর্ডার আপডেট',
            message: `আপনার অর্ডার #${data.orderNumber} এর স্ট্যাটাস আপডেট হয়েছে`,
        };

        return this.createNotification({
            type: 'order_status',
            title,
            message,
            data: {
                orderId: data.orderId,
                link: `/dashboard/orders/${data.orderId}`,
            },
            forAdmin: false,
            forUser: data.userId,
        });
    },

    // Create user registration notification (for admin)
    async createUserNotification(userData: {
        userId: Types.ObjectId;
        userName: string;
        email: string;
    }): Promise<INotification> {
        return this.createNotification({
            type: 'user',
            title: 'নতুন ইউজার! 👤',
            message: `${userData.userName} (${userData.email}) রেজিস্ট্রেশন করেছেন`,
            data: {
                userId: userData.userId,
                link: `/dashboard/admin/users`,
            },
            forAdmin: true,
        });
    },

    // Create review notification (for admin)
    async createReviewNotification(reviewData: {
        reviewId: Types.ObjectId;
        userId: Types.ObjectId;
        userName: string;
        productName: string;
        rating: number;
    }): Promise<INotification> {
        return this.createNotification({
            type: 'review',
            title: `নতুন ${reviewData.rating}⭐ রিভিউ!`,
            message: `${reviewData.userName} "${reviewData.productName}" এ রিভিউ দিয়েছেন`,
            data: {
                reviewId: reviewData.reviewId,
                userId: reviewData.userId,
                link: `/dashboard/admin/reviews`,
            },
            forAdmin: true,
        });
    },

    // Create wishlist price drop notification (for user)
    async createPriceDropNotification(data: {
        userId: Types.ObjectId;
        productId: Types.ObjectId;
        productName: string;
        oldPrice: number;
        newPrice: number;
        image?: string;
    }): Promise<INotification> {
        const discount = Math.round(((data.oldPrice - data.newPrice) / data.oldPrice) * 100);
        return this.createNotification({
            type: 'wishlist',
            title: 'দাম কমেছে! 🔥',
            message: `"${data.productName}" এর দাম ${discount}% কমেছে! এখন ৳${data.newPrice}`,
            data: {
                productId: data.productId,
                link: `/product/${data.productId}`,
                image: data.image,
            },
            forAdmin: false,
            forUser: data.userId,
        });
    },

    // Create promotion notification (for all users - we'll create for specific user)
    async createPromotionNotification(data: {
        userId: Types.ObjectId;
        title: string;
        message: string;
        link?: string;
        image?: string;
    }): Promise<INotification> {
        return this.createNotification({
            type: 'promotion',
            title: data.title,
            message: data.message,
            data: {
                link: data.link,
                image: data.image,
            },
            forAdmin: false,
            forUser: data.userId,
        });
    },

    // Get admin notifications
    async getAdminNotifications(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ forAdmin: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ forAdmin: true }),
            Notification.countDocuments({ forAdmin: true, isRead: false }),
        ]);

        return {
            notifications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    },

    // Get user notifications
    async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ forUser: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ forUser: userId }),
            Notification.countDocuments({ forUser: userId, isRead: false }),
        ]);

        return {
            notifications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    },

    // Mark as read
    async markAsRead(notificationId: string): Promise<INotification | null> {
        return Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    },

    // Mark all as read (admin)
    async markAllAsReadAdmin(): Promise<void> {
        await Notification.updateMany(
            { forAdmin: true, isRead: false },
            { isRead: true }
        );
    },

    // Mark all as read (user)
    async markAllAsReadUser(userId: string): Promise<void> {
        await Notification.updateMany(
            { forUser: userId, isRead: false },
            { isRead: true }
        );
    },

    // Delete notification
    async deleteNotification(notificationId: string): Promise<void> {
        await Notification.findByIdAndDelete(notificationId);
    },

    // Delete all read notifications (cleanup)
    async deleteReadNotifications(): Promise<void> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await Notification.deleteMany({
            isRead: true,
            createdAt: { $lt: thirtyDaysAgo },
        });
    },

    // Get unread count (admin)
    async getUnreadCountAdmin(): Promise<number> {
        return Notification.countDocuments({ forAdmin: true, isRead: false });
    },

    // Get unread count (user)
    async getUnreadCountUser(userId: string): Promise<number> {
        return Notification.countDocuments({ forUser: userId, isRead: false });
    },
};

// ============ CONTROLLER ============
// Admin Controllers
const getAdminNotifications = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await NotificationService.getAdminNotifications(page, limit);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        meta: result.meta,
        data: result.notifications,
    });
});

const getAdminUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const count = await NotificationService.getUnreadCountAdmin();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Unread count retrieved',
        data: { count },
    });
});

const markAllAsReadAdmin = catchAsync(async (req: Request, res: Response) => {
    await NotificationService.markAllAsReadAdmin();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'All notifications marked as read',
        data: null,
    });
});

// User Controllers
const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await NotificationService.getUserNotifications(req.user!.userId, page, limit);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        meta: result.meta,
        data: result.notifications,
    });
});

const getUserUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const count = await NotificationService.getUnreadCountUser(req.user!.userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Unread count retrieved',
        data: { count },
    });
});

const markAllAsReadUser = catchAsync(async (req: Request, res: Response) => {
    await NotificationService.markAllAsReadUser(req.user!.userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'All notifications marked as read',
        data: null,
    });
});

// Shared Controllers
const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notification marked as read',
        data: notification,
    });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await NotificationService.deleteNotification(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notification deleted',
        data: null,
    });
});

// ============ ROUTES ============
const router: Router = express.Router();

// User routes
router.get('/my', authMiddleware, getUserNotifications);
router.get('/my/unread-count', authMiddleware, getUserUnreadCount);
router.patch('/my/mark-all-read', authMiddleware, markAllAsReadUser);

// Admin routes
router.get('/admin', authMiddleware, authorizeRoles('admin', 'super_admin'), getAdminNotifications);
router.get('/admin/unread-count', authMiddleware, authorizeRoles('admin', 'super_admin'), getAdminUnreadCount);
router.patch('/admin/mark-all-read', authMiddleware, authorizeRoles('admin', 'super_admin'), markAllAsReadAdmin);

// Shared routes
router.patch('/:id/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export const NotificationRoutes = router;
