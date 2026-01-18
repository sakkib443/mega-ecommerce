// ===================================================================
// Mega E-Commerce Backend - Payment Module
// Payment Gateway Integrations (SSLCommerz, bKash, COD)
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
import axios from 'axios';
import crypto from 'crypto';
import config from '../../config';

// ==================== INTERFACE ====================
export interface IPayment {
    _id?: Types.ObjectId;
    order: Types.ObjectId;
    user: Types.ObjectId;

    // Payment Details
    amount: number;
    currency: string;
    method: 'sslcommerz' | 'bkash' | 'nagad' | 'cod' | 'bank_transfer';

    // Transaction Info
    transactionId?: string;
    gatewayTransactionId?: string;
    gatewayResponse?: any;

    // Status
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

    // bKash specific
    bkashPaymentId?: string;
    bkashTrxId?: string;

    // SSLCommerz specific
    sslSessionKey?: string;
    sslValidationId?: string;

    // Refund
    refundAmount?: number;
    refundedAt?: Date;
    refundTransactionId?: string;

    // Metadata
    ipAddress?: string;
    userAgent?: string;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
    completedAt?: Date;
}

// ==================== MODEL ====================
const paymentSchema = new Schema<IPayment>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'BDT',
        },
        method: {
            type: String,
            enum: ['sslcommerz', 'bkash', 'nagad', 'cod', 'bank_transfer'],
            required: true,
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true,
        },
        gatewayTransactionId: String,
        gatewayResponse: Schema.Types.Mixed,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
            default: 'pending',
        },
        bkashPaymentId: String,
        bkashTrxId: String,
        sslSessionKey: String,
        sslValidationId: String,
        refundAmount: Number,
        refundedAt: Date,
        refundTransactionId: String,
        ipAddress: String,
        userAgent: String,
        completedAt: Date,
    },
    { timestamps: true }
);

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = model<IPayment>('Payment', paymentSchema);

// ==================== VALIDATION ====================
export const initiatePaymentValidation = z.object({
    body: z.object({
        orderId: z.string({ required_error: 'Order ID is required' }),
        method: z.enum(['sslcommerz', 'bkash', 'nagad', 'cod', 'bank_transfer']),
    }),
});

// ==================== HELPER FUNCTIONS ====================
const generateTransactionId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `TXN-${timestamp}-${random}`.toUpperCase();
};

// ==================== SSLCommerz CONFIG ====================
const sslConfig = {
    store_id: process.env.SSL_STORE_ID || '',
    store_passwd: process.env.SSL_STORE_PASSWORD || '',
    is_live: process.env.SSL_IS_LIVE === 'true',
    get baseUrl() {
        return this.is_live
            ? 'https://securepay.sslcommerz.com'
            : 'https://sandbox.sslcommerz.com';
    },
};

// ==================== bKash CONFIG ====================
const bkashConfig = {
    app_key: process.env.BKASH_APP_KEY || '',
    app_secret: process.env.BKASH_APP_SECRET || '',
    username: process.env.BKASH_USERNAME || '',
    password: process.env.BKASH_PASSWORD || '',
    is_live: process.env.BKASH_IS_LIVE === 'true',
    get baseUrl() {
        return this.is_live
            ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
            : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    },
};

