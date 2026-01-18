// ===================================================================
// Mega E-Commerce Backend - User Routes
// API endpoints for User module
// ===================================================================

import express from 'express';
import UserController from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import {
    updateUserValidation,
    changePasswordValidation,
    adminUpdateUserValidation,
    userQueryValidation,
} from './user.validation';

const router = express.Router();

// ===================================================================
// CUSTOMER ROUTES (Authenticated users)
// ===================================================================

/**
 * GET /api/users/me
 * Get current logged in user's profile
 */
router.get('/me', authMiddleware, UserController.getMyProfile);

/**
 * PATCH /api/users/me
 * Update current logged in user's profile
 */
router.patch(
    '/me',
    authMiddleware,
    validateRequest(updateUserValidation),
    UserController.updateMyProfile
);

/**
 * PATCH /api/users/change-password
 * Change password for current user
 */
router.patch(
    '/change-password',
    authMiddleware,
    validateRequest(changePasswordValidation),
    UserController.changePassword
);

// ===================================================================
// ADMIN ROUTES
// ===================================================================

/**
 * GET /api/users/admin/stats
 * Get user statistics for admin dashboard
 */
router.get(
    '/admin/stats',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    UserController.getUserStats
);

/**
 * GET /api/users/admin/all
 * Get all users (admin only)
 */
router.get(
    '/admin/all',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(userQueryValidation),
    UserController.getAllUsers
);

/**
 * GET /api/users/admin/:id
 * Get single user by ID (admin only)
 */
router.get(
    '/admin/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    UserController.getSingleUser
);

/**
 * PATCH /api/users/admin/:id
 * Update user by ID (admin only) - role, status change
 */
router.patch(
    '/admin/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(adminUpdateUserValidation),
    UserController.updateUser
);

/**
 * DELETE /api/users/admin/:id
 * Soft delete user by ID (admin only)
 */
router.delete(
    '/admin/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    UserController.deleteUser
);

export const UserRoutes = router;
