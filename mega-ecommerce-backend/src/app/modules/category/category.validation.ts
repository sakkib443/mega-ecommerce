// ===================================================================
// Mega E-Commerce Backend - Category Validation
// Zod validation schemas for Category
// ===================================================================

import { z } from 'zod';

// ==================== Create Category Validation ====================
export const createCategoryValidation = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Category name is required' })
            .min(1, 'Category name is required')
            .max(100, 'Name cannot exceed 100 characters'),
        slug: z.string().optional(),
        description: z.string().max(500).optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        banner: z.string().optional(),

        // Parent-Child
        parentCategory: z.string().optional(),

        // Status
        status: z.enum(['active', 'inactive']).default('active'),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),

        // Display
        order: z.number().min(0).default(0),
        showInMenu: z.boolean().default(true),
        showInHome: z.boolean().default(false),

        // SEO
        metaTitle: z.string().max(100).optional(),
        metaDescription: z.string().max(300).optional(),
        metaKeywords: z.array(z.string()).optional(),
    }),
});

// ==================== Update Category Validation ====================
export const updateCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        slug: z.string().optional(),
        description: z.string().max(500).optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        banner: z.string().optional(),

        parentCategory: z.string().nullable().optional(),

        status: z.enum(['active', 'inactive']).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),

        order: z.number().min(0).optional(),
        showInMenu: z.boolean().optional(),
        showInHome: z.boolean().optional(),

        metaTitle: z.string().max(100).optional(),
        metaDescription: z.string().max(300).optional(),
        metaKeywords: z.array(z.string()).optional(),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategoryValidation>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategoryValidation>['body'];
