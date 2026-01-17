"use client";

import React from 'react';
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
    FiArrowRight
} from 'react-icons/fi';

// Stats data
const stats = [
    {
        title: 'Total Revenue',
        value: '৳1,25,430',
        change: '+12.5%',
        trend: 'up',
        icon: FiDollarSign,
        color: '#5CAF90',
        bgColor: 'rgba(92, 175, 144, 0.1)'
    },
    {
        title: 'Total Orders',
        value: '1,245',
        change: '+8.2%',
        trend: 'up',
        icon: FiShoppingCart,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
        title: 'Total Products',
        value: '356',
        change: '+5.1%',
        trend: 'up',
        icon: FiShoppingBag,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
        title: 'Total Customers',
        value: '2,450',
        change: '-2.4%',
        trend: 'down',
        icon: FiUsers,
        color: '#EC4899',
        bgColor: 'rgba(236, 72, 153, 0.1)'
    },
];

// Recent orders data
const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', product: 'Wireless Headphones', amount: '৳2,499', status: 'Delivered', date: 'Today' },
    { id: '#ORD-002', customer: 'Jane Smith', product: 'Smart Watch Pro', amount: '৳4,999', status: 'Processing', date: 'Today' },
    { id: '#ORD-003', customer: 'Mike Johnson', product: 'Laptop Bag', amount: '৳1,499', status: 'Shipped', date: 'Yesterday' },
    { id: '#ORD-004', customer: 'Sarah Wilson', product: 'Running Shoes', amount: '৳3,499', status: 'Pending', date: 'Yesterday' },
    { id: '#ORD-005', customer: 'Tom Brown', product: 'Bluetooth Speaker', amount: '৳1,999', status: 'Delivered', date: '2 days ago' },
];

// Top products data
const topProducts = [
    { name: 'Wireless Headphones', sales: 234, revenue: '৳5,83,266', stock: 45, image: '🎧' },
    { name: 'Smart Watch Pro', sales: 189, revenue: '৳9,44,811', stock: 32, image: '⌚' },
    { name: 'Running Shoes', sales: 156, revenue: '৳5,45,844', stock: 67, image: '👟' },
    { name: 'Laptop Bag', sales: 134, revenue: '৳2,00,866', stock: 89, image: '💼' },
    { name: 'Bluetooth Speaker', sales: 112, revenue: '৳2,23,888', stock: 23, image: '🔊' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-700';
        case 'Processing': return 'bg-blue-100 text-blue-700';
        case 'Shipped': return 'bg-purple-100 text-purple-700';
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const AdminDashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, Admin! Here's what's happening.</p>
                </div>
                <div className="flex gap-3">
                    <select className="px-4 py-2 border rounded-lg bg-white text-sm">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                        <option>This year</option>
                    </select>
                    <button className="px-4 py-2 bg-[#5CAF90] text-white rounded-lg text-sm font-medium hover:opacity-90">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <stat.icon size={24} style={{ color: stat.color }} />
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.trend === 'up' ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Sales Overview</h2>
                            <p className="text-sm text-gray-500">Monthly revenue statistics</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <FiMoreVertical />
                        </button>
                    </div>

                    {/* Simple Chart Placeholder */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-[#5CAF90] rounded-t-lg transition-all hover:bg-[#4A9A7D]"
                                    style={{ height: `${Math.random() * 150 + 50}px` }}
                                />
                                <span className="text-xs text-gray-500">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
                            <p className="text-sm text-gray-500">Current order breakdown</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Delivered', value: 65, color: '#22C55E' },
                            { label: 'Processing', value: 20, color: '#3B82F6' },
                            { label: 'Shipped', value: 10, color: '#A855F7' },
                            { label: 'Pending', value: 5, color: '#F59E0B' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-800">1,245</p>
                            <p className="text-sm text-gray-500">Total Orders This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                            <p className="text-sm text-gray-500">Latest customer orders</p>
                        </div>
                        <Link href="/admin/orders" className="text-[#5CAF90] text-sm font-medium flex items-center gap-1 hover:underline">
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-[#5CAF90]">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
                            <p className="text-sm text-gray-500">Best selling products</p>
                        </div>
                        <Link href="/admin/products" className="text-[#5CAF90] text-sm font-medium flex items-center gap-1 hover:underline">
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {topProducts.map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                                        {product.image}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-800">{product.revenue}</p>
                                    <p className="text-sm text-gray-500">{product.stock} in stock</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Add Product', icon: FiShoppingBag, href: '/admin/products/new' },
                        { label: 'View Orders', icon: FiShoppingCart, href: '/admin/orders' },
                        { label: 'Customers', icon: FiUsers, href: '/admin/customers' },
                        { label: 'Analytics', icon: FiTrendingUp, href: '/admin/analytics' },
                        { label: 'Inventory', icon: FiPackage, href: '/admin/inventory' },
                        { label: 'Theme', icon: FiEye, href: '/admin/theme' },
                    ].map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#5CAF90] hover:bg-[#5CAF90]/5 transition-all"
                        >
                            <action.icon size={24} className="text-[#5CAF90]" />
                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
