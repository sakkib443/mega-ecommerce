// ===================================================================
// Mega E-Commerce Backend - Cart Module
// Enhanced Shopping Cart with Product variants support
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

// ==================== INTERFACE ====================
export interface ICartItem {
    product: Types.ObjectId;
    variant?: {
        sku: string;
        attributes: { name: string; value: string }[];
    };
    quantity: number;
    price: number;
    name: string;
    image?: string;
    addedAt: Date;
}

export interface ICart {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    items: ICartItem[];
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
    couponCode?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// ==================== MODEL ====================
const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variant: {
        sku: String,
        attributes: [{
            name: String,
            value: String,
        }],
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
        itemCount: {
            type: Number,
            default: 0,
        },
        subtotal: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
        couponCode: String,
        notes: String,
    },
    { timestamps: true }
);

// Index
cartSchema.index({ user: 1 });

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal - this.discount;
    if (this.total < 0) this.total = 0;
    next();
});

export const Cart = model<ICart>('Cart', cartSchema);

// ==================== VALIDATION ====================
export const addToCartValidation = z.object({
    body: z.object({
        productId: z.string({ required_error: 'Product ID is required' }),
        quantity: z.number().min(1).default(1),
        variant: z.object({
            sku: z.string(),
            attributes: z.array(z.object({
                name: z.string(),
                value: z.string(),
            })),
        }).optional(),
    }),
});

export const updateCartItemValidation = z.object({
    body: z.object({
        quantity: z.number().min(1, 'Quantity must be at least 1'),
    }),
});

// ==================== SERVICE ====================
const CartService = {
    // Get user cart
    async getCart(userId: string): Promise<ICart | null> {
        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name slug thumbnail price comparePrice quantity status',
        });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        return cart;
    },

    // Add item to cart
    async addToCart(
        userId: string,
        productId: string,
        quantity: number = 1,
        variant?: { sku: string; attributes: { name: string; value: string }[] }
    ): Promise<ICart> {
        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }
        if (product.status !== 'active') {
            throw new AppError(400, 'Product is not available');
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Determine price and check stock
        let itemPrice = product.price;
        let availableStock = product.quantity;

        if (variant && product.hasVariations) {
            const productVariant = product.variants.find(v => v.sku === variant.sku);
            if (!productVariant) {
                throw new AppError(400, 'Invalid product variant');
            }
            if (!productVariant.isActive) {
                throw new AppError(400, 'This variant is not available');
            }
            itemPrice = productVariant.price;
            availableStock = productVariant.stock;
        }

        // Check stock
        if (product.trackQuantity && availableStock < quantity && !product.allowBackorder) {
            throw new AppError(400, `Only ${availableStock} items available in stock`);
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(item => {
            const sameProduct = item.product.toString() === productId;
            if (!variant) return sameProduct && !item.variant;
            return sameProduct && item.variant?.sku === variant.sku;
        });

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (product.trackQuantity && availableStock < newQuantity && !product.allowBackorder) {
                throw new AppError(400, `Only ${availableStock} items available in stock`);
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: new Types.ObjectId(productId),
                variant,
                quantity,
                price: itemPrice,
                name: product.name,
                image: product.thumbnail,
                addedAt: new Date(),
            });
        }

        await cart.save();
        return cart;
    },

    // Update cart item quantity
    async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ICart> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new AppError(404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
        if (itemIndex === -1) {
            throw new AppError(404, 'Item not found in cart');
        }

        // Validate stock
        const product = await Product.findById(cart.items[itemIndex].product);
        if (product && product.trackQuantity) {
            let availableStock = product.quantity;
            if (cart.items[itemIndex].variant && product.hasVariations) {
                const variant = product.variants.find(v => v.sku === cart.items[itemIndex].variant?.sku);
                if (variant) availableStock = variant.stock;
            }
            if (availableStock < quantity && !product.allowBackorder) {
                throw new AppError(400, `Only ${availableStock} items available in stock`);
            }
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return cart;
    },

    // Remove item from cart
    async removeFromCart(userId: string, itemId: string): Promise<ICart> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new AppError(404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
        if (itemIndex === -1) {
            throw new AppError(404, 'Item not found in cart');
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return cart;
    },

    // Remove item by product ID
    async removeByProductId(userId: string, productId: string): Promise<ICart | null> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return null;

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        return cart;
    },

    // Clear cart
    async clearCart(userId: string): Promise<void> {
        await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], itemCount: 0, subtotal: 0, discount: 0, total: 0, couponCode: null }
        );
    },

    // Apply coupon
    async applyCoupon(userId: string, couponCode: string): Promise<ICart> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new AppError(404, 'Cart not found');
        }

        // TODO: Validate coupon and calculate discount
        // This will be implemented when we create the coupon module

        cart.couponCode = couponCode;
        // cart.discount = calculatedDiscount;
        await cart.save();

        return cart;
    },

    // Remove coupon
    async removeCoupon(userId: string): Promise<ICart> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new AppError(404, 'Cart not found');
        }

        cart.couponCode = undefined;
        cart.discount = 0;
        await cart.save();

        return cart;
    },

    // Validate cart (check stock and prices)
    async validateCart(userId: string): Promise<{ valid: boolean; issues: string[] }> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return { valid: true, issues: [] };
        }

        const issues: string[] = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                issues.push(`Product "${item.name}" is no longer available`);
                continue;
            }

            if (product.status !== 'active') {
                issues.push(`Product "${item.name}" is not available`);
                continue;
            }

            // Check price changes
            let currentPrice = product.price;
            if (item.variant && product.hasVariations) {
                const variant = product.variants.find(v => v.sku === item.variant?.sku);
                if (variant) currentPrice = variant.price;
            }

            if (item.price !== currentPrice) {
                issues.push(`Price of "${item.name}" has changed from ৳${item.price} to ৳${currentPrice}`);
                // Update price in cart
                item.price = currentPrice;
            }

            // Check stock
            if (product.trackQuantity) {
                let availableStock = product.quantity;
                if (item.variant && product.hasVariations) {
                    const variant = product.variants.find(v => v.sku === item.variant?.sku);
                    if (variant) availableStock = variant.stock;
                }

                if (availableStock < item.quantity && !product.allowBackorder) {
                    if (availableStock === 0) {
                        issues.push(`"${item.name}" is out of stock`);
                    } else {
                        issues.push(`Only ${availableStock} units of "${item.name}" available`);
                    }
                }
            }
        }

        if (issues.length > 0) {
            await cart.save();
        }

        return { valid: issues.length === 0, issues };
    },

    // Get cart count
    async getCartCount(userId: string): Promise<number> {
        const cart = await Cart.findOne({ user: userId });
        return cart?.itemCount || 0;
    },
};

