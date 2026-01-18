// ===================================================================
// Mega E-Commerce Backend - Wishlist Module
// User wishlist/favorites management
// ===================================================================

import { Schema, model, Types } from 'mongoose';
import { z } from 'zod';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../utils/AppError';
import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';

// ==================== INTERFACE ====================
export interface IWishlistItem {
    product: Types.ObjectId;
    addedAt: Date;
    notifyOnSale: boolean;
    notifyOnStock: boolean;
}

export interface IWishlist {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    items: IWishlistItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

// ==================== MODEL ====================
const wishlistItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
    notifyOnSale: {
        type: Boolean,
        default: true,
    },
    notifyOnStock: {
        type: Boolean,
        default: true,
    },
});

const wishlistSchema = new Schema<IWishlist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [wishlistItemSchema],
    },
    { timestamps: true }
);

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);

// ==================== VALIDATION ====================
export const addToWishlistValidation = z.object({
    body: z.object({
        productId: z.string({ required_error: 'Product ID is required' }),
        notifyOnSale: z.boolean().default(true),
        notifyOnStock: z.boolean().default(true),
    }),
});

// ==================== SERVICE ====================
const WishlistService = {
    // Get user wishlist
    async getWishlist(userId: string): Promise<IWishlist | null> {
        let wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status rating reviewCount',
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, items: [] });
        }

        return wishlist;
    },

    // Add to wishlist
    async addToWishlist(
        userId: string,
        productId: string,
        notifyOnSale: boolean = true,
        notifyOnStock: boolean = true
    ): Promise<IWishlist> {
        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        // Get or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, items: [] });
        }

        // Check if already in wishlist
        const existingIndex = wishlist.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingIndex > -1) {
            throw new AppError(400, 'Product already in wishlist');
        }

        // Add to wishlist
        wishlist.items.push({
            product: new Types.ObjectId(productId),
            addedAt: new Date(),
            notifyOnSale,
            notifyOnStock,
        });

        await wishlist.save();

        // Update user wishlist count
        await User.findByIdAndUpdate(userId, {
            totalWishlistItems: wishlist.items.length,
        });

        // Update product wishlist count
        await Product.findByIdAndUpdate(productId, {
            $inc: { wishlistCount: 1 },
        });

        // Populate and return
        await wishlist.populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status rating reviewCount',
        });

        return wishlist;
    },

    // Remove from wishlist
    async removeFromWishlist(userId: string, productId: string): Promise<IWishlist | null> {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return null;
        }

        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== productId
        );

        if (wishlist.items.length < initialLength) {
            await wishlist.save();

            // Update user wishlist count
            await User.findByIdAndUpdate(userId, {
                totalWishlistItems: wishlist.items.length,
            });

            // Update product wishlist count
            await Product.findByIdAndUpdate(productId, {
                $inc: { wishlistCount: -1 },
            });
        }

        await wishlist.populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status rating reviewCount',
        });

        return wishlist;
    },

    // Toggle wishlist (add/remove)
    async toggleWishlist(userId: string, productId: string): Promise<{ added: boolean; wishlist: IWishlist }> {
        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, items: [] });
        }

        const existingIndex = wishlist.items.findIndex(
            item => item.product.toString() === productId
        );

        let added = false;
        if (existingIndex > -1) {
            // Remove
            wishlist.items.splice(existingIndex, 1);
            await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: -1 } });
        } else {
            // Add
            wishlist.items.push({
                product: new Types.ObjectId(productId),
                addedAt: new Date(),
                notifyOnSale: true,
                notifyOnStock: true,
            });
            added = true;
            await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: 1 } });
        }

        await wishlist.save();

        // Update user wishlist count
        await User.findByIdAndUpdate(userId, {
            totalWishlistItems: wishlist.items.length,
        });

        await wishlist.populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status rating reviewCount',
        });

        return { added, wishlist };
    },

    // Check if product in wishlist
    async isInWishlist(userId: string, productId: string): Promise<boolean> {
        const wishlist = await Wishlist.findOne({
            user: userId,
            'items.product': productId,
        });
        return !!wishlist;
    },

    // Clear wishlist
    async clearWishlist(userId: string): Promise<void> {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            // Decrement wishlist count for all products
            for (const item of wishlist.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { wishlistCount: -1 },
                });
            }

            wishlist.items = [];
            await wishlist.save();

            await User.findByIdAndUpdate(userId, {
                totalWishlistItems: 0,
            });
        }
    },

    // Get wishlist count
    async getWishlistCount(userId: string): Promise<number> {
        const wishlist = await Wishlist.findOne({ user: userId });
        return wishlist?.items.length || 0;
    },

    // Update notification preferences
    async updateNotificationPreferences(
        userId: string,
        productId: string,
        preferences: { notifyOnSale?: boolean; notifyOnStock?: boolean }
    ): Promise<IWishlist> {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            throw new AppError(404, 'Wishlist not found');
        }

        const itemIndex = wishlist.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            throw new AppError(404, 'Product not in wishlist');
        }

        if (preferences.notifyOnSale !== undefined) {
            wishlist.items[itemIndex].notifyOnSale = preferences.notifyOnSale;
        }
        if (preferences.notifyOnStock !== undefined) {
            wishlist.items[itemIndex].notifyOnStock = preferences.notifyOnStock;
        }

        await wishlist.save();

        await wishlist.populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status rating reviewCount',
        });

        return wishlist;
    },

    // Move all to cart
    async moveAllToCart(userId: string): Promise<{ added: number; failed: string[] }> {
        const wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name quantity status',
        });

        if (!wishlist || wishlist.items.length === 0) {
            return { added: 0, failed: [] };
        }

        const CartService = (await import('../cart/cart.module')).default;
        let added = 0;
        const failed: string[] = [];

        for (const item of wishlist.items) {
            const product = item.product as any;
            try {
                if (product.status === 'active' && product.quantity > 0) {
                    await CartService.addToCart(userId, product._id.toString(), 1);
                    added++;
                } else {
                    failed.push(product.name);
                }
            } catch (error: any) {
                failed.push(product.name);
            }
        }

        return { added, failed };
    },
};

