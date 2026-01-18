// ===================================================================
// Mega E-Commerce Backend - Category Controller
// HTTP request handlers for Category operations
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import CategoryService from './category.service';

const CategoryController = {
    // Create new category (Admin)
    createCategory: catchAsync(async (req: Request, res: Response) => {
        const category = await CategoryService.createCategory(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    }),

    // Get all categories
    getAllCategories: catchAsync(async (req: Request, res: Response) => {
        const includeInactive = req.query.includeInactive === 'true';
        const categories = await CategoryService.getAllCategories(includeInactive);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        });
    }),

    // Get category tree
    getCategoryTree: catchAsync(async (req: Request, res: Response) => {
        const tree = await CategoryService.getCategoryTree();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category tree fetched successfully',
            data: tree,
        });
    }),

    // Get root categories
    getRootCategories: catchAsync(async (req: Request, res: Response) => {
        const categories = await CategoryService.getRootCategories();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Root categories fetched successfully',
            data: categories,
        });
    }),

    // Get child categories
    getChildCategories: catchAsync(async (req: Request, res: Response) => {
        const categories = await CategoryService.getChildCategories(req.params.parentId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Child categories fetched successfully',
            data: categories,
        });
    }),

    // Get category by ID
    getCategoryById: catchAsync(async (req: Request, res: Response) => {
        const category = await CategoryService.getCategoryById(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category fetched successfully',
            data: category,
        });
    }),

    // Get category by slug
    getCategoryBySlug: catchAsync(async (req: Request, res: Response) => {
        const category = await CategoryService.getCategoryBySlug(req.params.slug);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category fetched successfully',
            data: category,
        });
    }),

    // Get category with children
    getCategoryWithChildren: catchAsync(async (req: Request, res: Response) => {
        const category = await CategoryService.getCategoryWithChildren(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category with children fetched successfully',
            data: category,
        });
    }),

    // Update category (Admin)
    updateCategory: catchAsync(async (req: Request, res: Response) => {
        const category = await CategoryService.updateCategory(req.params.id, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    }),

    // Delete category (Admin)
    deleteCategory: catchAsync(async (req: Request, res: Response) => {
        await CategoryService.deleteCategory(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category deleted successfully',
            data: null,
        });
    }),

    // Get featured categories
    getFeaturedCategories: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 6;
        const categories = await CategoryService.getFeaturedCategories(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Featured categories fetched successfully',
            data: categories,
        });
    }),

    // Get menu categories
    getMenuCategories: catchAsync(async (req: Request, res: Response) => {
        const categories = await CategoryService.getMenuCategories();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Menu categories fetched successfully',
            data: categories,
        });
    }),

    // Get home categories
    getHomeCategories: catchAsync(async (req: Request, res: Response) => {
        const categories = await CategoryService.getHomeCategories();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Home categories fetched successfully',
            data: categories,
        });
    }),

    // Get category breadcrumbs
    getCategoryBreadcrumbs: catchAsync(async (req: Request, res: Response) => {
        const breadcrumbs = await CategoryService.getCategoryBreadcrumbs(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Breadcrumbs fetched successfully',
            data: breadcrumbs,
        });
    }),

    // Update category order (Admin)
    updateCategoryOrder: catchAsync(async (req: Request, res: Response) => {
        const { updates } = req.body;
        await CategoryService.updateCategoryOrder(updates);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Category order updated successfully',
            data: null,
        });
    }),
};

export default CategoryController;
