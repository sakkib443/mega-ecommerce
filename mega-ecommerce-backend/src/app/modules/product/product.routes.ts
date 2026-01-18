// ===================================================================
// Mega E-Commerce Backend - Product Routes
// API routes for Product operations
// ===================================================================

import express from 'express';
import ProductController from './product.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createProductValidation, updateProductValidation } from './product.validation';

const router = express.Router();

// ==================== Public Routes ====================
// Get all products (with filters)
router.get('/', ProductController.getProducts);

// Search products
router.get('/search', ProductController.searchProducts);

// Get featured products
router.get('/featured', ProductController.getFeaturedProducts);

// Get new arrivals
router.get('/new-arrivals', ProductController.getNewArrivals);

// Get bestsellers
router.get('/bestsellers', ProductController.getBestSellers);

// Get on-sale products
router.get('/on-sale', ProductController.getOnSaleProducts);

// Get products by category
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// Get product by slug
router.get('/slug/:slug', ProductController.getProductBySlug);

// Get product by ID
router.get('/:id', ProductController.getProductById);

// Get related products
router.get('/:id/related', ProductController.getRelatedProducts);

// ==================== Admin Routes ====================
// Get product statistics
router.get(
    '/admin/stats',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    ProductController.getProductStats
);

// Create product
router.post(
    '/',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(createProductValidation),
    ProductController.createProduct
);

// Update product
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(updateProductValidation),
    ProductController.updateProduct
);

// Delete product
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    ProductController.deleteProduct
);

// Bulk update status
router.patch(
    '/admin/bulk-status',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    ProductController.bulkUpdateStatus
);

// Bulk delete
router.delete(
    '/admin/bulk-delete',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    ProductController.bulkDelete
);

// Update stock
router.patch(
    '/:id/stock',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    ProductController.updateStock
);

export const ProductRoutes = router;
