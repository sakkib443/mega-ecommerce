// ===================================================================
// Mega E-Commerce Backend - Review Module
// Product reviews and ratings
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
import { Product } from '../product/product.model';
import { Order } from '../order/order.module';

// ==================== INTERFACE ====================
export interface IReview {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    product: Types.ObjectId;
    order?: Types.ObjectId;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    helpfulBy: Types.ObjectId[];
    status: 'pending' | 'approved' | 'rejected';
    adminReply?: string;
    adminReplyAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// ==================== MODEL ====================
const reviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            maxlength: 100
        },
        comment: {
            type: String,
            required: true,
            maxlength: 1000
        },
        images: {
            type: [String],
            default: [],
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false
        },
        helpfulCount: {
            type: Number,
            default: 0
        },
        helpfulBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved'  // Auto-approve for now
        },
        adminReply: String,
        adminReplyAt: Date,
    },
    { timestamps: true }
);

// Indexes
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);

// ==================== VALIDATION ====================
export const createReviewValidation = z.object({
    body: z.object({
        productId: z.string({ required_error: 'Product ID is required' }),
        rating: z.number().min(1).max(5),
        title: z.string().max(100).optional(),
        comment: z.string({ required_error: 'Comment is required' }).max(1000),
        images: z.array(z.string()).max(5).optional(),
    }),
});

export const updateReviewValidation = z.object({
    body: z.object({
        rating: z.number().min(1).max(5).optional(),
        title: z.string().max(100).optional(),
        comment: z.string().max(1000).optional(),
        images: z.array(z.string()).max(5).optional(),
    }),
});

// ==================== SERVICE ====================
const ReviewService = {
    // Create review
    async createReview(userId: string, data: {
        productId: string;
        rating: number;
        title?: string;
        comment: string;
        images?: string[];
    }): Promise<IReview> {
        // Check if product exists
        const product = await Product.findById(data.productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        // Check for existing review
        const existingReview = await Review.findOne({
            user: userId,
            product: data.productId,
        });
        if (existingReview) {
            throw new AppError(400, 'You have already reviewed this product');
        }

        // Check if user has purchased this product
        let isVerifiedPurchase = false;
        const order = await Order.findOne({
            user: userId,
            'items.product': data.productId,
            status: 'delivered',
        });
        if (order) {
            isVerifiedPurchase = true;
        }

        const review = await Review.create({
            user: userId,
            product: data.productId,
            order: order?._id,
            rating: data.rating,
            title: data.title,
            comment: data.comment,
            images: data.images || [],
            isVerifiedPurchase,
            status: 'approved',
        });

        // Update product rating
        await this.syncProductRating(data.productId);

        return review;
    },

    // Get product reviews
    async getProductReviews(
        productId: string,
        page: number = 1,
        limit: number = 10,
        sort: string = 'newest'
    ): Promise<{
        reviews: IReview[];
        total: number;
        avgRating: number;
        ratingDistribution: Record<number, number>;
    }> {
        const skip = (page - 1) * limit;

        let sortQuery: any = { createdAt: -1 };
        if (sort === 'oldest') sortQuery = { createdAt: 1 };
        if (sort === 'highest') sortQuery = { rating: -1 };
        if (sort === 'lowest') sortQuery = { rating: 1 };
        if (sort === 'helpful') sortQuery = { helpfulCount: -1 };

        const [reviews, total, avgResult, distribution] = await Promise.all([
            Review.find({ product: productId, status: 'approved' })
                .populate('user', 'firstName lastName avatar')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ product: productId, status: 'approved' }),
            Review.aggregate([
                { $match: { product: new Types.ObjectId(productId), status: 'approved' } },
                { $group: { _id: null, avgRating: { $avg: '$rating' } } },
            ]),
            Review.aggregate([
                { $match: { product: new Types.ObjectId(productId), status: 'approved' } },
                { $group: { _id: '$rating', count: { $sum: 1 } } },
            ]),
        ]);

        const avgRating = Math.round((avgResult[0]?.avgRating || 0) * 10) / 10;

        const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach((d: any) => {
            ratingDistribution[d._id] = d.count;
        });

        return {
            reviews: reviews as IReview[],
            total,
            avgRating,
            ratingDistribution,
        };
    },

    // Get user's reviews
    async getUserReviews(userId: string): Promise<IReview[]> {
        const reviews = await Review.find({ user: userId })
            .populate('product', 'name slug thumbnail')
            .sort({ createdAt: -1 })
            .lean();

        return reviews as IReview[];
    },

    // Update review
    async updateReview(
        reviewId: string,
        userId: string,
        data: { rating?: number; title?: string; comment?: string; images?: string[] }
    ): Promise<IReview> {
        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new AppError(404, 'Review not found');
        }

        const oldRating = review.rating;

        if (data.rating !== undefined) review.rating = data.rating;
        if (data.title !== undefined) review.title = data.title;
        if (data.comment !== undefined) review.comment = data.comment;
        if (data.images !== undefined) review.images = data.images;

        await review.save();

        // Update product rating if rating changed
        if (data.rating !== undefined && data.rating !== oldRating) {
            await this.syncProductRating(review.product.toString());
        }

        return review;
    },

    // Delete review
    async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        const query: any = { _id: reviewId };
        if (!isAdmin) query.user = userId;

        const review = await Review.findOne(query);
        if (!review) {
            throw new AppError(404, 'Review not found');
        }

        const productId = review.product.toString();
        await Review.findByIdAndDelete(reviewId);

        // Update product rating
        await this.syncProductRating(productId);
    },

    // Mark review as helpful
    async markHelpful(reviewId: string, userId: string): Promise<IReview> {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw new AppError(404, 'Review not found');
        }

        const userObjectId = new Types.ObjectId(userId);
        const alreadyHelpful = review.helpfulBy.some(id => id.equals(userObjectId));

        if (alreadyHelpful) {
            // Remove helpful
            review.helpfulBy = review.helpfulBy.filter(id => !id.equals(userObjectId));
            review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        } else {
            // Add helpful
            review.helpfulBy.push(userObjectId);
            review.helpfulCount += 1;
        }

        await review.save();
        return review;
    },

    // Sync product rating
    async syncProductRating(productId: string): Promise<void> {
        const stats = await Review.aggregate([
            { $match: { product: new Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const avgRating = stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        const reviewCount = stats[0]?.count || 0;

        await Product.findByIdAndUpdate(productId, {
            rating: avgRating,
            reviewCount,
        });
    },

    // Admin: Get all reviews
    async getAllReviews(
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<{ data: IReview[]; total: number }> {
        const query: any = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user', 'firstName lastName email avatar')
                .populate('product', 'name slug thumbnail')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(query),
        ]);

        return { data: reviews as IReview[], total };
    },

    // Admin: Update review status
    async updateReviewStatus(
        reviewId: string,
        status: 'approved' | 'rejected'
    ): Promise<IReview> {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { status },
            { new: true }
        );
        if (!review) {
            throw new AppError(404, 'Review not found');
        }

        // Update product rating
        await this.syncProductRating(review.product.toString());

        return review;
    },

    // Admin: Add reply to review
    async addAdminReply(reviewId: string, reply: string): Promise<IReview> {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { adminReply: reply, adminReplyAt: new Date() },
            { new: true }
        );
        if (!review) {
            throw new AppError(404, 'Review not found');
        }
        return review;
    },

    // Get review statistics
    async getReviewStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        averageRating: number;
    }> {
        const [total, pending, approved, rejected, avgResult] = await Promise.all([
            Review.countDocuments({}),
            Review.countDocuments({ status: 'pending' }),
            Review.countDocuments({ status: 'approved' }),
            Review.countDocuments({ status: 'rejected' }),
            Review.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } },
            ]),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
            averageRating: Math.round((avgResult[0]?.avg || 0) * 10) / 10,
        };
    },
};