// ==================== CONTROLLER ====================
const CartController = {
    getCart: catchAsync(async (req: Request, res: Response) => {
        const cart = await CartService.getCart(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Cart fetched successfully',
            data: cart,
        });
    }),

    addToCart: catchAsync(async (req: Request, res: Response) => {
        const { productId, quantity, variant } = req.body;
        const cart = await CartService.addToCart(req.user!.userId, productId, quantity, variant);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Item added to cart',
            data: cart,
        });
    }),

    updateCartItem: catchAsync(async (req: Request, res: Response) => {
        const { quantity } = req.body;
        const cart = await CartService.updateCartItem(req.user!.userId, req.params.itemId, quantity);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Cart updated',
            data: cart,
        });
    }),

    removeFromCart: catchAsync(async (req: Request, res: Response) => {
        const cart = await CartService.removeFromCart(req.user!.userId, req.params.itemId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Item removed from cart',
            data: cart,
        });
    }),

    clearCart: catchAsync(async (req: Request, res: Response) => {
        await CartService.clearCart(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Cart cleared',
            data: null,
        });
    }),

    applyCoupon: catchAsync(async (req: Request, res: Response) => {
        const { code } = req.body;
        const cart = await CartService.applyCoupon(req.user!.userId, code);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Coupon applied',
            data: cart,
        });
    }),

    removeCoupon: catchAsync(async (req: Request, res: Response) => {
        const cart = await CartService.removeCoupon(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Coupon removed',
            data: cart,
        });
    }),

    validateCart: catchAsync(async (req: Request, res: Response) => {
        const result = await CartService.validateCart(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: result.valid ? 'Cart is valid' : 'Cart has issues',
            data: result,
        });
    }),

    getCartCount: catchAsync(async (req: Request, res: Response) => {
        const count = await CartService.getCartCount(req.user!.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Cart count fetched',
            data: { count },
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

router.get('/', authMiddleware, CartController.getCart);
router.get('/count', authMiddleware, CartController.getCartCount);
router.get('/validate', authMiddleware, CartController.validateCart);

router.post('/', authMiddleware, validateRequest(addToCartValidation), CartController.addToCart);
router.post('/coupon', authMiddleware, CartController.applyCoupon);

router.patch('/:itemId', authMiddleware, validateRequest(updateCartItemValidation), CartController.updateCartItem);

router.delete('/coupon', authMiddleware, CartController.removeCoupon);
router.delete('/:itemId', authMiddleware, CartController.removeFromCart);
router.delete('/', authMiddleware, CartController.clearCart);

export const CartRoutes = router;
export default CartService;
