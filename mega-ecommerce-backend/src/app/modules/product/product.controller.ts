// ===================================================================
// Mega E-Commerce Backend - Product Controller
// HTTP request handlers for Product operations
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ProductService from './product.service';
import { IProductFilters, ProductSortOption } from './product.interface';

const ProductController = {
    // Create new product (Admin)
    createProduct: catchAsync(async (req: Request, res: Response) => {
        const product = await ProductService.createProduct(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    }),

    // Get all products with filters and pagination
    getProducts: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const sort = (req.query.sort as ProductSortOption) || 'newest';

        const filters: IProductFilters = {
            category: req.query.category as string,
            subCategory: req.query.subCategory as string,
            brand: req.query.brand as string,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            status: req.query.status as string,
            visibility: req.query.visibility as string,
            isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined,
            isOnSale: req.query.isOnSale === 'true' ? true : req.query.isOnSale === 'false' ? false : undefined,
            isNewProduct: req.query.isNewProduct === 'true' ? true : req.query.isNewProduct === 'false' ? false : undefined,
            search: req.query.search as string,
            tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
            inStock: req.query.inStock === 'true',
        };

        const result = await ProductService.getProducts(filters, page, limit, sort);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Products fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: result.totalPages,
            },
            data: result.data,
        });
    }),

    // Get product by ID
    getProductById: catchAsync(async (req: Request, res: Response) => {
        const product = await ProductService.getProductById(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Product fetched successfully',
            data: product,
        });
    }),

    // Get product by slug
    getProductBySlug: catchAsync(async (req: Request, res: Response) => {
        const product = await ProductService.getProductBySlug(req.params.slug);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Product fetched successfully',
            data: product,
        });
    }),

    // Update product (Admin)
    updateProduct: catchAsync(async (req: Request, res: Response) => {
        const product = await ProductService.updateProduct(req.params.id, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    }),

    // Delete product (Admin)
    deleteProduct: catchAsync(async (req: Request, res: Response) => {
        await ProductService.deleteProduct(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Product deleted successfully',
            data: null,
        });
    }),

    // Get featured products
    getFeaturedProducts: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 8;
        const products = await ProductService.getFeaturedProducts(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Featured products fetched successfully',
            data: products,
        });
    }),

    // Get new arrivals
    getNewArrivals: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 8;
        const products = await ProductService.getNewArrivals(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'New arrivals fetched successfully',
            data: products,
        });
    }),

    // Get bestsellers
    getBestSellers: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 8;
        const products = await ProductService.getBestSellers(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Best sellers fetched successfully',
            data: products,
        });
    }),

    // Get on-sale products
    getOnSaleProducts: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 8;
        const products = await ProductService.getOnSaleProducts(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'On-sale products fetched successfully',
            data: products,
        });
    }),

    // Get related products
    getRelatedProducts: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 4;
        const products = await ProductService.getRelatedProducts(req.params.id, limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Related products fetched successfully',
            data: products,
        });
    }),

    // Get products by category
    getProductsByCategory: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const result = await ProductService.getProductsByCategory(req.params.categoryId, page, limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Products fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    // Search products
    searchProducts: catchAsync(async (req: Request, res: Response) => {
        const query = req.query.q as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;

        if (!query) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: 'Search query is required',
                data: null,
            });
        }

        const result = await ProductService.searchProducts(query, page, limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Search results fetched successfully',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    // Get product statistics (Admin)
    getProductStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await ProductService.getProductStats();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Product statistics fetched successfully',
            data: stats,
        });
    }),

    // Bulk update status (Admin)
    bulkUpdateStatus: catchAsync(async (req: Request, res: Response) => {
        const { productIds, status } = req.body;
        const count = await ProductService.bulkUpdateStatus(productIds, status);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `${count} products updated successfully`,
            data: { updatedCount: count },
        });
    }),

    // Bulk delete products (Admin)
    bulkDelete: catchAsync(async (req: Request, res: Response) => {
        const { productIds } = req.body;
        const count = await ProductService.bulkDelete(productIds);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `${count} products deleted successfully`,
            data: { deletedCount: count },
        });
    }),

    // Update product stock (Admin)
    updateStock: catchAsync(async (req: Request, res: Response) => {
        const { quantity, operation } = req.body;
        const product = await ProductService.updateStock(req.params.id, quantity, operation);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Stock updated successfully',
            data: product,
        });
    }),
};

export default ProductController;
