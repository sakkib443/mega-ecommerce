"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiSearch,
    FiDownload,
    FiRefreshCw,
    FiCreditCard,
    FiDollarSign,
    FiTrendingUp,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiRotateCcw,
    FiFilter,
} from 'react-icons/fi';
import {
    useGetAdminPaymentsQuery,
    useGetPaymentStatsQuery,
    useMarkCODPaidMutation,
    useRefundPaymentMutation
} from '@/redux/api/paymentApi';
import toast from 'react-hot-toast';

// Payment Status Badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: any }> = {
        paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', icon: FiCheckCircle },
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', icon: FiClock },
        failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: FiXCircle },
        refunded: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: FiRotateCcw },
        cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', icon: FiXCircle },
    };
    const { bg, text, border, icon: Icon } = config[status.toLowerCase()] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize border flex items-center gap-1.5 w-fit ${bg} ${text} ${border}`}>
            <Icon size={12} />
            {status}
        </span>
    );
};

// Payment Method Badge
const MethodBadge = ({ method }: { method: string }) => {
    return (
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
            {method}
        </span>
    );
};

export default function PaymentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [page, setPage] = useState(1);

    // Mutations
    const [markPaid] = useMarkCODPaidMutation();
    const [refund] = useRefundPaymentMutation();

    // Query
    const {
        data: paymentsData,
        isLoading: isPaymentsLoading,
        isFetching: isPaymentsFetching,
        refetch: refetchPayments
    } = useGetAdminPaymentsQuery({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        method: methodFilter !== 'all' ? methodFilter : undefined,
        searchTerm: search || undefined
    });

    const {
        data: statsData,
        isLoading: isStatsLoading,
        refetch: refetchStats
    } = useGetPaymentStatsQuery(undefined);

    const handleRefresh = () => {
        refetchPayments();
        refetchStats();
        toast.success('Payments updated');
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await markPaid(id).unwrap();
            toast.success('Payment marked as paid');
        } catch (error: any) {
            toast.error(error.data?.message || 'Failed to update payment');
        }
    };

    const handleRefund = async (id: string) => {
        if (!window.confirm('Are you sure you want to refund this payment?')) return;
        try {
            await refund(id).unwrap();
            toast.success('Refund processed successfully');
        } catch (error: any) {
            toast.error(error.data?.message || 'Failed to process refund');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const payments = paymentsData?.data || [];
    const meta = paymentsData?.meta || { totalPages: 1, total: 0 };
    const stats = statsData?.data || { totalAmount: 0, pendingAmount: 0, completedAmount: 0, totalPayments: 0 };

    const statCards = [
        { label: 'Total Revenue', value: `৳${stats.totalAmount?.toLocaleString()}`, icon: FiTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Pending Payouts', value: `৳${stats.pendingAmount?.toLocaleString()}`, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Completed', value: `৳${stats.completedAmount?.toLocaleString()}`, icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Total TXNs', value: stats.totalPayments?.toLocaleString(), icon: FiCreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Payments</h1>
                    <p className="text-gray-500 mt-1">Track and manage all customer transactions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
                    >
                        <FiRefreshCw size={16} className={(isPaymentsFetching || isStatsLoading) ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-4 py-2.5 bg-[#5CAF90] text-white rounded-md text-sm font-semibold hover:bg-[#4A9A7D] flex items-center gap-2 transition-all shadow-sm">
                        <FiDownload size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className={`${stat.bg} ${stat.border} border rounded-md p-5 shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-md bg-white shadow-sm ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${stat.color} leading-none`}>
                                    {isStatsLoading ? '...' : stat.value}
                                </p>
                                <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Transaction ID or Customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent outline-none transition-all bg-gray-50/30 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white">
                            <FiFilter size={14} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="outline-none bg-transparent text-sm font-medium text-gray-700 min-w-[100px]"
                            >
                                <option value="all">Status: All</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Method Filter */}
                        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white">
                            <FiCreditCard size={14} className="text-gray-400" />
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="outline-none bg-transparent text-sm font-medium text-gray-700 min-w-[100px]"
                            >
                                <option value="all">Method: All</option>
                                <option value="sslcommerz">SSLCommerz</option>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="cod">Cash on Delivery</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isPaymentsLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                                        <FiCreditCard size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No payments record found</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment: any) => (
                                    <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-800">#{payment.transactionId || 'N/A'}</p>
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">ORDER ID: {payment.orderId?.slice(-8).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200">
                                                    {payment.user?.firstName?.[0]}{payment.user?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">{payment.user?.firstName} {payment.user?.lastName}</p>
                                                    <p className="text-[11px] text-gray-400">{payment.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[#2C742F]">৳{payment.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <MethodBadge method={payment.method} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentStatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 font-medium">{formatDate(payment.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {payment.method === 'cod' && payment.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(payment._id)}
                                                        className="px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded-md text-[10px] font-bold hover:bg-green-100 transition-colors"
                                                    >
                                                        MARK PAID
                                                    </button>
                                                )}
                                                {payment.status === 'paid' && (
                                                    <button
                                                        onClick={() => handleRefund(payment._id)}
                                                        className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-md text-[10px] font-bold hover:bg-purple-100 transition-colors"
                                                    >
                                                        REFUND
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/dashboard/admin/orders/${payment.orderId}`}
                                                    className="p-2 text-gray-400 hover:text-[#5CAF90] bg-gray-50 rounded-md border border-gray-100 hover:border-[#5CAF90]/30 transition-all"
                                                >
                                                    <FiEye size={16} />
                                                </Link>
                                                <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-md">
                                                    <FiMoreVertical size={16} />
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
                        Showing <span className="text-gray-800 font-bold">{payments.length}</span> of <span className="text-gray-800 font-bold">{meta.total}</span> payments
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isPaymentsLoading}
                            className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-gray-700 shadow-sm">
                            Page {page} of {meta.totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages || isPaymentsLoading}
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
