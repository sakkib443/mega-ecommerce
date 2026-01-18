// ===================================================================
// Mega E-Commerce Backend - Category Model
// MongoDB Category Schema with Parent-Child Relationship
// ===================================================================

import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        banner: {
            type: String,
            default: '',
        },

        // Parent-Child Relationship
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        level: {
            type: Number,
            default: 0,  // 0 = root category
        },
        ancestors: [{
            type: Schema.Types.ObjectId,
            ref: 'Category',
        }],

        // Status
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Display
        order: {
            type: Number,
            default: 0,
        },
        showInMenu: {
            type: Boolean,
            default: true,
        },
        showInHome: {
            type: Boolean,
            default: false,
        },

        // Statistics
        productCount: {
            type: Number,
            default: 0,
        },

        // SEO
        metaTitle: {
            type: String,
            maxlength: [100, 'Meta title cannot exceed 100 characters'],
        },
        metaDescription: {
            type: String,
            maxlength: [300, 'Meta description cannot exceed 300 characters'],
        },
        metaKeywords: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// ==================== Indexes ====================
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ status: 1, isActive: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ showInMenu: 1 });
categorySchema.index({ showInHome: 1 });

// ==================== Virtuals ====================
// Get child categories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory',
});

// Check if category is a parent
categorySchema.virtual('isParent').get(function () {
    return this.level === 0 && !this.parentCategory;
});

// ==================== Pre-save Middleware ====================
categorySchema.pre('save', async function (next) {
    // Generate slug from name if not provided
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Update level and ancestors based on parent
    if (this.isModified('parentCategory')) {
        if (this.parentCategory) {
            const parent = await Category.findById(this.parentCategory);
            if (parent) {
                this.level = parent.level + 1;
                this.ancestors = [...parent.ancestors, parent._id];
            }
        } else {
            this.level = 0;
            this.ancestors = [];
        }
    }

    next();
});

// ==================== Static Methods ====================
categorySchema.statics.getTree = async function () {
    const categories = await this.find({ status: 'active' })
        .sort({ order: 1, name: 1 })
        .lean();

    // Build tree structure
    const categoryMap = new Map();
    const tree: any[] = [];

    categories.forEach((cat: any) => {
        categoryMap.set(cat._id.toString(), { ...cat, children: [] });
    });

    categories.forEach((cat: any) => {
        const category = categoryMap.get(cat._id.toString());
        if (cat.parentCategory) {
            const parent = categoryMap.get(cat.parentCategory.toString());
            if (parent) {
                parent.children.push(category);
            }
        } else {
            tree.push(category);
        }
    });

    return tree;
};

export const Category = model<ICategory>('Category', categorySchema);
