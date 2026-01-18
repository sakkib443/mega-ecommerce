// ===================================================================
// Mega E-Commerce Backend - Product Validation
// Zod validation schemas for Product
// ===================================================================

import { z } from 'zod';

// Product Attribute Schema
const attributeSchema = z.object({
    name: z.string().min(1, 'Attribute name is required'),
    value: z.string().min(1, 'Attribute value is required'),
});

// Product Variation Schema
const variationSchema = z.object({
    name: z.string().min(1, 'Variation name is required'),
    options: z.array(z.string()).min(1, 'At least one option is required'),
    priceModifier: z.number().optional(),
});

// Product Variant Schema
const variantSchema = z.object({
    sku: z.string().min(1, 'Variant SKU is required'),
    attributes: z.array(attributeSchema).min(1),
    price: z.number().min(0, 'Price cannot be negative'),
    comparePrice: z.number().min(0).optional(),
    stock: z.number().min(0).default(0),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
});

// Dimensions Schema
const dimensionsSchema = z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(['cm', 'inch']).optional(),
});

// SEO Schema
const seoSchema = z.object({
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(300).optional(),
    metaKeywords: z.array(z.string()).optional(),
});

// ==================== Create Product Validation ====================
export const createProductValidation = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Product name is required' })
            .min(1, 'Product name is required')
            .max(200, 'Name cannot exceed 200 characters'),
        slug: z.string().optional(),
        description: z
            .string({ required_error: 'Product description is required' })
            .min(1, 'Product description is required'),
        shortDescription: z.string().max(500).optional(),

        // Media
        images: z.array(z.string()).default([]),
        thumbnail: z.string({ required_error: 'Product thumbnail is required' }),
        video: z.string().optional(),

        // Pricing
        price: z
            .number({ required_error: 'Product price is required' })
            .min(0, 'Price cannot be negative'),
        comparePrice: z.number().min(0).optional(),
        costPrice: z.number().min(0).optional(),

        // Inventory
        sku: z.string().optional(),
        barcode: z.string().optional(),
        quantity: z.number().min(0).default(0),
        lowStockThreshold: z.number().min(0).default(5),
        trackQuantity: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),

        // Categorization
        category: z.string({ required_error: 'Product category is required' }),
        subCategory: z.string().optional(),
        brand: z.string().optional(),
        tags: z.array(z.string()).default([]),

        // Attributes & Variations
        attributes: z.array(attributeSchema).default([]),
        hasVariations: z.boolean().default(false),
        variations: z.array(variationSchema).default([]),
        variants: z.array(variantSchema).default([]),

        // Physical Properties
        weight: z.number().min(0).optional(),
        weightUnit: z.enum(['kg', 'g', 'lb']).default('kg'),
        dimensions: dimensionsSchema.optional(),

        // Status & Visibility
        status: z.enum(['active', 'draft', 'archived']).default('draft'),
        visibility: z.enum(['visible', 'hidden', 'featured']).default('visible'),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        isNew: z.boolean().default(true),
        isOnSale: z.boolean().default(false),

        // Sale Dates
        saleStartDate: z.string().datetime().optional(),
        saleEndDate: z.string().datetime().optional(),

        // SEO
        seo: seoSchema.optional(),
    }),
});

// ==================== Update Product Validation ====================
export const updateProductValidation = z.object({
    body: z.object({
        name: z.string().min(1).max(200).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),

        images: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
        video: z.string().optional(),

        price: z.number().min(0).optional(),
        comparePrice: z.number().min(0).optional(),
        costPrice: z.number().min(0).optional(),

        sku: z.string().optional(),
        barcode: z.string().optional(),
        quantity: z.number().min(0).optional(),
        lowStockThreshold: z.number().min(0).optional(),
        trackQuantity: z.boolean().optional(),
        allowBackorder: z.boolean().optional(),

        category: z.string().optional(),
        subCategory: z.string().optional(),
        brand: z.string().optional(),
        tags: z.array(z.string()).optional(),

        attributes: z.array(attributeSchema).optional(),
        hasVariations: z.boolean().optional(),
        variations: z.array(variationSchema).optional(),
        variants: z.array(variantSchema).optional(),

        weight: z.number().min(0).optional(),
        weightUnit: z.enum(['kg', 'g', 'lb']).optional(),
        dimensions: dimensionsSchema.optional(),

        status: z.enum(['active', 'draft', 'archived']).optional(),
        visibility: z.enum(['visible', 'hidden', 'featured']).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        isOnSale: z.boolean().optional(),

        saleStartDate: z.string().datetime().optional(),
        saleEndDate: z.string().datetime().optional(),

        seo: seoSchema.optional(),
    }),
});

// ==================== Query Validation ====================
export const getProductsValidation = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
        brand: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        status: z.enum(['active', 'draft', 'archived']).optional(),
        visibility: z.enum(['visible', 'hidden', 'featured']).optional(),
        isFeatured: z.string().optional(),
        isOnSale: z.string().optional(),
        isNew: z.string().optional(),
        search: z.string().optional(),
        tags: z.string().optional(), // comma-separated
        inStock: z.string().optional(),
        sort: z.enum([
            'newest',
            'oldest',
            'price-low',
            'price-high',
            'name-asc',
            'name-desc',
            'bestselling',
            'rating',
        ]).optional(),
    }),
});

// Export types
export type CreateProductInput = z.infer<typeof createProductValidation>['body'];
export type UpdateProductInput = z.infer<typeof updateProductValidation>['body'];
