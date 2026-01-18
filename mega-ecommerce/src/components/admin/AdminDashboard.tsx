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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
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
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
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

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState('7d');

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch stats
            const statsRes = await fetch(`${API_URL}/stats/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(statsData.data);
            }

            // Fetch recent orders
            const ordersRes = await fetch(`${API_URL}/orders/admin/all?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setRecentOrders(ordersData.data || []);
            }

            // Fetch top products
            const productsRes = await fetch(`${API_URL}/analytics/top-products?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const productsData = await productsRes.json();
            if (productsData.success) {
                setTopProducts(productsData.data || []);
            }
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Static data for demo
    const demoStats = {
        totalRevenue: '৳12,54,300',
        totalOrders: 1245,
        totalProducts: 356,
        totalCustomers: 2450,
        pendingOrders: 45,
        lowStockProducts: 12,
    };

    const demoOrders = [
        { _id: '1', orderNumber: 'ORD-2024-001', customer: { firstName: 'রহিম', lastName: 'উদ্দিন' }, total: 2499, status: 'delivered', paymentStatus: 'paid', createdAt: new Date().toISOString() },
        { _id: '2', orderNumber: 'ORD-2024-002', customer: { firstName: 'করিম', lastName: 'হোসেন' }, total: 4999, status: 'processing', paymentStatus: 'paid', createdAt: new Date().toISOString() },
        { _id: '3', orderNumber: 'ORD-2024-003', customer: { firstName: 'জামাল', lastName: 'মিয়া' }, total: 1499, status: 'shipped', paymentStatus: 'paid', createdAt: new Date().toISOString() },
        { _id: '4', orderNumber: 'ORD-2024-004', customer: { firstName: 'সালমা', lastName: 'বেগম' }, total: 3499, status: 'pending', paymentStatus: 'pending', createdAt: new Date().toISOString() },
        { _id: '5', orderNumber: 'ORD-2024-005', customer: { firstName: 'ফারুক', lastName: 'আহমেদ' }, total: 1999, status: 'confirmed', paymentStatus: 'paid', createdAt: new Date().toISOString() },
    ];

    const demoTopProducts = [
        { name: 'Wireless Bluetooth Headphone', salesCount: 234, price: 2499, thumbnail: '/api/placeholder/60/60', quantity: 45 },
        { name: 'Smart Watch Pro Max', salesCount: 189, price: 4999, thumbnail: '/api/placeholder/60/60', quantity: 32 },
        { name: 'Premium Running Shoes', salesCount: 156, price: 3499, thumbnail: '/api/placeholder/60/60', quantity: 67 },
        { name: 'Leather Laptop Bag', salesCount: 134, price: 1999, thumbnail: '/api/placeholder/60/60', quantity: 89 },
        { name: 'Bluetooth Speaker Mini', salesCount: 112, price: 1499, thumbnail: '/api/placeholder/60/60', quantity: 23 },
    ];

    const displayOrders = recentOrders.length > 0 ? recentOrders : demoOrders;
    const displayProducts = topProducts.length > 0 ? topProducts : demoTopProducts;

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
                        className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 3 months</option>
                        <option value="365d">This year</option>
                    </select>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#5CAF90] to-[#4A9A7D] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#5CAF90]/30 transition-all">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={stats?.totalRevenue || demoStats.totalRevenue}
                    change="+12.5%"
                    trend="up"
                    icon={FiDollarSign}
                    color="#5CAF90"
                    bgColor="rgba(92, 175, 144, 0.15)"
                    loading={loading}
                />
                <StatCard
                    title="Total Orders"
                    value={(stats?.totalOrders || demoStats.totalOrders).toLocaleString()}
                    change="+8.2%"
                    trend="up"
                    icon={FiShoppingCart}
                    color="#3B82F6"
                    bgColor="rgba(59, 130, 246, 0.15)"
                    loading={loading}
                />
                <StatCard
                    title="Total Products"
                    value={(stats?.totalProducts || demoStats.totalProducts).toLocaleString()}
                    change="+5.1%"
                    trend="up"
                    icon={FiShoppingBag}
                    color="#F59E0B"
                    bgColor="rgba(245, 158, 11, 0.15)"
                    loading={loading}
                />
                <StatCard
                    title="Total Customers"
                    value={(stats?.totalCustomers || demoStats.totalCustomers).toLocaleString()}
                    change="+15.3%"
                    trend="up"
                    icon={FiUsers}
                    color="#EC4899"
                    bgColor="rgba(236, 72, 153, 0.15)"
                    loading={loading}
                />
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <FiClock size={24} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-700">{stats?.pendingOrders || demoStats.pendingOrders}</p>
                        <p className="text-sm text-yellow-600">Pending Orders</p>
                    </div>
                    <Link href="/dashboard/admin/orders?status=pending" className="ml-auto text-yellow-600 hover:text-yellow-700">
                        <FiArrowRight size={20} />
                    </Link>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <FiAlertCircle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-700">{stats?.lowStockProducts || demoStats.lowStockProducts}</p>
                        <p className="text-sm text-red-600">Low Stock Products</p>
                    </div>
                    <Link href="/dashboard/admin/products?stock=low" className="ml-auto text-red-600 hover:text-red-700">
                        <FiArrowRight size={20} />
                    </Link>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
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
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                            const height = [40, 55, 45, 60, 50, 75, 65, 80, 70, 85, 75, 90][i];
                            return (
                                <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full">
                                        <div
                                            className="w-full bg-gradient-to-t from-[#5CAF90] to-[#7BC4A8] rounded-t-lg transition-all duration-300 group-hover:from-[#4A9A7D] group-hover:to-[#5CAF90] cursor-pointer"
                                            style={{ height: `${height * 2.5}px` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ৳{(height * 1500).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
                            <p className="text-sm text-gray-500">Current breakdown</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: 'Delivered', value: 65, color: '#22C55E', icon: FiCheckCircle },
                            { label: 'Shipped', value: 15, color: '#6366F1', icon: FiTruck },
                            { label: 'Processing', value: 12, color: '#3B82F6', icon: FiPackage },
                            { label: 'Pending', value: 8, color: '#F59E0B', icon: FiClock },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="flex items-center gap-2 font-medium text-gray-700">
                                        <item.icon size={16} style={{ color: item.color }} />
                                        {item.label}
                                    </span>
                                    <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-800">
                                {(stats?.totalOrders || demoStats.totalOrders).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Total Orders This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                                {displayOrders.map((order: any, i: number) => (
                                    <tr key={order._id || i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-[#5CAF90]">{order.orderNumber}</p>
                                            <PaymentBadge status={order.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-800">
                                                {order.customer?.firstName} {order.customer?.lastName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-800">৳{order.total?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        {displayProducts.map((product: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
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
                                    <p className="font-bold text-gray-800">৳{product.price?.toLocaleString()}</p>
                                    <p className={`text-sm ${(product.quantity || 0) < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {product.quantity || 0} in stock
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#5CAF90] hover:shadow-lg hover:shadow-[#5CAF90]/10 transition-all group"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
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
