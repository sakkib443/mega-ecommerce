"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiEye,
    FiEdit2,
    FiTruck,
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiCalendar,
    FiDollarSign,
    FiMoreVertical
} from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: FiClock },
        confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: FiCheckCircle },
        processing: { bg: 'bg-purple-50', text: 'text-purple-700', icon: FiPackage },
        shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: FiTruck },
        delivered: { bg: 'bg-green-50', text: 'text-green-700', icon: FiCheckCircle },
        cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: FiXCircle },
    };

    const { bg, text, icon: Icon } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
            <Icon size={12} />
            <span className="capitalize">{status}</span>
        </span>
    );
};

// Payment Badge Component
const PaymentBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        paid: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Demo orders data
const demoOrders = [
    {
        _id: '1',
        orderNumber: 'ORD-2024-001',
        user: { firstName: 'Rahim', lastName: 'Uddin', email: 'rahim@example.com' },
        items: [{ name: 'Wireless Headphones', quantity: 1 }, { name: 'USB Cable', quantity: 2 }],
        total: 2999,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'bkash',
        shippingAddress: { city: 'Dhaka' },
        createdAt: '2024-01-18T10:30:00Z',
    },
    {
        _id: '2',
        orderNumber: 'ORD-2024-002',
        user: { firstName: 'Karim', lastName: 'Hossain', email: 'karim@example.com' },
        items: [{ name: 'Smart Watch Pro', quantity: 1 }],
        total: 4999,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'sslcommerz',
        shippingAddress: { city: 'Chattogram' },
        createdAt: '2024-01-18T12:00:00Z',
    },
    {
        _id: '3',
        orderNumber: 'ORD-2024-003',
        user: { firstName: 'Jamal', lastName: 'Mia', email: 'jamal@example.com' },
        items: [{ name: 'Laptop Bag', quantity: 1 }, { name: 'Mouse Pad', quantity: 1 }],
        total: 1799,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'cod',
        shippingAddress: { city: 'Rajshahi' },
        createdAt: '2024-01-17T15:30:00Z',
    },
    {
        _id: '4',
        orderNumber: 'ORD-2024-004',
        user: { firstName: 'Salma', lastName: 'Begum', email: 'salma@example.com' },
        items: [{ name: 'Running Shoes', quantity: 1 }],
        total: 3499,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        shippingAddress: { city: 'Sylhet' },
        createdAt: '2024-01-18T08:45:00Z',
    },
    {
        _id: '5',
        orderNumber: 'ORD-2024-005',
        user: { firstName: 'Faruk', lastName: 'Ahmed', email: 'faruk@example.com' },
        items: [{ name: 'Bluetooth Speaker', quantity: 2 }],
        total: 2998,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bkash',
        shippingAddress: { city: 'Khulna' },
        createdAt: '2024-01-18T14:20:00Z',
    },
    {
        _id: '6',
        orderNumber: 'ORD-2024-006',
        user: { firstName: 'Nazma', lastName: 'Khatun', email: 'nazma@example.com' },
        items: [{ name: 'Phone Case', quantity: 3 }],
        total: 897,
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'sslcommerz',
        shippingAddress: { city: 'Barishal' },
        createdAt: '2024-01-16T09:15:00Z',
    },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>(demoOrders);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`${API_URL}/orders/admin/all?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || demoOrders);
                setTotalPages(data.meta?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stats = [
        { label: 'All Orders', value: orders.length, color: 'text-gray-700', bg: 'bg-gray-100' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-700', bg: 'bg-yellow-100' },
        { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: 'text-purple-700', bg: 'bg-purple-100' },
        { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: 'text-indigo-700', bg: 'bg-indigo-100' },
        { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-700', bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <FiDownload size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={`${stat.bg} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`}
                        onClick={() => setStatusFilter(stat.label === 'All Orders' ? 'all' : stat.label.toLowerCase())}
                    >
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className={`text-sm ${stat.color} opacity-80`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by order number, customer name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                            />
                        </div>
                    </form>

                    {/* Status Filter */}
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                            <FiCalendar size={16} />
                            Date Range
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">No orders found</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#5CAF90]">{order.orderNumber}</p>
                                            <p className="text-xs text-gray-400">{order.shippingAddress?.city}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">
                                                {order.user?.firstName} {order.user?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {order.items?.length || 0} items
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">৳{order.total?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentBadge status={order.paymentStatus} />
                                            <p className="text-xs text-gray-400 mt-1 uppercase">{order.paymentMethod}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/orders/${order._id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#5CAF90] transition-colors"
                                                >
                                                    <FiEye size={18} />
                                                </Link>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#5CAF90] transition-colors">
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {orders.length} of {orders.length} orders
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
