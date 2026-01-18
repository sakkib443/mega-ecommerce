"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FiSearch,
    FiPlus,
    FiFilter,
    FiDownload,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiPackage,
    FiAlertTriangle,
    FiCheck,
    FiX,
    FiGrid,
    FiList,
} from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Demo products
const demoProducts = [
    {
        _id: '1',
        name: 'Premium Wireless Bluetooth Headphone',
        slug: 'premium-wireless-headphone',
        thumbnail: '/api/placeholder/80/80',
        price: 2499,
        comparePrice: 3999,
        quantity: 45,
        status: 'active',
        category: { name: 'Electronics' },
        rating: 4.5,
        reviewCount: 128,
        createdAt: '2024-01-15',
    },
    {
        _id: '2',
        name: 'Smart Watch Pro Max Series 5',
        slug: 'smart-watch-pro-max',
        thumbnail: '/api/placeholder/80/80',
        price: 4999,
        comparePrice: 6999,
        quantity: 12,
        status: 'active',
        category: { name: 'Wearables' },
        rating: 4.8,
        reviewCount: 89,
        createdAt: '2024-01-10',
    },
    {
        _id: '3',
        name: 'Premium Leather Laptop Bag',
        slug: 'leather-laptop-bag',
        thumbnail: '/api/placeholder/80/80',
        price: 1999,
        comparePrice: 2999,
        quantity: 5,
        status: 'active',
        category: { name: 'Bags' },
        rating: 4.2,
        reviewCount: 56,
        createdAt: '2024-01-12',
    },
    {
        _id: '4',
        name: 'Running Sports Shoes - Men',
        slug: 'running-sports-shoes',
        thumbnail: '/api/placeholder/80/80',
        price: 3499,
        comparePrice: 4999,
        quantity: 0,
        status: 'draft',
        category: { name: 'Footwear' },
        rating: 4.6,
        reviewCount: 234,
        createdAt: '2024-01-08',
    },
    {
        _id: '5',
        name: 'Portable Bluetooth Speaker Mini',
        slug: 'bluetooth-speaker-mini',
        thumbnail: '/api/placeholder/80/80',
        price: 1499,
        comparePrice: 1999,
        quantity: 67,
        status: 'active',
        category: { name: 'Electronics' },
        rating: 4.3,
        reviewCount: 78,
        createdAt: '2024-01-05',
    },
];

// Stock Badge
const StockBadge = ({ quantity }: { quantity: number }) => {
    if (quantity === 0) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <FiX size={10} />
                Out of Stock
            </span>
        );
    }
    if (quantity < 20) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                <FiAlertTriangle size={10} />
                Low Stock ({quantity})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <FiCheck size={10} />
            In Stock ({quantity})
        </span>
    );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        draft: 'bg-gray-100 text-gray-700',
        archived: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${config[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>(demoProducts);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`${API_URL}/products?${params}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || demoProducts);
                setTotalPages(data.meta?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    const handleSelect = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(p => p !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const stats = [
        { label: 'Total Products', value: products.length, color: 'bg-blue-500' },
        { label: 'Active', value: products.filter(p => p.status === 'active').length, color: 'bg-green-500' },
        { label: 'Low Stock', value: products.filter(p => p.quantity > 0 && p.quantity < 20).length, color: 'bg-yellow-500' },
        { label: 'Out of Stock', value: products.filter(p => p.quantity === 0).length, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your product inventory</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <Link
                        href="/dashboard/admin/products/new"
                        className="px-5 py-2.5 bg-gradient-to-r from-[#5CAF90] to-[#4A9A7D] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#5CAF90]/30 transition-all flex items-center gap-2"
                    >
                        <FiPlus size={18} />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-10 rounded-full ${stat.color}`}></div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
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
                                placeholder="Search products by name, SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                            />
                        </div>
                    </form>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="accessories">Accessories</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2.5 ${viewMode === 'table' ? 'bg-[#5CAF90] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FiList size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 ${viewMode === 'grid' ? 'bg-[#5CAF90] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FiGrid size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {selectedProducts.length} selected
                        </span>
                        <button className="text-sm text-red-600 hover:underline">Delete Selected</button>
                        <button className="text-sm text-blue-600 hover:underline">Set to Draft</button>
                        <button className="text-sm text-green-600 hover:underline">Set to Active</button>
                    </div>
                )}
            </div>

            {/* Products Table */}
            {viewMode === 'table' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-[#5CAF90] focus:ring-[#5CAF90]"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-48"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500">No products found</p>
                                            <Link href="/dashboard/admin/products/new" className="text-[#5CAF90] hover:underline mt-2 inline-block">
                                                Add your first product
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => handleSelect(product._id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#5CAF90] focus:ring-[#5CAF90]"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {product.thumbnail ? (
                                                            <img
                                                                src={product.thumbnail}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiPackage size={24} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                                        <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                                            <span className="text-yellow-500">★</span>
                                                            {product.rating} ({product.reviewCount} reviews)
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{product.category?.name || 'Uncategorized'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800">৳{product.price?.toLocaleString()}</p>
                                                {product.comparePrice > product.price && (
                                                    <p className="text-xs text-gray-400 line-through">৳{product.comparePrice?.toLocaleString()}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StockBadge quantity={product.quantity} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/product/${product.slug}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#5CAF90] transition-colors"
                                                    >
                                                        <FiEye size={18} />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/admin/products/${product._id}/edit`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </Link>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                                        <FiTrash2 size={18} />
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
                            Showing {products.length} products
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
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            <div className="relative h-48 bg-gray-100">
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiPackage size={48} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <StatusBadge status={product.status} />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Link href={`/product/${product.slug}`} className="p-3 bg-white rounded-full hover:bg-gray-100">
                                        <FiEye size={18} />
                                    </Link>
                                    <Link href={`/dashboard/admin/products/${product._id}/edit`} className="p-3 bg-white rounded-full hover:bg-gray-100">
                                        <FiEdit2 size={18} />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-semibold text-gray-800 line-clamp-2 mb-2">{product.name}</p>
                                <p className="text-sm text-gray-500 mb-3">{product.category?.name}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">৳{product.price?.toLocaleString()}</p>
                                        {product.comparePrice > product.price && (
                                            <p className="text-xs text-gray-400 line-through">৳{product.comparePrice?.toLocaleString()}</p>
                                        )}
                                    </div>
                                    <StockBadge quantity={product.quantity} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
