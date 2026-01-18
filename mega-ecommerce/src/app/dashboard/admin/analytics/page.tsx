"use client";

import React, { useState, useEffect } from 'react';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiRefreshCw,
    FiCalendar,
    FiArrowUp,
    FiArrowDown,
    FiPieChart,
    FiBarChart2,
    FiActivity,
    FiMapPin,
} from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Demo data
const demoData = {
    overview: {
        totalRevenue: 1254300,
        totalOrders: 1245,
        totalCustomers: 2450,
        averageOrderValue: 1007,
        revenueGrowth: 12.5,
        ordersGrowth: 8.2,
        customersGrowth: 15.3,
        aovGrowth: 4.1,
    },
    revenueByMonth: [
        { month: 'Jan', revenue: 85000 },
        { month: 'Feb', revenue: 92000 },
        { month: 'Mar', revenue: 88000 },
        { month: 'Apr', revenue: 105000 },
        { month: 'May', revenue: 98000 },
        { month: 'Jun', revenue: 125000 },
        { month: 'Jul', revenue: 115000 },
        { month: 'Aug', revenue: 135000 },
        { month: 'Sep', revenue: 128000 },
        { month: 'Oct', revenue: 145000 },
        { month: 'Nov', revenue: 138000 },
        { month: 'Dec', revenue: 165000 },
    ],
    topCategories: [
        { name: 'Electronics', value: 35, color: '#5CAF90' },
        { name: 'Clothing', value: 25, color: '#3B82F6' },
        { name: 'Footwear', value: 18, color: '#F59E0B' },
        { name: 'Accessories', value: 12, color: '#EC4899' },
        { name: 'Others', value: 10, color: '#8B5CF6' },
    ],
    topProducts: [
        { name: 'Wireless Headphones', sales: 234, revenue: 583266 },
        { name: 'Smart Watch Pro', sales: 189, revenue: 944811 },
        { name: 'Running Shoes', sales: 156, revenue: 545844 },
        { name: 'Laptop Bag', sales: 134, revenue: 200866 },
        { name: 'Bluetooth Speaker', sales: 112, revenue: 223888 },
    ],
    topCities: [
        { name: 'Dhaka', orders: 456, percentage: 45 },
        { name: 'Chattogram', orders: 189, percentage: 18 },
        { name: 'Rajshahi', orders: 98, percentage: 10 },
        { name: 'Khulna', orders: 85, percentage: 8 },
        { name: 'Sylhet', orders: 72, percentage: 7 },
        { name: 'Others', orders: 125, percentage: 12 },
    ],
    recentActivity: [
        { type: 'order', message: 'New order #ORD-1245 from Rahim Uddin', time: '5 min ago' },
        { type: 'customer', message: 'New customer Salma Begum registered', time: '12 min ago' },
        { type: 'payment', message: 'Payment of ৳4,999 received for #ORD-1244', time: '25 min ago' },
        { type: 'order', message: 'Order #ORD-1243 marked as delivered', time: '1 hour ago' },
        { type: 'review', message: 'New 5-star review for Wireless Headphones', time: '2 hours ago' },
    ],
};

// Stat Card Component
const StatCard = ({ title, value, change, trend, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    <span>{change}%</span>
                    <span className="text-gray-400 font-normal ml-1">vs last month</span>
                </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}>
                <Icon size={26} className={color} />
            </div>
        </div>
    </div>
);

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('30d');
    const [data, setData] = useState(demoData);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/analytics/overview?range=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await res.json();
            if (result.success) {
                setData({ ...demoData, ...result.data });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your store performance</p>
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
                        onClick={fetchAnalytics}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`৳${data.overview.totalRevenue.toLocaleString()}`}
                    change={data.overview.revenueGrowth}
                    trend="up"
                    icon={FiDollarSign}
                    color="text-[#5CAF90]"
                    bgColor="bg-[#5CAF90]/10"
                />
                <StatCard
                    title="Total Orders"
                    value={data.overview.totalOrders.toLocaleString()}
                    change={data.overview.ordersGrowth}
                    trend="up"
                    icon={FiShoppingCart}
                    color="text-blue-500"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total Customers"
                    value={data.overview.totalCustomers.toLocaleString()}
                    change={data.overview.customersGrowth}
                    trend="up"
                    icon={FiUsers}
                    color="text-purple-500"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`৳${data.overview.averageOrderValue.toLocaleString()}`}
                    change={data.overview.aovGrowth}
                    trend="up"
                    icon={FiActivity}
                    color="text-orange-500"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
                            <p className="text-sm text-gray-500">Monthly revenue breakdown</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-[#5CAF90]"></span>
                                Revenue
                            </span>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-2">
                        {data.revenueByMonth.map((item, i) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="relative w-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#5CAF90] to-[#7BC4A8] rounded-t-lg transition-all duration-300 cursor-pointer hover:from-[#4A9A7D] hover:to-[#5CAF90]"
                                        style={{ height: `${(item.revenue / maxRevenue) * 220}px` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ৳{item.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Sales by Category</h2>
                            <p className="text-sm text-gray-500">Product category breakdown</p>
                        </div>
                        <FiPieChart size={20} className="text-gray-400" />
                    </div>

                    {/* Donut Chart Placeholder */}
                    <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {data.topCategories.reduce((acc: any[], cat, i) => {
                                const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].value * 3.14159 * 0.8 : 0;
                                acc.push({
                                    ...cat,
                                    offset,
                                    dashArray: `${cat.value * 3.14159 * 0.8} ${100 * 3.14159 * 0.8}`,
                                });
                                return acc;
                            }, []).map((cat: any, i: number) => (
                                <circle
                                    key={i}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={cat.color}
                                    strokeWidth="20"
                                    strokeDasharray={cat.dashArray}
                                    strokeDashoffset={-cat.offset}
                                />
                            ))}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-800">100%</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {data.topCategories.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                    <span className="text-sm text-gray-600">{cat.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Top Products</h2>
                            <p className="text-sm text-gray-500">Best selling items</p>
                        </div>
                        <FiBarChart2 size={20} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        {data.topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                    {i + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{product.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-gray-500">{product.sales} sales</span>
                                        <span className="text-xs font-semibold text-[#5CAF90]">৳{product.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#5CAF90] rounded-full"
                                        style={{ width: `${(product.sales / data.topProducts[0].sales) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Cities */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Orders by City</h2>
                            <p className="text-sm text-gray-500">Geographic distribution</p>
                        </div>
                        <FiMapPin size={20} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        {data.topCities.map((city, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{city.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{city.orders} orders</span>
                                        <span className="text-xs font-semibold text-gray-800">{city.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                                        style={{ width: `${city.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                        <p className="text-sm text-gray-500">Latest store events</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {data.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                activity.type === 'customer' ? 'bg-green-100 text-green-600' :
                                    activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                                        'bg-yellow-100 text-yellow-600'
                                }`}>
                                {activity.type === 'order' ? <FiShoppingCart size={18} /> :
                                    activity.type === 'customer' ? <FiUsers size={18} /> :
                                        activity.type === 'payment' ? <FiDollarSign size={18} /> :
                                            <FiActivity size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">{activity.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
