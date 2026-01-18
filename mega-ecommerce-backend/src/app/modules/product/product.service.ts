// ===================================================================
// Mega E-Commerce Backend - Product Service
// Business logic for Product operations
// ===================================================================

import { Types } from 'mongoose';
import { Product } from './product.model';
import { IProduct, IProductFilters, ProductSortOption } from './product.interface';
import { CreateProductInput, UpdateProductInput } from './product.validation';
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

const getSortQuery = (sort?: ProductSortOption): Record<string, 1 | -1> => {
    switch (sort) {
        case 'newest':
            return { createdAt: -1 };
        case 'oldest':
            return { createdAt: 1 };
        case 'price-low':
            return { price: 1 };
        case 'price-high':
            return { price: -1 };
        case 'name-asc':
            return { name: 1 };
        case 'name-desc':
            return { name: -1 };
        case 'bestselling':
            return { salesCount: -1 };
        case 'rating':
            return { rating: -1 };
        default:
            return { createdAt: -1 };
    }
};

// ==================== Product Service ====================
const ProductService = {
    // Create new product
    async createProduct(data: CreateProductInput): Promise<IProduct> {
        // Generate slug if not provided
        const slug = data.slug || generateSlug(data.name);

        // Check if slug already exists
        const existingSlug = await Product.findOne({ slug });
        if (existingSlug) {
            throw new AppError(400, 'Product with this slug already exists');
        }

        // Check if SKU already exists
        if (data.sku) {
            const existingSku = await Product.findOne({ sku: data.sku });
            if (existingSku) {
                throw new AppError(400, 'Product with this SKU already exists');
            }
        }

        const product = await Product.create({
            ...data,
            slug,
            category: new Types.ObjectId(data.category),
            subCategory: data.subCategory ? new Types.ObjectId(data.subCategory) : undefined,
        });

        return product;
    },

    // Get all products with filters and pagination
    async getProducts(
        filters: IProductFilters = {},
        page: number = 1,
        limit: number = 12,
        sort: ProductSortOption = 'newest'
    ): Promise<{ data: IProduct[]; total: number; totalPages: number }> {
        const query: any = {};

        // Apply filters
        if (filters.category) {
            query.category = new Types.ObjectId(filters.category);
        }
        if (filters.subCategory) {
            query.subCategory = new Types.ObjectId(filters.subCategory);
        }
        if (filters.brand) {
            query.brand = { $regex: filters.brand, $options: 'i' };
        }
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {};
            if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
            if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
        }
        if (filters.status) {
            query.status = filters.status;
        } else {
            query.status = 'active'; // Default to active products only
        }
        if (filters.visibility) {
            query.visibility = filters.visibility;
        }
        if (filters.isFeatured !== undefined) {
            query.isFeatured = filters.isFeatured;
        }
        if (filters.isOnSale !== undefined) {
            query.isOnSale = filters.isOnSale;
        }
        if (filters.isNew !== undefined) {
            query.isNew = filters.isNew;
        }
        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }
        if (filters.inStock) {
            query.$or = [
                { trackQuantity: false },
                { quantity: { $gt: 0 } },
                { allowBackorder: true },
            ];
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }

        const skip = (page - 1) * limit;
        const sortQuery = getSortQuery(sort);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return {
            data: products as IProduct[],
            total,
            totalPages: Math.ceil(total / limit),
        };
    },

    // Get product by ID
    async getProductById(productId: string): Promise<IProduct> {
        const product = await Product.findById(productId)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        // Increment view count
        await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });

        return product;
    },

    // Get product by slug
    async getProductBySlug(slug: string): Promise<IProduct> {
        const product = await Product.findOne({ slug })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        // Increment view count
        await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

        return product;
    },

    // Update product
    async updateProduct(productId: string, data: UpdateProductInput): Promise<IProduct> {
        // Check if slug is being updated and if it already exists
        if (data.slug) {
            const existingSlug = await Product.findOne({
                slug: data.slug,
                _id: { $ne: productId },
            });
            if (existingSlug) {
                throw new AppError(400, 'Product with this slug already exists');
            }
        }

        // Check if SKU is being updated and if it already exists
        if (data.sku) {
            const existingSku = await Product.findOne({
                sku: data.sku,
                _id: { $ne: productId },
            });
            if (existingSku) {
                throw new AppError(400, 'Product with this SKU already exists');
            }
        }

        const updateData: any = { ...data };
        if (data.category) {
            updateData.category = new Types.ObjectId(data.category);
        }
        if (data.subCategory) {
            updateData.subCategory = new Types.ObjectId(data.subCategory);
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        return product;
    },

    // Delete product
    async deleteProduct(productId: string): Promise<void> {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }
    },

    // Get featured products
    async getFeaturedProducts(limit: number = 8): Promise<IProduct[]> {
        const products = await Product.find({
            status: 'active',
            isFeatured: true,
            isActive: true,
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return products as IProduct[];
    },

    // Get new arrivals
    async getNewArrivals(limit: number = 8): Promise<IProduct[]> {
        const products = await Product.find({
            status: 'active',
            isActive: true,
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return products as IProduct[];
    },

    // Get bestselling products
    async getBestSellers(limit: number = 8): Promise<IProduct[]> {
        const products = await Product.find({
            status: 'active',
            isActive: true,
        })
            .populate('category', 'name slug')
            .sort({ salesCount: -1 })
            .limit(limit)
            .lean();

        return products as IProduct[];
    },

    // Get on-sale products
    async getOnSaleProducts(limit: number = 8): Promise<IProduct[]> {
        const products = await Product.find({
            status: 'active',
            isActive: true,
            isOnSale: true,
            comparePrice: { $gt: 0 },
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return products as IProduct[];
    },

    // Get related products
    async getRelatedProducts(productId: string, limit: number = 4): Promise<IProduct[]> {
        const product = await Product.findById(productId);
        if (!product) {
            return [];
        }

        const products = await Product.find({
            _id: { $ne: productId },
            category: product.category,
            status: 'active',
            isActive: true,
        })
            .populate('category', 'name slug')
            .sort({ salesCount: -1 })
            .limit(limit)
            .lean();

        return products as IProduct[];
    },

    // Get products by category
    async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 12): Promise<{ data: IProduct[]; total: number }> {
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find({
                $or: [
                    { category: new Types.ObjectId(categoryId) },
                    { subCategory: new Types.ObjectId(categoryId) },
                ],
                status: 'active',
                isActive: true,
            })
                .populate('category', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments({
                $or: [
                    { category: new Types.ObjectId(categoryId) },
                    { subCategory: new Types.ObjectId(categoryId) },
                ],
                status: 'active',
                isActive: true,
            }),
        ]);

        return { data: products as IProduct[], total };
    },

    // Update product stock
    async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<IProduct> {
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError(404, 'Product not found');
        }

        const newQuantity = operation === 'add'
            ? product.quantity + quantity
            : product.quantity - quantity;

        if (newQuantity < 0 && !product.allowBackorder) {
            throw new AppError(400, 'Insufficient stock');
        }

        product.quantity = newQuantity;
        await product.save();

        return product;
    },

    // Search products
    async searchProducts(query: string, page: number = 1, limit: number = 12): Promise<{ data: IProduct[]; total: number }> {
        const skip = (page - 1) * limit;

        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } },
                { brand: { $regex: query, $options: 'i' } },
            ],
            status: 'active',
            isActive: true,
        };

        const [products, total] = await Promise.all([
            Product.find(searchQuery)
                .populate('category', 'name slug')
                .sort({ salesCount: -1, rating: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(searchQuery),
        ]);

        return { data: products as IProduct[], total };
    },

    // Get product statistics (Admin)
    async getProductStats(): Promise<{
        total: number;
        active: number;
        draft: number;
        archived: number;
        outOfStock: number;
        lowStock: number;
    }> {
        const [total, active, draft, archived, outOfStock, lowStock] = await Promise.all([
            Product.countDocuments({}),
            Product.countDocuments({ status: 'active' }),
            Product.countDocuments({ status: 'draft' }),
            Product.countDocuments({ status: 'archived' }),
            Product.countDocuments({ quantity: 0, trackQuantity: true }),
            Product.countDocuments({
                $expr: {
                    $and: [
                        { $eq: ['$trackQuantity', true] },
                        { $gt: ['$quantity', 0] },
                        { $lte: ['$quantity', '$lowStockThreshold'] },
                    ],
                },
            }),
        ]);

        return { total, active, draft, archived, outOfStock, lowStock };
    },

    // Bulk update products status
    async bulkUpdateStatus(productIds: string[], status: 'active' | 'draft' | 'archived'): Promise<number> {
        const result = await Product.updateMany(
            { _id: { $in: productIds.map(id => new Types.ObjectId(id)) } },
            { status }
        );
        return result.modifiedCount;
    },

    // Bulk delete products
    async bulkDelete(productIds: string[]): Promise<number> {
        const result = await Product.deleteMany({
            _id: { $in: productIds.map(id => new Types.ObjectId(id)) },
        });
        return result.deletedCount;
    },
};

export default ProductService;
