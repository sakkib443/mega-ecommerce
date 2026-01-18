// ===================================================================
// Mega E-Commerce Backend - Product Interface
// TypeScript interfaces for Product module
// ===================================================================

import { Types, Document } from 'mongoose';

// Product Attribute Interface
export interface IProductAttribute {
    name: string;
    value: string;
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
}

// Main Product Interface
export interface IProduct extends Document {
    _id: Types.ObjectId;

    // Basic Info
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;

    // Media
    images: string[];
    thumbnail: string;
    video?: string;

    // Pricing
    price: number;
    comparePrice?: number;    // Original price (for discounts)
    costPrice?: number;       // Cost to business

    // Inventory
    sku?: string;
    barcode?: string;
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
    allowBackorder: boolean;

    // Categorization
    category: Types.ObjectId;
    subCategory?: Types.ObjectId;
    brand?: string;
    tags: string[];

    // Attributes & Variations
    attributes: IProductAttribute[];
    hasVariations: boolean;
    variations: IProductVariation[];
    variants: IProductVariant[];

    // Physical Properties
    weight?: number;
    weightUnit?: 'kg' | 'g' | 'lb';
    dimensions?: IProductDimensions;

    // Status & Visibility
    status: 'active' | 'draft' | 'archived';
    visibility: 'visible' | 'hidden' | 'featured';
    isActive: boolean;
    isFeatured: boolean;
    isNew: boolean;
    isOnSale: boolean;

    // Sale Dates
    saleStartDate?: Date;
    saleEndDate?: Date;

    // Statistics
    rating: number;
    reviewCount: number;
    salesCount: number;
    viewCount: number;
    wishlistCount: number;

    // SEO
    seo?: IProductSEO;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
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
    isNew?: boolean;
    search?: string;
    tags?: string[];
    inStock?: boolean;
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
    | 'rating';
