// ===================================================================
// Mega E-Commerce Backend - Product Model
// MongoDB Schema for Products - COMPLETE VERSION (100% Professional)
// ===================================================================

import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
    {
        // ==================== Basic Info ====================
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
        highlights: {
            type: [String],
            default: [],
        },

        // ==================== Media ====================
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
        gallery: [{
            type: { type: String, enum: ['image', 'video', '360view'] },
            url: { type: String },
            alt: { type: String },
        }],

        // ==================== Pricing ====================
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
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        taxIncluded: {
            type: Boolean,
            default: true,
        },

        // ==================== Inventory ====================
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
        minOrderQuantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        maxOrderQuantity: {
            type: Number,
            default: 100,
        },
        soldIndividually: {
            type: Boolean,
            default: false,
        },

        // ==================== Categorization ====================
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
        collections: {
            type: [String],
            default: [],
        },

        // ==================== Specifications ====================
        specifications: [{
            group: { type: String },
            name: { type: String, required: true },
            value: { type: String, required: true },
        }],

        // ==================== Attributes & Variations ====================
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

        // ==================== Physical Properties ====================
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

        // ==================== Status & Visibility ====================
        status: {
            type: String,
            enum: ['active', 'draft', 'archived', 'discontinued'],
            default: 'draft',
        },
        visibility: {
            type: String,
            enum: ['visible', 'hidden', 'featured', 'catalog', 'search'],
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
        isNewProduct: {
            type: Boolean,
            default: true,
        },
        isOnSale: {
            type: Boolean,
            default: false,
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        isTopRated: {
            type: Boolean,
            default: false,
        },
        isExclusive: {
            type: Boolean,
            default: false,
        },

        // ==================== Sale & Promotion ====================
        saleStartDate: {
            type: Date,
        },
        saleEndDate: {
            type: Date,
        },
        promotionLabel: {
            type: String,
            maxlength: 50,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
        },
        discountValue: {
            type: Number,
            min: 0,
        },

        // ==================== Warranty ====================
        warranty: {
            hasWarranty: { type: Boolean, default: false },
            duration: { type: Number },
            durationUnit: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
            type: { type: String, enum: ['manufacturer', 'seller', 'extended'] },
            description: { type: String },
            terms: { type: String },
        },

        // ==================== Return Policy ====================
        returnPolicy: {
            isReturnable: { type: Boolean, default: true },
            returnDays: { type: Number, default: 7 },
            restockingFee: { type: Number, default: 0 },
            conditions: { type: String },
        },

        // ==================== Shipping ====================
        shipping: {
            freeShipping: { type: Boolean, default: false },
            shippingCost: { type: Number },
            estimatedDays: { type: Number },
            shippingClass: { type: String, enum: ['standard', 'express', 'overnight'], default: 'standard' },
            availableAreas: { type: [String], default: [] },
            restrictions: { type: String },
        },

        // ==================== Manufacturer & Origin ====================
        manufacturer: {
            name: { type: String },
            country: { type: String },
            website: { type: String },
            contactEmail: { type: String },
        },
        countryOfOrigin: {
            type: String,
        },
        madeIn: {
            type: String,
        },
        modelNumber: {
            type: String,
        },
        upc: {
            type: String,
        },
        isbn: {
            type: String,
        },
        ean: {
            type: String,
        },

        // ==================== Related Products ====================
        relatedProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
        crossSellProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
        upSellProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],

        // ==================== Downloadable (Digital Products) ====================
        isDigital: {
            type: Boolean,
            default: false,
        },
        downloadable: {
            fileUrl: { type: String },
            fileName: { type: String },
            fileSize: { type: Number },
            downloadLimit: { type: Number },
            expiryDays: { type: Number },
        },

        // ==================== Statistics ====================
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
        cartCount: {
            type: Number,
            default: 0,
        },

        // ==================== SEO ====================
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            metaKeywords: { type: [String], default: [] },
            canonicalUrl: { type: String },
        },

        // ==================== Admin Notes ====================
        internalNotes: {
            type: String,
        },
        supplier: {
            type: String,
        },
        supplierProductId: {
            type: String,
        },

        // ==================== Timestamps ====================
        publishedAt: {
            type: Date,
        },
        lastRestockedAt: {
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
productSchema.index({ isBestSeller: 1, status: 1 });
productSchema.index({ isNewProduct: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'warranty.hasWarranty': 1 });
productSchema.index({ 'shipping.freeShipping': 1 });
productSchema.index({ countryOfOrigin: 1 });
productSchema.index({ collections: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

// ==================== Virtuals ====================
productSchema.virtual('isInStock').get(function (this: IProduct) {
    if (!this.trackQuantity) return true;
    if (this.hasVariations && this.variants.length > 0) {
        return this.variants.some(v => v.stock > 0);
    }
    return this.quantity > 0;
});

productSchema.virtual('isLowStock').get(function (this: IProduct) {
    if (!this.trackQuantity) return false;
    return this.quantity <= this.lowStockThreshold && this.quantity > 0;
});

productSchema.virtual('discountPercentage').get(function (this: IProduct) {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

productSchema.virtual('finalPrice').get(function (this: IProduct) {
    // If on sale and has discount value
    if (this.isOnSale && this.discountValue) {
        if (this.discountType === 'percentage') {
            return this.price - (this.price * this.discountValue / 100);
        } else if (this.discountType === 'fixed') {
            return this.price - this.discountValue;
        }
    }
    return this.price;
});

productSchema.virtual('profit').get(function (this: IProduct) {
    if (this.costPrice) {
        return this.price - this.costPrice;
    }
    return 0;
});

productSchema.virtual('profitMargin').get(function (this: IProduct) {
    if (this.costPrice && this.price > 0) {
        return Math.round(((this.price - this.costPrice) / this.price) * 100);
    }
    return 0;
});

productSchema.virtual('totalStock').get(function (this: IProduct) {
    if (this.hasVariations && this.variants.length > 0) {
        return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return this.quantity;
});

// ==================== Pre-save Middleware ====================
productSchema.pre<IProduct>('save', function (next) {
    // Generate slug from name if not provided
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);
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

    // Auto-set isBestSeller based on sales
    if (this.salesCount >= 100) {
        this.isBestSeller = true;
    }

    // Auto-set isTopRated based on rating
    if (this.rating >= 4.5 && this.reviewCount >= 10) {
        this.isTopRated = true;
    }

    // Auto-disable isNew after 30 days
    if (this.createdAt) {
        const daysSinceCreation = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 30) {
            this.isNewProduct = false;
        }
    }

    next();
});

// ==================== Static Methods ====================
productSchema.statics.findBySlug = function (slug: string) {
    return this.findOne({ slug, status: 'active', isActive: true });
};

productSchema.statics.findFeatured = function (limit: number = 10) {
    return this.find({ isFeatured: true, status: 'active', isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

productSchema.statics.findBestSellers = function (limit: number = 10) {
    return this.find({ status: 'active', isActive: true })
        .sort({ salesCount: -1 })
        .limit(limit);
};

productSchema.statics.findOnSale = function (limit: number = 10) {
    return this.find({ isOnSale: true, status: 'active', isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

productSchema.statics.findNew = function (limit: number = 10) {
    return this.find({ isNewProduct: true, status: 'active', isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

productSchema.statics.findByCategory = function (categoryId: string, limit: number = 20) {
    return this.find({ category: categoryId, status: 'active', isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

productSchema.statics.incrementViewCount = function (productId: string) {
    return this.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
};

productSchema.statics.updateStock = function (productId: string, quantity: number) {
    return this.findByIdAndUpdate(
        productId,
        {
            $inc: { quantity: -quantity, salesCount: 1 },
            $set: { lastRestockedAt: quantity > 0 ? new Date() : undefined }
        },
        { new: true }
    );
};

export const Product = model<IProduct>('Product', productSchema);
