// ===================================================================
// Mega E-Commerce Backend - Category Interface
// TypeScript interfaces for Category module
// ===================================================================

import { Types, Document } from 'mongoose';

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    banner?: string;

    // Parent-Child Relationship
    parentCategory: Types.ObjectId | null;
    level: number;          // 0 = root, 1 = child, 2 = grandchild
    ancestors: Types.ObjectId[];  // All parent IDs for easy querying

    // Status
    status: 'active' | 'inactive';
    isActive: boolean;
    isFeatured: boolean;

    // Display
    order: number;
    showInMenu: boolean;
    showInHome: boolean;

    // Statistics
    productCount: number;

    // SEO
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryWithChildren extends ICategory {
    children?: ICategoryWithChildren[];
}
