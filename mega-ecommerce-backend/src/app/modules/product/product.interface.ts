// ===================================================================
// Mega E-Commerce Backend - Product Interface
// TypeScript interfaces for Product module - COMPLETE VERSION
// ===================================================================

import { Types, Document } from 'mongoose';

// Product Attribute Interface
export interface IProductAttribute {
    name: string;
    value: string;
}

// Product Specification Interface (Technical Details)
export interface IProductSpecification {
    group: string;      // e.g., "Display", "Battery", "Camera"
    name: string;       // e.g., "Screen Size", "Battery Capacity"
    value: string;      // e.g., "6.7 inches", "4422 mAh"
}

// Product Variation Interface
export interface IProductVariation {
    name: string;        // e.g., "Size", "Color"
    options: string[];   // e.g., ["S", "M", "L", "XL"]
    priceModifier?: number; // Additional price for this variation
}

// Product Variant (Specific combination)
export interface IProductVariant {
    sku: string;
    attributes: { name: string; value: string }[];
    price: number;
    comparePrice?: number;
    stock: number;
    image?: string;
    isActive: boolean;
}

// Product Dimensions
export interface IProductDimensions {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'cm' | 'inch';
}

// SEO Fields
export interface IProductSEO {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
}

// Warranty Interface
export interface IProductWarranty {
    hasWarranty: boolean;
    duration?: number;          // in months
    durationUnit?: 'days' | 'months' | 'years';
    type?: 'manufacturer' | 'seller' | 'extended';
    description?: string;
    terms?: string;
}

// Return Policy Interface
export interface IProductReturnPolicy {
    isReturnable: boolean;
    returnDays?: number;        // e.g., 7 days, 14 days
    restockingFee?: number;     // percentage or fixed
    conditions?: string;        // e.g., "Unopened packages only"
}

// Shipping Info Interface
export interface IProductShipping {
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDays?: number;
    shippingClass?: 'standard' | 'express' | 'overnight';
    availableAreas?: string[];  // e.g., ["Dhaka", "Chittagong"]
    restrictions?: string;
}

// Manufacturer Info Interface
export interface IProductManufacturer {
    name?: string;
    country?: string;
    website?: string;
    contactEmail?: string;
}

// Main Product Interface
export interface IProduct extends Document {
    _id: Types.ObjectId;

    // ==================== Basic Info ====================
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    highlights?: string[];          // Key features bullet points

    // ==================== Media ====================
    images: string[];
    thumbnail: string;
    video?: string;
    gallery?: {                     // Additional media
        type: 'image' | 'video' | '360view';
        url: string;
        alt?: string;
    }[];

    // ==================== Pricing ====================
    price: number;
    comparePrice?: number;          // Original price (for discounts)
    costPrice?: number;             // Cost to business
    taxRate?: number;               // Tax percentage
    taxIncluded?: boolean;          // Is tax included in price?

    // ==================== Inventory ====================
    sku?: string;
    barcode?: string;
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
    minOrderQuantity?: number;      // Minimum order qty
    maxOrderQuantity?: number;      // Maximum order qty
    soldIndividually?: boolean;     // Only 1 per order

    // ==================== Categorization ====================
    category: Types.ObjectId;
    subCategory?: Types.ObjectId;
    brand?: string;
    tags: string[];
    collections?: string[];         // Product collections

    // ==================== Specifications ====================
    specifications?: IProductSpecification[];

    // ==================== Attributes & Variations ====================
    attributes: IProductAttribute[];
    hasVariations: boolean;
    variations: IProductVariation[];
    variants: IProductVariant[];

    // ==================== Physical Properties ====================
    weight?: number;
    weightUnit?: 'kg' | 'g' | 'lb';
    dimensions?: IProductDimensions;

    // ==================== Status & Visibility ====================
    status: 'active' | 'draft' | 'archived' | 'discontinued';
    visibility: 'visible' | 'hidden' | 'featured' | 'catalog' | 'search';
    isActive: boolean;
    isFeatured: boolean;
    isNewProduct: boolean;
    isOnSale: boolean;
    isBestSeller?: boolean;
    isTopRated?: boolean;
    isExclusive?: boolean;          // Only on this platform

    // ==================== Sale & Promotion ====================
    saleStartDate?: Date;
    saleEndDate?: Date;
    promotionLabel?: string;        // e.g., "Flash Sale", "Eid Special"
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;

    // ==================== Warranty & Return ====================
    warranty?: IProductWarranty;
    returnPolicy?: IProductReturnPolicy;

    // ==================== Shipping ====================
    shipping?: IProductShipping;

    // ==================== Manufacturer & Origin ====================
    manufacturer?: IProductManufacturer;
    countryOfOrigin?: string;
    madeIn?: string;
    modelNumber?: string;
    upc?: string;                   // Universal Product Code
    isbn?: string;                  // For books
    ean?: string;                   // European Article Number

    // ==================== Related Products ====================
    relatedProducts?: Types.ObjectId[];
    crossSellProducts?: Types.ObjectId[];   // "Frequently bought together"
    upSellProducts?: Types.ObjectId[];      // "Upgrade to..."

    // ==================== Downloadable (Digital Products) ====================
    isDigital?: boolean;
    downloadable?: {
        fileUrl: string;
        fileName: string;
        fileSize?: number;
        downloadLimit?: number;
        expiryDays?: number;
    };

    // ==================== Statistics ====================
    rating: number;
    reviewCount: number;
    salesCount: number;
    viewCount: number;
    wishlistCount: number;
    cartCount?: number;             // Currently in carts

    // ==================== SEO ====================
    seo?: IProductSEO;

    // ==================== Admin Notes ====================
    internalNotes?: string;         // Admin only notes
    supplier?: string;
    supplierProductId?: string;

    // ==================== Timestamps ====================
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    lastRestockedAt?: Date;

    // ==================== Virtual Properties ====================
    isInStock?: boolean;
    isLowStock?: boolean;
    discountPercentage?: number;
    finalPrice?: number;
}

// Product Query Filters
export interface IProductFilters {
    category?: string;
    subCategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    visibility?: string;
    isFeatured?: boolean;
    isOnSale?: boolean;
    isNewProduct?: boolean;
    isBestSeller?: boolean;
    hasWarranty?: boolean;
    freeShipping?: boolean;
    search?: string;
    tags?: string[];
    collections?: string[];
    inStock?: boolean;
    rating?: number;            // Minimum rating
    countryOfOrigin?: string;
}

// Product Sort Options
export type ProductSortOption =
    | 'newest'
    | 'oldest'
    | 'price-low'
    | 'price-high'
    | 'name-asc'
    | 'name-desc'
    | 'bestselling'
    | 'rating'
    | 'popularity'
    | 'discount';

// Product Create/Update Input Types
export type ProductCreateInput = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'salesCount' | 'viewCount' | 'wishlistCount'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;
