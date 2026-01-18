// ===================================================================
// Mega E-Commerce Backend - Analytics & Reports Module
// Dashboard Analytics, Revenue Reports, Product Stats
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import express from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import { Order } from '../order/order.module';
import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { Category } from '../category/category.model';
import { Review } from '../review/review.module';

// ==================== SERVICE ====================
const AnalyticsService = {
    /**
     * Dashboard Summary - Admin dashboard এর জন্য সব stats একসাথে
     */
    async getDashboardSummary(): Promise<{
        // User Stats
        totalUsers: number;
        totalCustomers: number;
        newUsersThisMonth: number;
        // Product Stats
        totalProducts: number;
        activeProducts: number;
        outOfStockProducts: number;
        lowStockProducts: number;
        // Category Stats
        totalCategories: number;
        // Order Stats
        totalOrders: number;
        todayOrders: number;
        pendingOrders: number;
        processingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        // Revenue Stats
        totalRevenue: number;
        todayRevenue: number;
        monthlyRevenue: number;
        // Review Stats
        totalReviews: number;
        avgRating: number;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            // User counts
            totalUsers,
            totalCustomers,
            newUsersThisMonth,
            // Product counts
            totalProducts,
            activeProducts,
            outOfStockProducts,
            lowStockProducts,
            // Category count
            totalCategories,
            // Order counts
            totalOrders,
            todayOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            // Review stats
            totalReviews,
            avgRatingResult,
            // Revenue aggregations
            totalRevenueResult,
            todayRevenueResult,
            monthlyRevenueResult,
        ] = await Promise.all([
            // User queries
            User.countDocuments({ isDeleted: false }),
            User.countDocuments({ role: 'customer', isDeleted: false }),
            User.countDocuments({ createdAt: { $gte: firstDayOfMonth }, isDeleted: false }),
            // Product queries
            Product.countDocuments({}),
            Product.countDocuments({ status: 'active' }),
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
            // Category query
            Category.countDocuments({ status: 'active' }),
            // Order queries
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'processing' }),
            Order.countDocuments({ status: 'shipped' }),
            Order.countDocuments({ status: 'delivered' }),
            Order.countDocuments({ status: 'cancelled' }),
            // Review queries
            Review.countDocuments({ status: 'approved' }),
            Review.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } },
            ]),
            // Revenue aggregations
            Order.aggregate([
                { $match: { status: { $nin: ['cancelled', 'returned'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, status: { $nin: ['cancelled', 'returned'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: firstDayOfMonth }, status: { $nin: ['cancelled', 'returned'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);

        return {
            // User Stats
            totalUsers,
            totalCustomers,
            newUsersThisMonth,
            // Product Stats
            totalProducts,
            activeProducts,
            outOfStockProducts,
            lowStockProducts,
            // Category Stats
            totalCategories,
            // Order Stats
            totalOrders,
            todayOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            // Revenue Stats
            totalRevenue: totalRevenueResult[0]?.total || 0,
            todayRevenue: todayRevenueResult[0]?.total || 0,
            monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
            // Review Stats
            totalReviews,
            avgRating: avgRatingResult[0]?.avg ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0,
        };
    },

    /**
     * Public Statistics - Home page এর জন্য public stats
     */
    async getPublicStatistics(): Promise<{
        totalProducts: number;
        totalCustomers: number;
        totalOrders: number;
        averageRating: number;
        totalReviews: number;
    }> {
        const [
            totalProducts,
            totalCustomers,
            totalOrders,
            ratingResult,
            totalReviews,
        ] = await Promise.all([
            Product.countDocuments({ status: 'active' }),
            User.countDocuments({ role: 'customer', isDeleted: false }),
            Order.countDocuments({ status: 'delivered' }),
            Review.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ]),
            Review.countDocuments({ status: 'approved' }),
        ]);

        return {
            totalProducts,
            totalCustomers,
            totalOrders,
            averageRating: ratingResult[0]?.avg ? parseFloat(ratingResult[0].avg.toFixed(1)) : 4.8,
            totalReviews,
        };
    },

    /**
     * Revenue by Date Range
     */
    async getRevenueByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<{ date: string; revenue: number; orders: number }[]> {
        const result = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['cancelled', 'returned'] },
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return result.map((item) => ({
            date: item._id,
            revenue: item.revenue,
            orders: item.orders,
        }));
    },

    /**
     * Monthly Revenue - Last 12 months
     */
    async getMonthlyRevenue(): Promise<{
        labels: string[];
        revenue: number[];
        orders: number[];
    }> {
        const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const result = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['cancelled', 'returned'] },
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Build labels and data arrays
        const labels: string[] = [];
        const revenueData: number[] = [];
        const ordersData: number[] = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(twelveMonthsAgo);
            date.setMonth(twelveMonthsAgo.getMonth() + i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            labels.push(monthsNames[month - 1]);

            const found = result.find((r: any) => r._id.year === year && r._id.month === month);
            revenueData.push(found?.revenue || 0);
            ordersData.push(found?.orders || 0);
        }

        return {
            labels,
            revenue: revenueData,
            orders: ordersData,
        };
    },

    /**
     * Top Selling Products
     */
    async getTopSellingProducts(limit = 10): Promise<any[]> {
        return await Product.find({ status: 'active' })
            .select('name slug price thumbnail salesCount rating reviewCount')
            .sort({ salesCount: -1 })
            .limit(limit);
    },

    /**
     * Top Rated Products
     */
    async getTopRatedProducts(limit = 10): Promise<any[]> {
        return await Product.find({ status: 'active', reviewCount: { $gte: 5 } })
            .select('name slug price thumbnail salesCount rating reviewCount')
            .sort({ rating: -1, reviewCount: -1 })
            .limit(limit);
    },

    /**
     * Recent Orders
     */
    async getRecentOrders(limit = 20): Promise<any[]> {
        return await Order.find({})
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit);
    },

    /**
     * Sales by Category
     */
    async getSalesByCategory(): Promise<{ category: string; sales: number; revenue: number }[]> {
        const result = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'returned'] } } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category.name',
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        return result.map((item: any) => ({
            category: item._id,
            sales: item.sales,
            revenue: item.revenue,
        }));
    },

    /**
     * Customer Report
     */
    async getCustomerReport(): Promise<any[]> {
        return await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'returned'] } } },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    lastOrder: { $max: '$createdAt' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    email: '$user.email',
                    totalOrders: 1,
                    totalSpent: 1,
                    lastOrder: 1,
                },
            },
            { $sort: { totalSpent: -1 } },
        ]);
    },

    /**
     * Generate Sales CSV
     */
    generateSalesCSV(orders: any[]): string {
        const headers = [
            'Order Number',
            'Order Date',
            'Customer Name',
            'Customer Email',
            'Products',
            'Total Amount (BDT)',
            'Status',
            'Payment Status',
        ];

        const rows = orders.map((order) => [
            order.orderNumber,
            new Date(order.createdAt).toISOString().split('T')[0],
            `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
            order.user?.email || '',
            order.items?.map((i: any) => i.name).join('; ') || '',
            order.total,
            order.status,
            order.paymentStatus,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return csvContent;
    },

    /**
     * Generate Customer CSV
     */
    generateCustomerCSV(customers: any[]): string {
        const headers = [
            'Customer Name',
            'Email',
            'Total Orders',
            'Total Spent (BDT)',
            'Last Order Date',
        ];

        const rows = customers.map((c) => [
            `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            c.email || '',
            c.totalOrders,
            c.totalSpent,
            c.lastOrder ? new Date(c.lastOrder).toISOString().split('T')[0] : '',
        ]);

        return [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');
    },
};

