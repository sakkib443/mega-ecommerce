// ===================================================================
// Mega E-Commerce Backend - Product Model
// MongoDB Schema for Products
// ===================================================================

import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
    {
        // Basic Info
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        shortDescription: {
            type: String,
            maxlength: [500, 'Short description cannot exceed 500 characters'],
        },

        // Media
        images: {
            type: [String],
            default: [],
        },
        thumbnail: {
            type: String,
            required: [true, 'Product thumbnail is required'],
        },
        video: {
            type: String,
        },

        // Pricing
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        comparePrice: {
            type: Number,
            min: [0, 'Compare price cannot be negative'],
        },
        costPrice: {
            type: Number,
            min: [0, 'Cost price cannot be negative'],
        },

        // Inventory
        sku: {
            type: String,
            unique: true,
            sparse: true,
        },
        barcode: {
            type: String,
        },
        quantity: {
            type: Number,
            default: 0,
            min: [0, 'Quantity cannot be negative'],
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
        trackQuantity: {
            type: Boolean,
            default: true,
        },
        allowBackorder: {
            type: Boolean,
            default: false,
        },

        // Categorization
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product category is required'],
        },
        subCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        brand: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },

        // Attributes & Variations
        attributes: [{
            name: { type: String, required: true },
            value: { type: String, required: true },
        }],
        hasVariations: {
            type: Boolean,
            default: false,
        },
        variations: [{
            name: { type: String, required: true },
            options: [{ type: String }],
            priceModifier: { type: Number, default: 0 },
        }],
        variants: [{
            sku: { type: String, required: true },
            attributes: [{
                name: { type: String, required: true },
                value: { type: String, required: true },
            }],
            price: { type: Number, required: true },
            comparePrice: { type: Number },
            stock: { type: Number, default: 0 },
            image: { type: String },
            isActive: { type: Boolean, default: true },
        }],

        // Physical Properties
        weight: {
            type: Number,
        },
        weightUnit: {
            type: String,
            enum: ['kg', 'g', 'lb'],
            default: 'kg',
        },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
            unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
        },

        // Status & Visibility
        status: {
            type: String,
            enum: ['active', 'draft', 'archived'],
            default: 'draft',
        },
        visibility: {
            type: String,
            enum: ['visible', 'hidden', 'featured'],
            default: 'visible',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: true,
        },
        isOnSale: {
            type: Boolean,
            default: false,
        },

        // Sale Dates
        saleStartDate: {
            type: Date,
        },
        saleEndDate: {
            type: Date,
        },

        // Statistics
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        salesCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        wishlistCount: {
            type: Number,
            default: 0,
        },

        // SEO
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            metaKeywords: { type: [String], default: [] },
        },

        // Timestamps
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// ==================== Indexes ====================
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isOnSale: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ==================== Virtuals ====================
productSchema.virtual('isInStock').get(function () {
    if (!this.trackQuantity) return true;
    if (this.hasVariations && this.variants.length > 0) {
        return this.variants.some(v => v.stock > 0);
    }
    return this.quantity > 0;
});

productSchema.virtual('isLowStock').get(function () {
    if (!this.trackQuantity) return false;
    return this.quantity <= this.lowStockThreshold && this.quantity > 0;
});

productSchema.virtual('discountPercentage').get(function () {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// ==================== Pre-save Middleware ====================
productSchema.pre('save', function (next) {
    // Generate slug from name if not provided
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Set publishedAt when status changes to active
    if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    // Check if sale is active
    const now = new Date();
    if (this.saleStartDate && this.saleEndDate) {
        this.isOnSale = now >= this.saleStartDate && now <= this.saleEndDate;
    }

    next();
});

export const Product = model<IProduct>('Product', productSchema);