// ==================== SERVICE ====================
const PaymentService = {
    // Generate unique transaction ID
    generateTransactionId,

    // ==================== SSLCommerz ====================
    async initiateSSLCommerz(
        orderId: string,
        userId: string,
        amount: number,
        customerInfo: {
            name: string;
            email: string;
            phone: string;
            address: string;
            city: string;
        },
        ipAddress?: string
    ): Promise<{ gatewayUrl: string; transactionId: string }> {
        const transactionId = generateTransactionId();

        const postData = {
            store_id: sslConfig.store_id,
            store_passwd: sslConfig.store_passwd,
            total_amount: amount,
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${config.backend_url}/api/payments/sslcommerz/success`,
            fail_url: `${config.backend_url}/api/payments/sslcommerz/fail`,
            cancel_url: `${config.backend_url}/api/payments/sslcommerz/cancel`,
            ipn_url: `${config.backend_url}/api/payments/sslcommerz/ipn`,
            cus_name: customerInfo.name,
            cus_email: customerInfo.email,
            cus_phone: customerInfo.phone,
            cus_add1: customerInfo.address,
            cus_city: customerInfo.city,
            cus_country: 'Bangladesh',
            shipping_method: 'NO',
            product_name: 'E-Commerce Order',
            product_category: 'General',
            product_profile: 'general',
            value_a: orderId,
            value_b: userId,
        };

        try {
            const response = await axios.post(
                `${sslConfig.baseUrl}/gwprocess/v4/api.php`,
                postData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            if (response.data.status === 'SUCCESS') {
                // Create payment record
                await Payment.create({
                    order: new Types.ObjectId(orderId),
                    user: new Types.ObjectId(userId),
                    amount,
                    method: 'sslcommerz',
                    transactionId,
                    sslSessionKey: response.data.sessionkey,
                    status: 'pending',
                    ipAddress,
                });

                return {
                    gatewayUrl: response.data.GatewayPageURL,
                    transactionId,
                };
            } else {
                throw new AppError(400, response.data.failedreason || 'Payment initiation failed');
            }
        } catch (error: any) {
            console.error('SSLCommerz Error:', error.message);
            throw new AppError(500, 'Payment gateway error');
        }
    },

    // Validate SSLCommerz payment
    async validateSSLCommerz(validationId: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `${sslConfig.baseUrl}/validator/api/validationserverAPI.php`,
                {
                    params: {
                        val_id: validationId,
                        store_id: sslConfig.store_id,
                        store_passwd: sslConfig.store_passwd,
                        format: 'json',
                    },
                }
            );

            return response.data.status === 'VALID' || response.data.status === 'VALIDATED';
        } catch (error) {
            return false;
        }
    },

    // ==================== bKash ====================
    // Get bKash token
    async getBkashToken(): Promise<string> {
        try {
            const response = await axios.post(
                `${bkashConfig.baseUrl}/tokenized/checkout/token/grant`,
                {
                    app_key: bkashConfig.app_key,
                    app_secret: bkashConfig.app_secret,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        username: bkashConfig.username,
                        password: bkashConfig.password,
                    },
                }
            );

            if (response.data.id_token) {
                return response.data.id_token;
            }
            throw new AppError(500, 'Failed to get bKash token');
        } catch (error: any) {
            console.error('bKash Token Error:', error.message);
            throw new AppError(500, 'bKash authentication failed');
        }
    },

    // Initiate bKash payment
    async initiateBkash(
        orderId: string,
        userId: string,
        amount: number,
        ipAddress?: string
    ): Promise<{ bkashURL: string; paymentId: string; transactionId: string }> {
        const transactionId = generateTransactionId();
        const token = await this.getBkashToken();

        try {
            const response = await axios.post(
                `${bkashConfig.baseUrl}/tokenized/checkout/create`,
                {
                    mode: '0011',
                    payerReference: userId,
                    callbackURL: `${config.backend_url}/api/payments/bkash/callback`,
                    amount: amount.toString(),
                    currency: 'BDT',
                    intent: 'sale',
                    merchantInvoiceNumber: transactionId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token,
                        'X-APP-Key': bkashConfig.app_key,
                    },
                }
            );

            if (response.data.bkashURL) {
                // Create payment record
                await Payment.create({
                    order: new Types.ObjectId(orderId),
                    user: new Types.ObjectId(userId),
                    amount,
                    method: 'bkash',
                    transactionId,
                    bkashPaymentId: response.data.paymentID,
                    status: 'pending',
                    ipAddress,
                });

                return {
                    bkashURL: response.data.bkashURL,
                    paymentId: response.data.paymentID,
                    transactionId,
                };
            } else {
                throw new AppError(400, response.data.errorMessage || 'bKash payment initiation failed');
            }
        } catch (error: any) {
            console.error('bKash Create Error:', error.message);
            throw new AppError(500, 'bKash payment initiation failed');
        }
    },

    // Execute bKash payment
    async executeBkash(paymentId: string): Promise<IPayment> {
        const token = await this.getBkashToken();

        try {
            const response = await axios.post(
                `${bkashConfig.baseUrl}/tokenized/checkout/execute`,
                { paymentID: paymentId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token,
                        'X-APP-Key': bkashConfig.app_key,
                    },
                }
            );

            const payment = await Payment.findOne({ bkashPaymentId: paymentId });
            if (!payment) {
                throw new AppError(404, 'Payment not found');
            }

            if (response.data.statusCode === '0000') {
                payment.status = 'completed';
                payment.bkashTrxId = response.data.trxID;
                payment.gatewayTransactionId = response.data.trxID;
                payment.gatewayResponse = response.data;
                payment.completedAt = new Date();
                await payment.save();

                // Update order payment status
                const { Order } = await import('../order/order.module');
                await Order.findByIdAndUpdate(payment.order, {
                    paymentStatus: 'paid',
                    transactionId: response.data.trxID,
                    paidAt: new Date(),
                });

                return payment;
            } else {
                payment.status = 'failed';
                payment.gatewayResponse = response.data;
                await payment.save();
                throw new AppError(400, response.data.errorMessage || 'Payment failed');
            }
        } catch (error: any) {
            console.error('bKash Execute Error:', error.message);
            throw error;
        }
    },

    // ==================== COD (Cash on Delivery) ====================
    async initiateCOD(
        orderId: string,
        userId: string,
        amount: number,
        ipAddress?: string
    ): Promise<IPayment> {
        const transactionId = generateTransactionId();

        const payment = await Payment.create({
            order: new Types.ObjectId(orderId),
            user: new Types.ObjectId(userId),
            amount,
            method: 'cod',
            transactionId,
            status: 'pending',
            ipAddress,
        });

        // Update order payment status
        const { Order } = await import('../order/order.module');
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'pending',
            paymentMethod: 'cod',
        });

        return payment;
    },

    // Mark COD as paid (after delivery)
    async markCODPaid(paymentId: string): Promise<IPayment> {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, 'Payment not found');
        }

        if (payment.method !== 'cod') {
            throw new AppError(400, 'This is not a COD payment');
        }

        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update order
        const { Order } = await import('../order/order.module');
        await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'paid',
            paidAt: new Date(),
        });

        return payment;
    },

    // ==================== COMMON ====================
    // Get payment by order
    async getPaymentByOrder(orderId: string): Promise<IPayment | null> {
        return Payment.findOne({ order: orderId }).sort({ createdAt: -1 });
    },

    // Get payment by transaction ID
    async getPaymentByTransactionId(transactionId: string) {
        return Payment.findOne({ transactionId });
    },

    // Get user payments
    async getUserPayments(userId: string, page: number = 1, limit: number = 10): Promise<{
        data: IPayment[];
        total: number;
    }> {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            Payment.find({ user: userId })
                .populate('order', 'orderNumber total status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Payment.countDocuments({ user: userId }),
        ]);

        return { data: payments as IPayment[], total };
    },

    // Admin: Get all payments
    async getAllPayments(
        page: number = 1,
        limit: number = 10,
        filters: { status?: string; method?: string } = {}
    ): Promise<{ data: IPayment[]; total: number }> {
        const query: any = {};
        if (filters.status) query.status = filters.status;
        if (filters.method) query.method = filters.method;

        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('order', 'orderNumber total status')
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Payment.countDocuments(query),
        ]);

        return { data: payments as IPayment[], total };
    },

    // Payment statistics
    async getPaymentStats(): Promise<{
        totalPayments: number;
        totalAmount: number;
        pendingAmount: number;
        completedAmount: number;
        byMethod: { method: string; count: number; amount: number }[];
    }> {
        const [
            totalPayments,
            amountStats,
            byMethodStats,
        ] = await Promise.all([
            Payment.countDocuments({}),
            Payment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: '$amount' },
                    },
                },
            ]),
            Payment.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: '$method',
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' },
                    },
                },
            ]),
        ]);

        const pendingAmount = amountStats.find((s: any) => s._id === 'pending')?.total || 0;
        const completedAmount = amountStats.find((s: any) => s._id === 'completed')?.total || 0;
        const totalAmount = amountStats.reduce((sum: number, s: any) => sum + s.total, 0);

        return {
            totalPayments,
            totalAmount,
            pendingAmount,
            completedAmount,
            byMethod: byMethodStats.map((s: any) => ({
                method: s._id,
                count: s.count,
                amount: s.amount,
            })),
        };
    },

    // Refund payment
    async refundPayment(paymentId: string, amount?: number): Promise<IPayment> {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, 'Payment not found');
        }

        if (payment.status !== 'completed') {
            throw new AppError(400, 'Only completed payments can be refunded');
        }

        const refundAmount = amount || payment.amount;

        // TODO: Implement actual refund API calls for SSLCommerz/bKash

        payment.status = 'refunded';
        payment.refundAmount = refundAmount;
        payment.refundedAt = new Date();
        payment.refundTransactionId = generateTransactionId();
        await payment.save();

        // Update order
        const { Order } = await import('../order/order.module');
        await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'refunded',
            refundAmount,
            refundedAt: new Date(),
        });

        return payment;
    },
};

// ==================== CONTROLLER ====================
const PaymentController = {
    // Initiate payment
    initiatePayment: catchAsync(async (req: Request, res: Response) => {
        const { orderId, method } = req.body;
        const userId = req.user!.userId;
        const ipAddress = req.ip;

        // Get order details
        const { Order } = await import('../order/order.module');
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        if (order.paymentStatus === 'paid') {
            throw new AppError(400, 'Order is already paid');
        }

        let result: any;

        switch (method) {
            case 'sslcommerz':
                result = await PaymentService.initiateSSLCommerz(
                    orderId,
                    userId,
                    order.total,
                    {
                        name: order.shippingAddress.fullName,
                        email: order.shippingAddress.email || '',
                        phone: order.shippingAddress.phone,
                        address: order.shippingAddress.street,
                        city: order.shippingAddress.city,
                    },
                    ipAddress
                );
                break;

            case 'bkash':
                result = await PaymentService.initiateBkash(orderId, userId, order.total, ipAddress);
                break;

            case 'cod':
                result = await PaymentService.initiateCOD(orderId, userId, order.total, ipAddress);
                break;

            default:
                throw new AppError(400, 'Invalid payment method');
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payment initiated',
            data: result,
        });
    }),

    // SSLCommerz success callback
    sslSuccess: catchAsync(async (req: Request, res: Response) => {
        const { tran_id, val_id, value_a: orderId } = req.body;

        const isValid = await PaymentService.validateSSLCommerz(val_id);
        const payment = await Payment.findOne({ transactionId: tran_id });

        if (payment && isValid) {
            payment.status = 'completed';
            payment.sslValidationId = val_id;
            payment.gatewayResponse = req.body;
            payment.completedAt = new Date();
            await payment.save();

            // Update order
            const { Order } = await import('../order/order.module');
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'paid',
                transactionId: tran_id,
                paidAt: new Date(),
                status: 'confirmed',
            });

            // Redirect to frontend success page
            res.redirect(`${config.frontend_url}/payment/success?txn=${tran_id}`);
        } else {
            res.redirect(`${config.frontend_url}/payment/failed?txn=${tran_id}`);
        }
    }),

    // SSLCommerz fail callback
    sslFail: catchAsync(async (req: Request, res: Response) => {
        const { tran_id } = req.body;

        const payment = await Payment.findOne({ transactionId: tran_id });
        if (payment) {
            payment.status = 'failed';
            payment.gatewayResponse = req.body;
            await payment.save();
        }

        res.redirect(`${config.frontend_url}/payment/failed?txn=${tran_id}`);
    }),

    // SSLCommerz cancel callback
    sslCancel: catchAsync(async (req: Request, res: Response) => {
        const { tran_id } = req.body;

        const payment = await Payment.findOne({ transactionId: tran_id });
        if (payment) {
            payment.status = 'cancelled';
            await payment.save();
        }

        res.redirect(`${config.frontend_url}/payment/cancelled?txn=${tran_id}`);
    }),

    // bKash callback
    bkashCallback: catchAsync(async (req: Request, res: Response) => {
        const { paymentID, status } = req.query;

        if (status === 'success' && paymentID) {
            try {
                await PaymentService.executeBkash(paymentID as string);
                res.redirect(`${config.frontend_url}/payment/success?method=bkash`);
            } catch (error) {
                res.redirect(`${config.frontend_url}/payment/failed?method=bkash`);
            }
        } else {
            res.redirect(`${config.frontend_url}/payment/failed?method=bkash`);
        }
    }),

    // Get my payments
    getMyPayments: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await PaymentService.getUserPayments(req.user!.userId, page, limit);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payments fetched',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    // Admin: Get all payments
    getAllPayments: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const filters = {
            status: req.query.status as string,
            method: req.query.method as string,
        };

        const result = await PaymentService.getAllPayments(page, limit, filters);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payments fetched',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    // Admin: Get payment stats
    getPaymentStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await PaymentService.getPaymentStats();

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payment statistics fetched',
            data: stats,
        });
    }),

    // Admin: Mark COD as paid
    markCODPaid: catchAsync(async (req: Request, res: Response) => {
        const payment = await PaymentService.markCODPaid(req.params.id);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'COD marked as paid',
            data: payment,
        });
    }),

    // Admin: Refund payment
    refundPayment: catchAsync(async (req: Request, res: Response) => {
        const { amount } = req.body;
        const payment = await PaymentService.refundPayment(req.params.id, amount);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Payment refunded',
            data: payment,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

// Customer routes
router.post('/', authMiddleware, validateRequest(initiatePaymentValidation), PaymentController.initiatePayment);
router.get('/my', authMiddleware, PaymentController.getMyPayments);

// Gateway callbacks (public)
router.post('/sslcommerz/success', PaymentController.sslSuccess);
router.post('/sslcommerz/fail', PaymentController.sslFail);
router.post('/sslcommerz/cancel', PaymentController.sslCancel);
router.post('/sslcommerz/ipn', PaymentController.sslSuccess); // IPN uses same logic
router.get('/bkash/callback', PaymentController.bkashCallback);

// Admin routes
router.get('/admin/all', authMiddleware, authorizeRoles('admin', 'super_admin'), PaymentController.getAllPayments);
router.get('/admin/stats', authMiddleware, authorizeRoles('admin', 'super_admin'), PaymentController.getPaymentStats);
router.patch('/admin/:id/cod-paid', authMiddleware, authorizeRoles('admin', 'super_admin'), PaymentController.markCODPaid);
router.post('/admin/:id/refund', authMiddleware, authorizeRoles('admin', 'super_admin'), PaymentController.refundPayment);

export const PaymentRoutes = router;
export default PaymentService;
