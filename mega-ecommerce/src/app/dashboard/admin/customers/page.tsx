"use client";

import React, { useState, useEffect } from 'react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Demo customers
const demoCustomers = [
    {
        _id: '1',
        firstName: 'Rahim',
        lastName: 'Uddin',
        email: 'rahim@example.com',
        phone: '01712345678',
        status: 'active',
        totalOrders: 12,
        totalSpent: 24500,
        avatar: null,
        addresses: [{ city: 'Dhaka' }],
        createdAt: '2024-01-05',
    },
    {
        _id: '2',
        firstName: 'Karim',
        lastName: 'Hossain',
        email: 'karim@example.com',
        phone: '01823456789',
        status: 'active',
        totalOrders: 8,
        totalSpent: 18750,
        avatar: null,
        addresses: [{ city: 'Chattogram' }],
        createdAt: '2024-01-08',
    },
    {
        _id: '3',
        firstName: 'Salma',
        lastName: 'Begum',
        email: 'salma@example.com',
        phone: '01934567890',
        status: 'active',
        totalOrders: 5,
        totalSpent: 12300,
        avatar: null,
        addresses: [{ city: 'Rajshahi' }],
        createdAt: '2024-01-10',
    },
    {
        _id: '4',
        firstName: 'Jamal',
        lastName: 'Mia',
        email: 'jamal@example.com',
        phone: '01545678901',
        status: 'blocked',
        totalOrders: 2,
        totalSpent: 4500,
        avatar: null,
        addresses: [{ city: 'Sylhet' }],
        createdAt: '2024-01-12',
    },
    {
        _id: '5',
        firstName: 'Nazma',
        lastName: 'Khatun',
        email: 'nazma@example.com',
        phone: '01656789012',
        status: 'active',
        totalOrders: 15,
        totalSpent: 35600,
        avatar: null,
        addresses: [{ city: 'Khulna' }],
        createdAt: '2024-01-02',
    },
];

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        blocked: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const { bg, text } = config[status] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${bg} ${text}`}>
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
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        );
    }

    return (
        <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}>
            {initials}
        </div>
    );
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>(demoCustomers);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                role: 'customer',
            });
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`${API_URL}/users/admin/all?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data || demoCustomers);
                setTotalPages(data.meta?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const stats = [
        { label: 'Total Customers', value: customers.length, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active', value: customers.filter(c => c.status === 'active').length, icon: FiUserCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Blocked', value: customers.filter(c => c.status === 'blocked').length, icon: FiUserX, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Total Revenue', value: `৳${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-500 mt-1">Manage your customer base</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchCustomers}
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

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-xl p-5`}>
                        <div className="flex items-center gap-3">
                            <stat.icon size={24} className={stat.color} />
                            <div>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                            </div>
                        </div>
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
                                placeholder="Search by name, email, phone..."
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
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spent</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={`${customer.firstName} ${customer.lastName}`}
                                                    avatar={customer.avatar}
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">ID: {customer._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <FiMail size={12} className="text-gray-400" />
                                                {customer.email}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <FiPhone size={12} className="text-gray-400" />
                                                {customer.phone || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <FiMapPin size={12} className="text-gray-400" />
                                                {customer.addresses?.[0]?.city || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800 flex items-center gap-1">
                                                <FiShoppingBag size={14} className="text-[#5CAF90]" />
                                                {customer.totalOrders || 0}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">৳{(customer.totalSpent || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={customer.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <FiCalendar size={12} className="text-gray-400" />
                                                {formatDate(customer.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/customers/${customer._id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#5CAF90] transition-colors"
                                                >
                                                    <FiEye size={18} />
                                                </Link>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                                    <FiMail size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
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
                        Showing {customers.length} customers
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
