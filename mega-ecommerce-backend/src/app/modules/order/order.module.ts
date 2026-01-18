// ===================================================================
// Mega E-Commerce Backend - Order Module
// Complete Order Management System
// ===================================================================

import { Schema, model, Types } from 'mongoose';
import { z } from 'zod';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../utils/AppError';
import express from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { NotificationService } from '../notification/notification.module';
import CartService from '../cart/cart.module';

// ==================== INTERFACE ====================
export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
        sku: string;
        attributes: { name: string; value: string }[];
    };
    subtotal: number;
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface IOrderTimeline {
    status: string;
    message: string;
    timestamp: Date;
    updatedBy?: Types.ObjectId;
}

export interface IOrder {
    _id?: Types.ObjectId;
    orderNumber: string;
    user: Types.ObjectId;
    items: IOrderItem[];

    // Pricing
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax: number;
    total: number;

    // Coupon
    couponCode?: string;
    couponDiscount: number;

    // Shipping
    shippingAddress: IShippingAddress;
    shippingMethod: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;

    // Payment
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
    transactionId?: string;
    paidAt?: Date;

    // Order Status
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

    // Timeline
    timeline: IOrderTimeline[];

    // Notes
    customerNote?: string;
    adminNote?: string;

    // Cancellation/Return
    cancelReason?: string;
    returnReason?: string;
    refundAmount?: number;
    refundedAt?: Date;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
    deliveredAt?: Date;
}

// ==================== MODEL ====================
const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String,
    variant: {
        sku: String,
        attributes: [{
            name: String,
            value: String,
        }],
    },
    subtotal: { type: Number, required: true },
});

const shippingAddressSchema = new Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Bangladesh' },
}, { _id: false });

const timelineSchema = new Schema({
    status: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const orderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],

        // Pricing
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, required: true },

        // Coupon
        couponCode: String,
        couponDiscount: { type: Number, default: 0 },

        // Shipping
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        shippingMethod: { type: String, default: 'standard' },
        trackingNumber: String,
        estimatedDelivery: Date,

        // Payment
        paymentMethod: { type: String, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
            default: 'pending',
        },
        transactionId: String,
        paidAt: Date,

        // Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
            default: 'pending',
        },

        // Timeline
        timeline: [timelineSchema],

        // Notes
        customerNote: String,
        adminNote: String,

        // Cancellation/Return
        cancelReason: String,
        returnReason: String,
        refundAmount: Number,
        refundedAt: Date,

        // Delivery
        deliveredAt: Date,
    },
    { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

export const Order = model<IOrder>('Order', orderSchema);

// ==================== VALIDATION ====================
const shippingAddressValidation = z.object({
    fullName: z.string({ required_error: 'Full name is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    email: z.string().email().optional(),
    street: z.string({ required_error: 'Street address is required' }),
    city: z.string({ required_error: 'City is required' }),
    state: z.string({ required_error: 'State is required' }),
    zipCode: z.string({ required_error: 'Zip code is required' }),
    country: z.string().default('Bangladesh'),
});

export const createOrderValidation = z.object({
    body: z.object({
        shippingAddress: shippingAddressValidation,
        paymentMethod: z.string({ required_error: 'Payment method is required' }),
        shippingMethod: z.string().default('standard'),
        customerNote: z.string().optional(),
        couponCode: z.string().optional(),
    }),
});

export const updateOrderStatusValidation = z.object({
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
        note: z.string().optional(),
        trackingNumber: z.string().optional(),
    }),
});

// ==================== SERVICE ====================
// Generate unique order number
const generateOrderNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
};

// Calculate shipping cost
const calculateShippingCost = (method: string, subtotal: number): number => {
    // Free shipping for orders above 5000
    if (subtotal >= 5000) return 0;

    switch (method) {
        case 'express':
            return 150;
        case 'standard':
        default:
            return 60;
    }
};

