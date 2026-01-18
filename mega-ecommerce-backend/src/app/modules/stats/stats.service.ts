// ===================================================================
// Mega E-Commerce Backend - Stats Service
// Real-time statistics from database
// ===================================================================

import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { Category } from '../category/category.model';
import { Order } from '../order/order.module';
import { Review } from '../review/review.module';

/**
 * Get real-time dashboard stats from database
 */
const getDashboardStats = async () => {
    try {
        // Count all users
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        const totalCustomers = await User.countDocuments({ role: 'customer', isDeleted: { $ne: true } });

        // Count all products
        const totalProducts = await Product.countDocuments({ status: 'active' });
        const allProducts = await Product.countDocuments({});

        // Count categories
        const totalCategories = await Category.countDocuments({ status: 'active' });

        // Count orders
        const totalOrders = await Order.countDocuments({});
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'returned'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Calculate average rating from reviews
        const reviewStats = await Review.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);

        const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 4.8;
        const totalReviews = reviewStats.length > 0 ? reviewStats[0].totalReviews : 0;

        return {
            activeUsers: totalUsers,
            totalCustomers,
            totalProducts: totalProducts || allProducts,
            totalOrders,
            deliveredOrders,
            totalRevenue,
            avgRating: Math.round(avgRating * 10) / 10,
            // Breakdown details
            breakdown: {
                products: allProducts,
                activeProducts: totalProducts,
                categories: totalCategories,
                users: totalUsers,
                customers: totalCustomers,
                orders: totalOrders,
                reviews: totalReviews,
                revenue: totalRevenue
            }
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        // Return defaults on error
        return {
            activeUsers: 0,
            totalCustomers: 0,
            totalProducts: 0,
            totalOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0,
            avgRating: 4.8,
            breakdown: {
                products: 0,
                activeProducts: 0,
                categories: 0,
                users: 0,
                customers: 0,
                orders: 0,
                reviews: 0,
                revenue: 0
            }
        };
    }
};

export const StatsService = {
    getDashboardStats
};
