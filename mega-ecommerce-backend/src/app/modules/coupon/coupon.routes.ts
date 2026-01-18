// ===================================================================
// Mega E-Commerce Backend - Coupon Routes
// API endpoints for coupon module
// ===================================================================

import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CouponValidation } from './coupon.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// ==================== Public Routes ====================

// Apply coupon (validate and calculate discount)
router.post(
    '/apply',
    authMiddleware,
    validateRequest(CouponValidation.applyCouponZodSchema),
    CouponController.applyCoupon
);

// ==================== Admin Routes ====================

// Get all coupons
router.get(
    '/',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    CouponController.getAllCoupons
);

// Get single coupon
router.get(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    CouponController.getCouponById
);

// Create coupon
router.post(
    '/',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(CouponValidation.createCouponZodSchema),
    CouponController.createCoupon
);

// Update coupon
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(CouponValidation.updateCouponZodSchema),
    CouponController.updateCoupon
);

// Delete coupon
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin', 'super_admin'),
    CouponController.deleteCoupon
);

export const CouponRoutes = router;