const OrderService = {
    // Create order from cart
    async createOrder(
        userId: string,
        data: {
            shippingAddress: IShippingAddress;
            paymentMethod: string;
            shippingMethod?: string;
            customerNote?: string;
            couponCode?: string;
        }
    ): Promise<IOrder> {
        // Get user's cart
        const cart = await CartService.getCart(userId);
        if (!cart || cart.items.length === 0) {
            throw new AppError(400, 'Cart is empty');
        }

        // Validate cart
        const validation = await CartService.validateCart(userId);
        if (!validation.valid) {
            throw new AppError(400, `Cart validation failed: ${validation.issues.join(', ')}`);
        }

        // Build order items and update stock
        const orderItems: IOrderItem[] = [];
        for (const item of cart.items) {
            // Update product stock
            const product = await Product.findById(item.product);
            if (product && product.trackQuantity) {
                if (item.variant && product.hasVariations) {
                    const variantIndex = product.variants.findIndex(v => v.sku === item.variant?.sku);
                    if (variantIndex > -1) {
                        product.variants[variantIndex].stock -= item.quantity;
                    }
                } else {
                    product.quantity -= item.quantity;
                }
                await product.save();
            }

            orderItems.push({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                variant: item.variant,
                subtotal: item.price * item.quantity,
            });
        }

        // Calculate totals
        const subtotal = cart.subtotal;
        const shippingCost = calculateShippingCost(data.shippingMethod || 'standard', subtotal);
        const discount = cart.discount;
        const total = subtotal + shippingCost - discount;

        // Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            user: userId,
            items: orderItems,
            subtotal,
            shippingCost,
            discount,
            couponCode: cart.couponCode,
            couponDiscount: cart.discount,
            total,
            shippingAddress: data.shippingAddress,
            shippingMethod: data.shippingMethod || 'standard',
            paymentMethod: data.paymentMethod,
            customerNote: data.customerNote,
            timeline: [{
                status: 'pending',
                message: 'Order placed successfully',
                timestamp: new Date(),
            }],
        });

        // Clear cart
        await CartService.clearCart(userId);

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { totalOrders: 1, totalSpent: total },
        });

        // Update product sales count
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { salesCount: item.quantity },
            });
        }

        // Create notification
        try {
            const user = await User.findById(userId);
            if (user) {
                await NotificationService.createOrderNotification({
                    orderId: order._id!,
                    userId: new Types.ObjectId(userId),
                    userName: `${user.firstName} ${user.lastName}`.trim(),
                    amount: total,
                    productName: orderItems.length === 1
                        ? orderItems[0].name
                        : `${orderItems.length} items`,
                });
            }
        } catch (err) {
            console.error('Order notification error:', err);
        }

        return order;
    },

    // Get user's orders
    async getUserOrders(
        userId: string,
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<{ data: IOrder[]; total: number }> {
        const query: any = { user: userId };
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return { data: orders as IOrder[], total };
    },

    // Get order by ID
    async getOrderById(orderId: string, userId?: string): Promise<IOrder> {
        const query: any = { _id: orderId };
        if (userId) query.user = userId;

        const order = await Order.findOne(query)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name slug thumbnail');

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        return order;
    },

    // Get order by order number
    async getOrderByNumber(orderNumber: string): Promise<IOrder> {
        const order = await Order.findOne({ orderNumber })
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name slug thumbnail');

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        return order;
    },

    // Update order status (Admin)
    async updateOrderStatus(
        orderId: string,
        status: IOrder['status'],
        note?: string,
        trackingNumber?: string,
        adminId?: string
    ): Promise<IOrder> {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        // Validate status transition
        const validTransitions: Record<string, string[]> = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered', 'returned'],
            delivered: ['returned'],
            cancelled: [],
            returned: [],
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new AppError(400, `Cannot change status from ${order.status} to ${status}`);
        }

        // Update order
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (status === 'delivered') order.deliveredAt = new Date();

        // Add timeline entry
        const statusMessages: Record<string, string> = {
            confirmed: 'Order has been confirmed',
            processing: 'Order is being processed',
            shipped: 'Order has been shipped',
            delivered: 'Order has been delivered',
            cancelled: 'Order has been cancelled',
            returned: 'Order has been returned',
        };

        order.timeline.push({
            status,
            message: note || statusMessages[status],
            timestamp: new Date(),
            updatedBy: adminId ? new Types.ObjectId(adminId) : undefined,
        });

        await order.save();

        // If cancelled, restore stock
        if (status === 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product && product.trackQuantity) {
                    if (item.variant && product.hasVariations) {
                        const variantIndex = product.variants.findIndex(v => v.sku === item.variant?.sku);
                        if (variantIndex > -1) {
                            product.variants[variantIndex].stock += item.quantity;
                        }
                    } else {
                        product.quantity += item.quantity;
                    }
                    await product.save();
                }
            }
        }

        return order;
    },

    // Cancel order (Customer)
    async cancelOrder(orderId: string, userId: string, reason: string): Promise<IOrder> {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new AppError(400, 'Order cannot be cancelled at this stage');
        }

        order.status = 'cancelled';
        order.cancelReason = reason;
        order.timeline.push({
            status: 'cancelled',
            message: `Order cancelled by customer: ${reason}`,
            timestamp: new Date(),
        });

        await order.save();

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product && product.trackQuantity) {
                if (item.variant && product.hasVariations) {
                    const variantIndex = product.variants.findIndex(v => v.sku === item.variant?.sku);
                    if (variantIndex > -1) {
                        product.variants[variantIndex].stock += item.quantity;
                    }
                } else {
                    product.quantity += item.quantity;
                }
                await product.save();
            }
        }

        return order;
    },

    // Get all orders (Admin)
    async getAllOrders(
        page: number = 1,
        limit: number = 10,
        filters: {
            status?: string;
            paymentStatus?: string;
            startDate?: Date;
            endDate?: Date;
            search?: string;
        } = {}
    ): Promise<{ data: IOrder[]; total: number }> {
        const query: any = {};

        if (filters.status) query.status = filters.status;
        if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = filters.startDate;
            if (filters.endDate) query.createdAt.$lte = filters.endDate;
        }
        if (filters.search) {
            query.$or = [
                { orderNumber: { $regex: filters.search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: filters.search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: filters.search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return { data: orders as IOrder[], total };
    },

    // Get order statistics (Admin)
    async getOrderStats(): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        totalRevenue: number;
        todayOrders: number;
        todayRevenue: number;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            total,
            pending,
            confirmed,
            processing,
            shipped,
            delivered,
            cancelled,
            revenueResult,
            todayOrders,
            todayRevenueResult,
        ] = await Promise.all([
            Order.countDocuments({}),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'confirmed' }),
            Order.countDocuments({ status: 'processing' }),
            Order.countDocuments({ status: 'shipped' }),
            Order.countDocuments({ status: 'delivered' }),
            Order.countDocuments({ status: 'cancelled' }),
            Order.aggregate([
                { $match: { status: { $nin: ['cancelled', 'returned'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, status: { $nin: ['cancelled', 'returned'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);

        return {
            total,
            pending,
            confirmed,
            processing,
            shipped,
            delivered,
            cancelled,
            totalRevenue: revenueResult[0]?.total || 0,
            todayOrders,
            todayRevenue: todayRevenueResult[0]?.total || 0,
        };
    },

    // Update payment status
    async updatePaymentStatus(
        orderId: string,
        paymentStatus: IOrder['paymentStatus'],
        transactionId?: string
    ): Promise<IOrder> {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        order.paymentStatus = paymentStatus;
        if (transactionId) order.transactionId = transactionId;
        if (paymentStatus === 'paid') {
            order.paidAt = new Date();
            // Auto-confirm order when paid
            if (order.status === 'pending') {
                order.status = 'confirmed';
                order.timeline.push({
                    status: 'confirmed',
                    message: 'Payment received, order confirmed',
                    timestamp: new Date(),
                });
            }
        }

        order.timeline.push({
            status: order.status,
            message: `Payment status updated to ${paymentStatus}`,
            timestamp: new Date(),
        });

        await order.save();
        return order;
    },

    // Add admin note
    async addAdminNote(orderId: string, note: string): Promise<IOrder> {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { adminNote: note },
            { new: true }
        );
        if (!order) {
            throw new AppError(404, 'Order not found');
        }
        return order;
    },
};

// ==================== CONTROLLER ====================
const OrderController = {
    createOrder: catchAsync(async (req: Request, res: Response) => {
        const order = await OrderService.createOrder(req.user!.userId, req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    }),

    getMyOrders: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status as string;

        const result = await OrderService.getUserOrders(req.user!.userId, page, limit, status);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Orders fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    getOrderById: catchAsync(async (req: Request, res: Response) => {
        const order = await OrderService.getOrderById(req.params.id, req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order fetched successfully',
            data: order,
        });
    }),

    getOrderByNumber: catchAsync(async (req: Request, res: Response) => {
        const order = await OrderService.getOrderByNumber(req.params.orderNumber);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order fetched successfully',
            data: order,
        });
    }),

    cancelOrder: catchAsync(async (req: Request, res: Response) => {
        const { reason } = req.body;
        const order = await OrderService.cancelOrder(req.params.id, req.user!.userId, reason);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    }),

    // Admin
    getAllOrders: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const filters = {
            status: req.query.status as string,
            paymentStatus: req.query.paymentStatus as string,
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            search: req.query.search as string,
        };

        const result = await OrderService.getAllOrders(page, limit, filters);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Orders fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    getOrderStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await OrderService.getOrderStats();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order statistics fetched successfully',
            data: stats,
        });
    }),

    updateOrderStatus: catchAsync(async (req: Request, res: Response) => {
        const { status, note, trackingNumber } = req.body;
        const order = await OrderService.updateOrderStatus(
            req.params.id,
            status,
            note,
            trackingNumber,
            req.user!.userId
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    }),

    updatePaymentStatus: catchAsync(async (req: Request, res: Response) => {
        const { paymentStatus, transactionId } = req.body;
        const order = await OrderService.updatePaymentStatus(req.params.id, paymentStatus, transactionId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payment status updated successfully',
            data: order,
        });
    }),

    addAdminNote: catchAsync(async (req: Request, res: Response) => {
        const { note } = req.body;
        const order = await OrderService.addAdminNote(req.params.id, note);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Note added successfully',
            data: order,
        });
    }),

    getAdminOrderById: catchAsync(async (req: Request, res: Response) => {
        const order = await OrderService.getOrderById(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Order fetched successfully',
            data: order,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

// Customer routes
router.post('/', authMiddleware, validateRequest(createOrderValidation), OrderController.createOrder);
router.get('/my', authMiddleware, OrderController.getMyOrders);
router.get('/my/:id', authMiddleware, OrderController.getOrderById);
router.get('/track/:orderNumber', OrderController.getOrderByNumber);
router.patch('/my/:id/cancel', authMiddleware, OrderController.cancelOrder);

// Admin routes
router.get('/admin/all', authMiddleware, authorizeRoles('admin', 'super_admin'), OrderController.getAllOrders);
router.get('/admin/stats', authMiddleware, authorizeRoles('admin', 'super_admin'), OrderController.getOrderStats);
router.get('/admin/:id', authMiddleware, authorizeRoles('admin', 'super_admin'), OrderController.getAdminOrderById);
router.patch(
    '/admin/:id/status',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(updateOrderStatusValidation),
    OrderController.updateOrderStatus
);
router.patch('/admin/:id/payment', authMiddleware, authorizeRoles('admin', 'super_admin'), OrderController.updatePaymentStatus);
router.patch('/admin/:id/note', authMiddleware, authorizeRoles('admin', 'super_admin'), OrderController.addAdminNote);

export const OrderRoutes = router;
export default OrderService;
