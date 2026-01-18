// ===================================================================
// Mega E-Commerce Backend - Category Service
// Business logic for Category operations
// ===================================================================

import { Types } from 'mongoose';
import { Category } from './category.model';
import { ICategory, ICategoryWithChildren } from './category.interface';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';
import AppError from '../../utils/AppError';

// ==================== Helper Functions ====================
const generateSlug = (name: string): string => {
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const uniqueSuffix = Date.now().toString(36);
    return `${baseSlug}-${uniqueSuffix}`;
};

// ==================== Category Service ====================
const CategoryService = {
    // Create new category
    async createCategory(data: CreateCategoryInput): Promise<ICategory> {
        // Generate slug if not provided
        const slug = data.slug || generateSlug(data.name);

        // Check if slug already exists
        const existingSlug = await Category.findOne({ slug });
        if (existingSlug) {
            throw new AppError(400, 'Category with this slug already exists');
        }

        // Calculate level and ancestors if parent is provided
        let level = 0;
        let ancestors: Types.ObjectId[] = [];

        if (data.parentCategory) {
            const parent = await Category.findById(data.parentCategory);
            if (!parent) {
                throw new AppError(404, 'Parent category not found');
            }
            level = parent.level + 1;
            ancestors = [...parent.ancestors, parent._id];

            // Limit nesting level to 3
            if (level > 2) {
                throw new AppError(400, 'Maximum category nesting level is 3');
            }
        }

        const category = await Category.create({
            ...data,
            slug,
            level,
            ancestors,
            parentCategory: data.parentCategory ? new Types.ObjectId(data.parentCategory) : null,
        });

        return category;
    },

    // Get all categories (flat list)
    async getAllCategories(includeInactive: boolean = false): Promise<ICategory[]> {
        const query: any = {};
        if (!includeInactive) {
            query.status = 'active';
            query.isActive = true;
        }

        const categories = await Category.find(query)
            .populate('parentCategory', 'name slug')
            .sort({ order: 1, name: 1 })
            .lean();

        return categories as ICategory[];
    },

    // Get categories as tree structure
    async getCategoryTree(): Promise<ICategoryWithChildren[]> {
        const categories = await Category.find({ status: 'active', isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();

        // Build tree structure
        const categoryMap = new Map<string, ICategoryWithChildren>();
        const tree: ICategoryWithChildren[] = [];

        // First pass: create all nodes
        categories.forEach((cat: any) => {
            categoryMap.set(cat._id.toString(), { ...cat, children: [] });
        });

        // Second pass: build relationships
        categories.forEach((cat: any) => {
            const category = categoryMap.get(cat._id.toString())!;
            if (cat.parentCategory) {
                const parent = categoryMap.get(cat.parentCategory.toString());
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(category);
                }
            } else {
                tree.push(category);
            }
        });

        return tree;
    },

    // Get root categories (no parent)
    async getRootCategories(): Promise<ICategory[]> {
        const categories = await Category.find({
            status: 'active',
            isActive: true,
            parentCategory: null,
        })
            .sort({ order: 1, name: 1 })
            .lean();

        return categories as ICategory[];
    },

    // Get child categories
    async getChildCategories(parentId: string): Promise<ICategory[]> {
        const categories = await Category.find({
            status: 'active',
            isActive: true,
            parentCategory: new Types.ObjectId(parentId),
        })
            .sort({ order: 1, name: 1 })
            .lean();

        return categories as ICategory[];
    },

    // Get category by ID
    async getCategoryById(categoryId: string): Promise<ICategory> {
        const category = await Category.findById(categoryId)
            .populate('parentCategory', 'name slug');

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        return category;
    },

    // Get category by slug
    async getCategoryBySlug(slug: string): Promise<ICategory> {
        const category = await Category.findOne({ slug })
            .populate('parentCategory', 'name slug');

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        return category;
    },

    // Get category with children
    async getCategoryWithChildren(categoryId: string): Promise<ICategoryWithChildren> {
        const category = await Category.findById(categoryId).lean();

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        // Get all descendants
        const descendants = await Category.find({
            ancestors: categoryId,
            status: 'active',
        })
            .sort({ level: 1, order: 1 })
            .lean();

        // Build tree for this category
        const categoryWithChildren: ICategoryWithChildren = { ...(category as any), children: [] };

        const directChildren = descendants.filter(
            (d: any) => d.parentCategory?.toString() === categoryId
        );

        categoryWithChildren.children = directChildren.map((child: any) => ({
            ...child,
            children: descendants.filter(
                (d: any) => d.parentCategory?.toString() === child._id.toString()
            ),
        }));

        return categoryWithChildren as ICategoryWithChildren;
    },

    // Update category
    async updateCategory(categoryId: string, data: UpdateCategoryInput): Promise<ICategory> {
        // Check if slug is being updated and if it already exists
        if (data.slug) {
            const existingSlug = await Category.findOne({
                slug: data.slug,
                _id: { $ne: categoryId },
            });
            if (existingSlug) {
                throw new AppError(400, 'Category with this slug already exists');
            }
        }

        // Handle parent change
        let updateData: any = { ...data };
        if (data.parentCategory !== undefined) {
            if (data.parentCategory === null) {
                updateData.level = 0;
                updateData.ancestors = [];
                updateData.parentCategory = null;
            } else {
                // Prevent circular reference
                if (data.parentCategory === categoryId) {
                    throw new AppError(400, 'Category cannot be its own parent');
                }

                const parent = await Category.findById(data.parentCategory);
                if (!parent) {
                    throw new AppError(404, 'Parent category not found');
                }

                // Check if new parent is a descendant
                if (parent.ancestors.some(a => a.toString() === categoryId)) {
                    throw new AppError(400, 'Cannot set a descendant as parent');
                }

                updateData.level = parent.level + 1;
                updateData.ancestors = [...parent.ancestors, parent._id];
                updateData.parentCategory = new Types.ObjectId(data.parentCategory);

                if (updateData.level > 2) {
                    throw new AppError(400, 'Maximum category nesting level is 3');
                }
            }
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        ).populate('parentCategory', 'name slug');

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        return category;
    },

    // Delete category
    async deleteCategory(categoryId: string): Promise<void> {
        // Check if category has children
        const hasChildren = await Category.countDocuments({ parentCategory: categoryId });
        if (hasChildren > 0) {
            throw new AppError(400, 'Cannot delete category with children. Delete children first.');
        }

        // Check if category has products (import Product service here if needed)
        // const hasProducts = await Product.countDocuments({ category: categoryId });
        // if (hasProducts > 0) {
        //     throw new AppError(400, 'Cannot delete category with products');
        // }

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            throw new AppError(404, 'Category not found');
        }
    },

    // Get featured categories
    async getFeaturedCategories(limit: number = 6): Promise<ICategory[]> {
        const categories = await Category.find({
            status: 'active',
            isActive: true,
            isFeatured: true,
        })
            .sort({ order: 1 })
            .limit(limit)
            .lean();

        return categories as ICategory[];
    },

    // Get menu categories
    async getMenuCategories(): Promise<ICategoryWithChildren[]> {
        const categories = await Category.find({
            status: 'active',
            isActive: true,
            showInMenu: true,
        })
            .sort({ order: 1, name: 1 })
            .lean();

        // Build tree structure for menu
        const categoryMap = new Map<string, ICategoryWithChildren>();
        const tree: ICategoryWithChildren[] = [];

        categories.forEach((cat: any) => {
            categoryMap.set(cat._id.toString(), { ...cat, children: [] });
        });

        categories.forEach((cat: any) => {
            const category = categoryMap.get(cat._id.toString())!;
            if (cat.parentCategory) {
                const parent = categoryMap.get(cat.parentCategory.toString());
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(category);
                }
            } else {
                tree.push(category);
            }
        });

        return tree;
    },

    // Get home categories
    async getHomeCategories(): Promise<ICategory[]> {
        const categories = await Category.find({
            status: 'active',
            isActive: true,
            showInHome: true,
        })
            .sort({ order: 1 })
            .lean();

        return categories as ICategory[];
    },

    // Update product count
    async updateProductCount(categoryId: string, count: number): Promise<void> {
        await Category.findByIdAndUpdate(categoryId, { productCount: count });
    },

    // Get category breadcrumbs
    async getCategoryBreadcrumbs(categoryId: string): Promise<{ name: string; slug: string }[]> {
        const category = await Category.findById(categoryId);
        if (!category) {
            return [];
        }

        const breadcrumbs: { name: string; slug: string }[] = [];

        // Get ancestors
        if (category.ancestors.length > 0) {
            const ancestors = await Category.find({
                _id: { $in: category.ancestors },
            })
                .select('name slug level')
                .sort({ level: 1 })
                .lean();

            ancestors.forEach((a: any) => {
                breadcrumbs.push({ name: a.name, slug: a.slug });
            });
        }

        // Add current category
        breadcrumbs.push({ name: category.name, slug: category.slug });

        return breadcrumbs;
    },

    // Bulk update order
    async updateCategoryOrder(updates: { id: string; order: number }[]): Promise<void> {
        const bulkOps = updates.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(id) },
                update: { order },
            },
        }));

        await Category.bulkWrite(bulkOps);
    },
};

export default CategoryService;
