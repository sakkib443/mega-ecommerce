// ===================================================================
// Mega E-Commerce Backend - Main Application File
// Express app setup with all routes and middleware
// ===================================================================

import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

// ==================== Middleware Imports ====================
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundHandler from './app/middlewares/notFoundHandler';
import config from './app/config';

// ==================== Route Imports ====================
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { UserRoutes } from './app/modules/user/user.routes';
import { CategoryRoutes } from './app/modules/category/category.routes';
import { ProductRoutes } from './app/modules/product/product.routes';
import { CartRoutes } from './app/modules/cart/cart.module';
import { WishlistRoutes } from './app/modules/wishlist/wishlist.module';
import { OrderRoutes } from './app/modules/order/order.module';
import { ReviewRoutes } from './app/modules/review/review.module';
import { NotificationRoutes } from './app/modules/notification/notification.module';
import { CouponRoutes } from './app/modules/coupon/coupon.routes';
import { PaymentRoutes } from './app/modules/payment/payment.module';
import { ShippingRoutes } from './app/modules/shipping/shipping.module';
import { InvoiceRoutes } from './app/modules/invoice/invoice.module';
import { uploadRoutes } from './app/modules/upload/upload.routes';
import { SiteContentRoutes } from './app/modules/siteContent/siteContent.routes';
import { PageContentRoutes } from './app/modules/pageContent/pageContent.routes';
import { BlogRoutes } from './app/modules/blog/blog.routes';
import { StatsRoutes } from './app/modules/stats/stats.routes';
import { AnalyticsRoutes } from './app/modules/analytics/analytics.module';

// ==================== App Initialization ====================
const app: Application = express();

// ==================== Global Middlewares ====================
// JSON body parser
app.use(express.json({ limit: '10mb' }));

// URL encoded parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh token)
app.use(cookieParser());

// CORS configuration - supports multiple origins for production
const allowedOrigins = [
  config.frontend_url,
  'http://localhost:3000',
  'https://mega-ecommerce.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in production for API
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==================== Health Check Route ====================
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🛒 Mega E-Commerce API Server is running!',
    version: '2.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
    features: [
      'Product Management',
      'Category Hierarchy',
      'Cart & Wishlist',
      'Order Management',
      'Payment Gateway (SSLCommerz, bKash, COD)',
      'Shipping & Tracking',
      'Reviews & Ratings',
      'Invoice Generation',
      'Email Notifications',
      'Analytics Dashboard',
    ],
  });
});

// ==================== API Health Check ====================
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
  });
});

// ==================== API Routes ====================

// Authentication routes (public)
app.use('/api/auth', AuthRoutes);

// User routes (authenticated)
app.use('/api/users', UserRoutes);

// Category routes (public + admin)
app.use('/api/categories', CategoryRoutes);

// Product routes (main e-commerce)
app.use('/api/products', ProductRoutes);

// Cart routes (authenticated)
app.use('/api/cart', CartRoutes);

// Wishlist routes (authenticated)
app.use('/api/wishlist', WishlistRoutes);

// Order routes (authenticated)
app.use('/api/orders', OrderRoutes);

// Review routes (public + authenticated)
app.use('/api/reviews', ReviewRoutes);

// Payment routes (authenticated + gateway callbacks)
app.use('/api/payments', PaymentRoutes);

// Shipping routes (public + admin)
app.use('/api/shipping', ShippingRoutes);

// Invoice routes (authenticated)
app.use('/api/invoices', InvoiceRoutes);

// Notification routes (authenticated + admin)
app.use('/api/notifications', NotificationRoutes);

// Coupon routes (public validate + admin CRUD)
app.use('/api/coupons', CouponRoutes);

// Upload routes (authenticated)
app.use('/api/upload', uploadRoutes);

// Site Content routes (editable website content)
app.use('/api/site-content', SiteContentRoutes);

// Page Content routes (dynamic page content management)
app.use('/api/page-content', PageContentRoutes);

// Blog routes (blog posts and comments)
app.use('/api/blogs', BlogRoutes);

// Stats routes (real-time database statistics)
app.use('/api/stats', StatsRoutes);

// Analytics routes (admin only)
app.use('/api/analytics', AnalyticsRoutes);

// ==================== Error Handling ====================
// 404 Not Found handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
