"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiSearch,
    FiDownload,
    FiMail,
    FiEye,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiShoppingBag,
    FiDollarSign,
    FiCalendar,
    FiPhone,
    FiMapPin,
} from 'react-icons/fi';
import {
    useGetAdminUsersQuery,
    useGetAdminUserStatsQuery
} from '@/redux/api/userApi';
import toast from 'react-hot-toast';

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; border: string }> = {
        active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
        blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    };
    const { bg, text, border } = config[status] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${bg} ${text} ${border}`}>
            {status}
        </span>
    );
};

// Customer Avatar
const Avatar = ({ name, avatar }: { name: string; avatar?: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;

    if (avatar) {
        return (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-md object-cover border border-gray-100" />
        );
    }

    return (
        <div className={`w-10 h-10 rounded-md ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {initials}
        </div>
    );
};

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    // RTK Query Hooks
    const {
        data: usersData,
        isLoading: isUsersLoading,
        isFetching: isUsersFetching,
        refetch: refetchUsers
    } = useGetAdminUsersQuery({
        page,
        limit: 10,
        role: 'customer',
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
    });

    const {
        data: statsData,
        isLoading: isStatsLoading,
        refetch: refetchStats
    } = useGetAdminUserStatsQuery(undefined);

    const handleRefresh = () => {
        refetchUsers();
        refetchStats();
        toast.success('Data refreshed');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const customers = usersData?.data || [];
    const meta = usersData?.meta || { totalPages: 1, total: 0 };
    const stats = statsData?.data || { totalUsers: 0, activeUsers: 0, blockedUsers: 0, totalCustomers: 0 };

    const statCards = [
        { label: 'Total Customers', value: stats.totalCustomers || meta.total, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Active', value: stats.activeUsers, icon: FiUserCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Blocked', value: stats.blockedUsers, icon: FiUserX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        { label: 'New This Month', value: 12, icon: FiCalendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Customers</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor your customer base</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
                    >
                        <FiRefreshCw size={16} className={(isUsersFetching || isStatsLoading) ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-4 py-2.5 bg-[#5CAF90] text-white rounded-md text-sm font-semibold hover:bg-[#4A9A7D] flex items-center gap-2 transition-all shadow-sm">
                        <FiDownload size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className={`${stat.bg} ${stat.border} border rounded-md p-5 shadow-sm hover:shadow-md transition-all`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-md bg-white shadow-sm ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${stat.color} leading-none`}>
                                    {isStatsLoading ? '...' : stat.value?.toLocaleString()}
                                </p>
                                <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent outline-none transition-all bg-gray-50/30"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent outline-none bg-white text-sm font-medium min-w-[140px]"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="pending">Pending</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isUsersLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <FiUsers size={32} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium text-lg">No customers found</p>
                                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer: any) => (
                                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={`${customer.firstName} ${customer.lastName}`}
                                                    avatar={customer.avatar}
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">ID: {customer._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 flex items-center gap-1.5 font-medium">
                                                <FiMail size={14} className="text-gray-400" />
                                                {customer.email}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                                <FiPhone size={14} className="text-gray-400" />
                                                {customer.phone || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                <FiMapPin size={14} className="text-gray-400" />
                                                {customer.addresses?.[0]?.city || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={customer.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                                                <FiCalendar size={14} className="text-gray-400" />
                                                {formatDate(customer.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/customers/${customer._id}`}
                                                    className="p-2 bg-gray-50 hover:bg-white text-gray-500 hover:text-[#5CAF90] border border-gray-100 hover:border-[#5CAF90]/30 rounded-md transition-all shadow-sm"
                                                    title="View Profile"
                                                >
                                                    <FiEye size={18} />
                                                </Link>
                                                <button
                                                    className="p-2 bg-gray-50 hover:bg-white text-gray-500 hover:text-blue-500 border border-gray-100 hover:border-blue-200 rounded-md transition-all shadow-sm"
                                                    title="Send Message"
                                                >
                                                    <FiMail size={18} />
                                                </button>
                                                <button className="p-2 bg-gray-50 hover:bg-white text-gray-500 hover:text-gray-800 border border-gray-100 hover:border-gray-200 rounded-md transition-all shadow-sm">
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
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-800 font-bold">{customers.length}</span> of <span className="text-gray-800 font-bold">{meta.total}</span> customers
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isUsersLoading}
                            className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-gray-700 shadow-sm">
                            Page {page} of {meta.totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages || isUsersLoading}
                            className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