// ==================== CONTROLLER ====================
const WishlistController = {
    getWishlist: catchAsync(async (req: Request, res: Response) => {
        const wishlist = await WishlistService.getWishlist(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Wishlist fetched successfully',
            data: wishlist,
        });
    }),

    addToWishlist: catchAsync(async (req: Request, res: Response) => {
        const { productId, notifyOnSale, notifyOnStock } = req.body;
        const wishlist = await WishlistService.addToWishlist(
            req.user!.userId,
            productId,
            notifyOnSale,
            notifyOnStock
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Added to wishlist',
            data: wishlist,
        });
    }),

    removeFromWishlist: catchAsync(async (req: Request, res: Response) => {
        const wishlist = await WishlistService.removeFromWishlist(
            req.user!.userId,
            req.params.productId
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Removed from wishlist',
            data: wishlist,
        });
    }),

    toggleWishlist: catchAsync(async (req: Request, res: Response) => {
        const result = await WishlistService.toggleWishlist(
            req.user!.userId,
            req.params.productId
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
            data: result,
        });
    }),

    isInWishlist: catchAsync(async (req: Request, res: Response) => {
        const isInWishlist = await WishlistService.isInWishlist(
            req.user!.userId,
            req.params.productId
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Check completed',
            data: { isInWishlist },
        });
    }),

    clearWishlist: catchAsync(async (req: Request, res: Response) => {
        await WishlistService.clearWishlist(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Wishlist cleared',
            data: null,
        });
    }),

    getWishlistCount: catchAsync(async (req: Request, res: Response) => {
        const count = await WishlistService.getWishlistCount(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Wishlist count fetched',
            data: { count },
        });
    }),

    updateNotificationPreferences: catchAsync(async (req: Request, res: Response) => {
        const wishlist = await WishlistService.updateNotificationPreferences(
            req.user!.userId,
            req.params.productId,
            req.body
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Preferences updated',
            data: wishlist,
        });
    }),

    moveAllToCart: catchAsync(async (req: Request, res: Response) => {
        const result = await WishlistService.moveAllToCart(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `${result.added} items added to cart`,
            data: result,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

router.get('/', authMiddleware, WishlistController.getWishlist);
router.get('/count', authMiddleware, WishlistController.getWishlistCount);
router.get('/check/:productId', authMiddleware, WishlistController.isInWishlist);

router.post('/', authMiddleware, validateRequest(addToWishlistValidation), WishlistController.addToWishlist);
router.post('/toggle/:productId', authMiddleware, WishlistController.toggleWishlist);
router.post('/move-to-cart', authMiddleware, WishlistController.moveAllToCart);

router.patch('/:productId/preferences', authMiddleware, WishlistController.updateNotificationPreferences);

router.delete('/:productId', authMiddleware, WishlistController.removeFromWishlist);
router.delete('/', authMiddleware, WishlistController.clearWishlist);

export const WishlistRoutes = router;
export default WishlistService;
