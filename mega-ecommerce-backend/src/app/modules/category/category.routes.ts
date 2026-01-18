// ===================================================================
// Mega E-Commerce Backend - Category Routes
// API routes for Category operations
// ===================================================================

import express from 'express';
import CategoryController from './category.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createCategoryValidation, updateCategoryValidation } from './category.validation';

const router = express.Router();

// ==================== Public Routes ====================
// Get all categories
router.get('/', CategoryController.getAllCategories);

// Get category tree
router.get('/tree', CategoryController.getCategoryTree);

// Get root categories
router.get('/root', CategoryController.getRootCategories);

// Get featured categories
router.get('/featured', CategoryController.getFeaturedCategories);

// Get menu categories
router.get('/menu', CategoryController.getMenuCategories);

// Get home categories
router.get('/home', CategoryController.getHomeCategories);

// Get child categories
router.get('/:parentId/children', CategoryController.getChildCategories);

// Get category by slug
router.get('/slug/:slug', CategoryController.getCategoryBySlug);

// Get category by ID
router.get('/:id', CategoryController.getCategoryById);

// Get category with children
router.get('/:id/with-children', CategoryController.getCategoryWithChildren);

// Get category breadcrumbs
router.get('/:id/breadcrumbs', CategoryController.getCategoryBreadcrumbs);

// ==================== Admin Routes ====================
// Create category
router.post(
    '/',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(createCategoryValidation),
    CategoryController.createCategory
);

// Update category
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(updateCategoryValidation),
    CategoryController.updateCategory
);

// Delete category
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    CategoryController.deleteCategory
);

// Update category order
router.patch(
    '/admin/order',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    CategoryController.updateCategoryOrder
);

export const CategoryRoutes = router;