// ==================== CONTROLLER ====================
const AnalyticsController = {
    getDashboard: catchAsync(async (req: Request, res: Response) => {
        const summary = await AnalyticsService.getDashboardSummary();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Dashboard data fetched',
            data: summary,
        });
    }),

    getRevenue: catchAsync(async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate as string) : new Date();
        const revenueData = await AnalyticsService.getRevenueByDateRange(start, end);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Revenue data fetched',
            data: revenueData,
        });
    }),

    getMonthlyRevenue: catchAsync(async (req: Request, res: Response) => {
        const data = await AnalyticsService.getMonthlyRevenue();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Monthly revenue fetched',
            data: data,
        });
    }),

    getTopProducts: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 10;
        const products = await AnalyticsService.getTopSellingProducts(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Top products fetched',
            data: products,
        });
    }),

    getTopRatedProducts: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 10;
        const products = await AnalyticsService.getTopRatedProducts(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Top rated products fetched',
            data: products,
        });
    }),

    getRecentOrders: catchAsync(async (req: Request, res: Response) => {
        const limit = Number(req.query.limit) || 20;
        const orders = await AnalyticsService.getRecentOrders(limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Recent orders fetched',
            data: orders,
        });
    }),

    getSalesByCategory: catchAsync(async (req: Request, res: Response) => {
        const data = await AnalyticsService.getSalesByCategory();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Sales by category fetched',
            data: data,
        });
    }),

    getCustomerReport: catchAsync(async (req: Request, res: Response) => {
        const customers = await AnalyticsService.getCustomerReport();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Customer report fetched',
            data: customers,
        });
    }),

    downloadSalesReport: catchAsync(async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate as string) : new Date();

        const orders = await Order.find({
            status: { $nin: ['cancelled', 'returned'] },
            createdAt: { $gte: start, $lte: end },
        })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });

        const csv = AnalyticsService.generateSalesCSV(orders);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=sales-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv`);
        res.send(csv);
    }),

    downloadCustomerReport: catchAsync(async (req: Request, res: Response) => {
        const customers = await AnalyticsService.getCustomerReport();
        const csv = AnalyticsService.generateCustomerCSV(customers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customer-report.csv');
        res.send(csv);
    }),

    getPublicStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await AnalyticsService.getPublicStatistics();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Public statistics fetched',
            data: stats,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

// Public routes
router.get('/public-stats', AnalyticsController.getPublicStats);

// Admin routes
router.use(authMiddleware, authorizeRoles('admin', 'super_admin'));

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/revenue', AnalyticsController.getRevenue);
router.get('/monthly-revenue', AnalyticsController.getMonthlyRevenue);
router.get('/top-products', AnalyticsController.getTopProducts);
router.get('/top-rated', AnalyticsController.getTopRatedProducts);
router.get('/recent-orders', AnalyticsController.getRecentOrders);
router.get('/sales-by-category', AnalyticsController.getSalesByCategory);
router.get('/customers', AnalyticsController.getCustomerReport);
router.get('/download/sales', AnalyticsController.downloadSalesReport);
router.get('/download/customers', AnalyticsController.downloadCustomerReport);

export const AnalyticsRoutes = router;
export default AnalyticsService;
