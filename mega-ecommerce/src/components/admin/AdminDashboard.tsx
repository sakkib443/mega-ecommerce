"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiShoppingBag,
    FiUsers,
    FiShoppingCart,
    FiDollarSign,
    FiTrendingUp,
    FiTrendingDown,
    FiPackage,
    FiEye,
    FiMoreVertical,
    FiArrowRight,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiTruck,
    FiStar,
    FiCreditCard,
    FiActivity,
    FiCalendar
} from 'react-icons/fi';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Stats Card Component
const StatCard = ({ title, value, change, trend, icon: Icon, color, bgColor, loading }: any) => (
    <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div
                className="w-12 h-12 rounded-md flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
            >
                <Icon size={26} style={{ color }} />
            </div>
            {change && (
                <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {trend === 'up' ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                    {change}
                </span>
            )}
        </div>
        {loading ? (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
        ) : (
            <>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
            </>
        )}
    </div>
);

// Order Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
        'processing': 'bg-purple-100 text-purple-700 border-purple-200',
        'shipped': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'delivered': 'bg-green-100 text-green-700 border-green-200',
        'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-3 py-1 rounded-md text-xs font-semibold border capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Payment Status Badge
const PaymentBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        'pending': 'text-yellow-600',
        'paid': 'text-green-600',
        'failed': 'text-red-600',
        'refunded': 'text-purple-600',
    };
    const icons: Record<string, any> = {
        'pending': FiClock,
        'paid': FiCheckCircle,
        'failed': FiAlertCircle,
        'refunded': FiRefreshCw,
    };
    const Icon = icons[status] || FiClock;
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${colors[status] || ''}`}>
            <Icon size={12} />
            <span className="capitalize">{status}</span>
        </span>
    );
};

import {
    useGetDashboardSummaryQuery,
    useGetRecentOrdersQuery,
    useGetTopProductsQuery,
    useGetMonthlyRevenueQuery,
} from '@/redux/api/dashboardApi';

const AdminDashboard: React.FC = () => {
    const [dateRange, setDateRange] = useState('7d');

    // RTK Query Hooks for real-time data
    const {
        data: summaryData,
        isLoading: isSummaryLoading,
        isFetching: isSummaryFetching,
        refetch: refetchSummary
    } = useGetDashboardSummaryQuery(undefined, {
        pollingInterval: 30000, // Poll every 30 seconds for real-time feel
    });

    const {
        data: ordersData,
        isLoading: isOrdersLoading,
        refetch: refetchOrders
    } = useGetRecentOrdersQuery(5);

    const {
        data: productsData,
        isLoading: isProductsLoading,
        refetch: refetchProducts
    } = useGetTopProductsQuery(5);

    const {
        data: revenueData,
        isLoading: isRevenueLoading,
        refetch: refetchRevenue
    } = useGetMonthlyRevenueQuery(undefined);

    const handleRefresh = () => {
        refetchSummary();
        refetchOrders();
        refetchProducts();
        refetchRevenue();
    };

    const stats = summaryData?.data || null;
    const recentOrders = ordersData?.data || [];
    const topProducts = productsData?.data || [];
    const monthlyRevenue = revenueData?.data || { labels: [], revenue: [], orders: [] };

    const isLoading = isSummaryLoading || isOrdersLoading || isProductsLoading || isRevenueLoading;

    // Formatting helpers
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount || 0).replace('BDT', '৳');
    };


    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome! Here's a summary of your business today.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent outline-none"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 3 months</option>
                        <option value="365d">This year</option>
                    </select>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
                    >
                        <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#5CAF90] to-[#4A9A7D] text-white rounded-md text-sm font-semibold hover:shadow-md transition-all">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue)}
                    change="+12.5%"
                    trend="up"
                    icon={FiDollarSign}
                    color="#5CAF90"
                    bgColor="rgba(92, 175, 144, 0.15)"
                    loading={isLoading}
                />
                <StatCard
                    title="Total Orders"
                    value={(stats?.totalOrders || 0).toLocaleString()}
                    change="+8.2%"
                    trend="up"
                    icon={FiShoppingCart}
                    color="#3B82F6"
                    bgColor="rgba(59, 130, 246, 0.15)"
                    loading={isLoading}
                />
                <StatCard
                    title="Total Products"
                    value={(stats?.totalProducts || 0).toLocaleString()}
                    change="+5.1%"
                    trend="up"
                    icon={FiShoppingBag}
                    color="#F59E0B"
                    bgColor="rgba(245, 158, 11, 0.15)"
                    loading={isLoading}
                />
                <StatCard
                    title="Total Customers"
                    value={(stats?.totalCustomers || 0).toLocaleString()}
                    change="+15.3%"
                    trend="up"
                    icon={FiUsers}
                    color="#EC4899"
                    bgColor="rgba(236, 72, 153, 0.15)"
                    loading={isLoading}
                />
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-yellow-50 rounded-md flex items-center justify-center">
                        <FiClock size={24} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-700">{stats?.pendingOrders || 0}</p>
                        <p className="text-sm text-yellow-600">Pending Orders</p>
                    </div>
                    <Link href="/dashboard/admin/orders?status=pending" className="ml-auto text-yellow-600 hover:text-yellow-700">
                        <FiArrowRight size={20} />
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-red-50 rounded-md flex items-center justify-center">
                        <FiAlertCircle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-700">{stats?.lowStockProducts || 0}</p>
                        <p className="text-sm text-red-600">Low Stock Products</p>
                    </div>
                    <Link href="/dashboard/admin/products?stock=low" className="ml-auto text-red-600 hover:text-red-700">
                        <FiArrowRight size={20} />
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
                        <FiCheckCircle size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-700">98.5%</p>
                        <p className="text-sm text-green-600">Order Success Rate</p>
                    </div>
                    <Link href="/dashboard/admin/analytics" className="ml-auto text-green-600 hover:text-green-700">
                        <FiArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-md p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
                            <p className="text-sm text-gray-500">Monthly revenue statistics</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#5CAF90]"></span>
                                <span className="text-sm text-gray-500">Revenue</span>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiMoreVertical />
                            </button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-72 flex items-end justify-between gap-3 px-2">
                        {monthlyRevenue.labels.length > 0 ? (
                            monthlyRevenue.labels.map((month: string, i: number) => {
                                const rev = monthlyRevenue.revenue[i] || 0;
                                // Calculate height relative to max revenue
                                const maxRev = Math.max(...monthlyRevenue.revenue, 1);
                                const heightPercentage = (rev / maxRev) * 100;

                                return (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full h-full flex items-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-[#5CAF90] to-green-400 rounded-t-sm transition-all duration-300 group-hover:from-[#4A9A7D] group-hover:to-[#5CAF90] cursor-pointer"
                                                style={{ height: `${heightPercentage}%`, minHeight: rev > 0 ? '4px' : '2px' }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                                    {formatCurrency(rev)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {isRevenueLoading ? 'Loading chart...' : 'No data available'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
                            <p className="text-sm text-gray-500">Current breakdown</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: 'Delivered', count: stats?.deliveredOrders || 0, color: '#22C55E', icon: FiCheckCircle },
                            { label: 'Shipped', count: stats?.shippedOrders || 0, color: '#6366F1', icon: FiTruck },
                            { label: 'Processing', count: stats?.processingOrders || 0, color: '#3B82F6', icon: FiPackage },
                            { label: 'Pending', count: stats?.pendingOrders || 0, color: '#F59E0B', icon: FiClock },
                        ].map((item, i) => {
                            const total = (stats?.totalOrders || 0);
                            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <item.icon size={16} style={{ color: item.color }} />
                                            {item.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs">{item.count} orders</span>
                                            <span className="font-bold" style={{ color: item.color }}>{percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%`, backgroundColor: item.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-800">
                                {(stats?.totalOrders || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Total Orders This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                            <p className="text-sm text-gray-500">Latest customer orders</p>
                        </div>
                        <Link href="/dashboard/admin/orders" className="text-[#5CAF90] text-sm font-semibold flex items-center gap-1 hover:underline">
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order: any, i: number) => (
                                        <tr key={order._id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-[#5CAF90]">{order.orderNumber}</p>
                                                <PaymentBadge status={order.paymentStatus} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {order.user?.firstName} {order.user?.lastName}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-800">{formatCurrency(order.total)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                            No recent orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Top Products</h2>
                            <p className="text-sm text-gray-500">Best selling products</p>
                        </div>
                        <Link href="/dashboard/admin/products" className="text-[#5CAF90] text-sm font-semibold flex items-center gap-1 hover:underline">
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {topProducts.length > 0 ? (
                            topProducts.map((product: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {product.thumbnail ? (
                                                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FiShoppingBag size={24} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <FiActivity size={12} />
                                                {product.salesCount || 0} sales
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">{formatCurrency(product.price)}</p>
                                        <p className={`text-sm ${(product.quantity || 0) < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {product.quantity || 0} in stock
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500">
                                No top products found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Add Product', icon: FiShoppingBag, href: '/dashboard/admin/products/new', color: '#5CAF90' },
                        { label: 'View Orders', icon: FiShoppingCart, href: '/dashboard/admin/orders', color: '#3B82F6' },
                        { label: 'Customers', icon: FiUsers, href: '/dashboard/admin/customers', color: '#EC4899' },
                        { label: 'Analytics', icon: FiActivity, href: '/dashboard/admin/analytics', color: '#F59E0B' },
                        { label: 'Payments', icon: FiCreditCard, href: '/dashboard/admin/payments', color: '#6366F1' },
                        { label: 'Reviews', icon: FiStar, href: '/dashboard/admin/reviews', color: '#EF4444' },
                    ].map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className="flex flex-col items-center gap-3 p-5 rounded-md border border-gray-200 hover:border-[#5CAF90] hover:shadow-md transition-all group bg-gray-50/50"
                        >
                            <div
                                className="w-12 h-12 rounded-md flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${action.color}15` }}
                            >
                                <action.icon size={24} style={{ color: action.color }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-[#5CAF90]">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
