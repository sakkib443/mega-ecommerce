"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiEye,
    FiTruck,
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiCalendar,
    FiMoreVertical
} from 'react-icons/fi';
import {
    useGetAdminOrdersQuery,
    useUpdateOrderStatusMutation,
    useGetOrderStatsQuery
} from '@/redux/api/orderApi';
import { toast } from 'react-hot-toast';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: FiClock },
        confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: FiCheckCircle },
        processing: { bg: 'bg-purple-50', text: 'text-purple-700', icon: FiPackage },
        shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: FiTruck },
        delivered: { bg: 'bg-green-50', text: 'text-green-700', icon: FiCheckCircle },
        cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: FiXCircle },
        returned: { bg: 'bg-gray-50', text: 'text-gray-700', icon: FiRefreshCw },
    };

    const { bg, text, icon: Icon } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${bg} ${text}`}>
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
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

export default function OrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    // API Hooks
    const { data: ordersData, isLoading, refetch } = useGetAdminOrdersQuery({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
    });

    const { data: statsData } = useGetOrderStatsQuery({});
    const [updateStatus] = useUpdateOrderStatusMutation();

    const orders = ordersData?.data || [];
    const totalPages = ordersData?.meta?.totalPages || 1;
    const totalOrders = ordersData?.meta?.total || 0;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statsConfig = [
        { label: 'All Orders', value: statsData?.data?.total || 0, color: 'text-gray-700', bg: 'bg-white border-gray-200', key: 'all' },
        { label: 'Pending', value: statsData?.data?.pending || 0, color: 'text-yellow-700', bg: 'bg-white border-yellow-200', key: 'pending' },
        { label: 'Confirmed', value: statsData?.data?.confirmed || 0, color: 'text-blue-700', bg: 'bg-white border-blue-200', key: 'confirmed' },
        { label: 'Processing', value: statsData?.data?.processing || 0, color: 'text-purple-700', bg: 'bg-white border-purple-200', key: 'processing' },
        { label: 'Shipped', value: statsData?.data?.shipped || 0, color: 'text-indigo-700', bg: 'bg-white border-indigo-200', key: 'shipped' },
        { label: 'Delivered', value: statsData?.data?.delivered || 0, color: 'text-green-700', bg: 'bg-white border-green-200', key: 'delivered' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders from one place</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
                    >
                        <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-5 py-2.5 bg-[#5CAF90] text-white rounded-md text-sm font-semibold hover:bg-[#4A9A7D] transition-all shadow-md flex items-center gap-2">
                        <FiDownload size={16} />
                        Export Orders
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {statsConfig.map((stat, i) => (
                    <div
                        key={i}
                        className={`${stat.bg} border rounded-md p-4 cursor-pointer transition-all hover:shadow-md bg-white ${statusFilter === stat.key ? 'ring-2 ring-[#5CAF90] border-transparent' : ''}`}
                        onClick={() => {
                            setStatusFilter(stat.key);
                            setPage(1);
                        }}
                    >
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className={`text-sm ${stat.color} opacity-80 font-medium`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by order number, customer name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#5CAF90]/20 focus:border-[#5CAF90] focus:bg-white transition-all outline-none text-sm"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#5CAF90]/20 focus:border-[#5CAF90] transition-all outline-none text-sm bg-white min-w-[150px]"
                    >
                        <option value="all">Total Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>

                    <button className="px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm text-gray-600">
                        <FiCalendar size={16} />
                        Filter Date
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italicContent">
                            {isLoading ? (
                                [...Array(limit)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-10 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <FiPackage size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-500">No orders found matching your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#5CAF90]">{order.orderNumber}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">VIA {order.paymentMethod.toUpperCase()}</p>
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
                                                    className="p-2 hover:bg-white hover:shadow-md rounded-md text-gray-400 hover:text-[#5CAF90] transition-all border border-transparent hover:border-gray-100"
                                                    title="View Details"
                                                >
                                                    <FiEye size={18} />
                                                </Link>
                                                <button className="p-2 hover:bg-white hover:shadow-md rounded-md text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100">
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{orders.length}</span> of <span className="text-gray-900">{totalOrders}</span> orders
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${page === i + 1
                                            ? 'bg-[#5CAF90] text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