// ==================== CONTROLLER ====================
const ReviewController = {
    createReview: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.createReview(req.user!.userId, req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Review submitted successfully',
            data: review,
        });
    }),

    getProductReviews: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sort = (req.query.sort as string) || 'newest';

        const result = await ReviewService.getProductReviews(
            req.params.productId,
            page,
            limit,
            sort
        );

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Reviews fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: {
                reviews: result.reviews,
                avgRating: result.avgRating,
                ratingDistribution: result.ratingDistribution,
            },
        });
    }),

    getMyReviews: catchAsync(async (req: Request, res: Response) => {
        const reviews = await ReviewService.getUserReviews(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Your reviews fetched successfully',
            data: reviews,
        });
    }),

    updateReview: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.updateReview(
            req.params.id,
            req.user!.userId,
            req.body
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    }),

    deleteReview: catchAsync(async (req: Request, res: Response) => {
        await ReviewService.deleteReview(
            req.params.id,
            req.user!.userId,
            req.user!.role === 'admin' || req.user!.role === 'super_admin'
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Review deleted successfully',
            data: null,
        });
    }),

    markHelpful: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.markHelpful(req.params.id, req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Review marked as helpful',
            data: review,
        });
    }),

    // Admin
    getAllReviews: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status as string;

        const result = await ReviewService.getAllReviews(page, limit, status);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Reviews fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    updateReviewStatus: catchAsync(async (req: Request, res: Response) => {
        const { status } = req.body;
        const review = await ReviewService.updateReviewStatus(req.params.id, status);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Review status updated',
            data: review,
        });
    }),

    addAdminReply: catchAsync(async (req: Request, res: Response) => {
        const { reply } = req.body;
        const review = await ReviewService.addAdminReply(req.params.id, reply);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Reply added successfully',
            data: review,
        });
    }),

    getReviewStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await ReviewService.getReviewStats();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Review statistics fetched',
            data: stats,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

// Public
router.get('/product/:productId', ReviewController.getProductReviews);

// Authenticated
router.post('/', authMiddleware, validateRequest(createReviewValidation), ReviewController.createReview);
router.get('/my', authMiddleware, ReviewController.getMyReviews);
router.patch('/:id', authMiddleware, validateRequest(updateReviewValidation), ReviewController.updateReview);
router.delete('/:id', authMiddleware, ReviewController.deleteReview);
router.post('/:id/helpful', authMiddleware, ReviewController.markHelpful);

// Admin
router.get('/admin/all', authMiddleware, authorizeRoles('admin', 'super_admin'), ReviewController.getAllReviews);
router.get('/admin/stats', authMiddleware, authorizeRoles('admin', 'super_admin'), ReviewController.getReviewStats);
router.patch('/admin/:id/status', authMiddleware, authorizeRoles('admin', 'super_admin'), ReviewController.updateReviewStatus);
router.post('/admin/:id/reply', authMiddleware, authorizeRoles('admin', 'super_admin'), ReviewController.addAdminReply);

export const ReviewRoutes = router;
export default ReviewService;
