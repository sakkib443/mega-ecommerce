"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiChevronRight,
    FiGrid,
    FiEye,
    FiMoreVertical
} from 'react-icons/fi';
import {
    useGetCategoriesQuery,
    useDeleteCategoryMutation
} from '@/redux/api/categoryApi';
import { toast } from 'react-hot-toast';

const CategoriesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery({});
    const [deleteCategory] = useDeleteCategoryMutation();

    const categories = categoriesData?.data || [];

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id).unwrap();
                toast.success('Category deleted successfully');
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to delete category');
            }
        }
    };

    const filteredCategories = categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Product Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your store's product organization and hierarchy</p>
                </div>
                <Link
                    href="/dashboard/admin/categories/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#5CAF90] text-white rounded-md font-semibold hover:bg-[#4A9A7D] transition-all shadow-md"
                >
                    <FiPlus size={20} />
                    Create Category
                </Link>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] focus:bg-white transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-all text-gray-600 shadow-sm">
                        <FiFilter size={18} />
                        Filter
                    </button>
                    <button onClick={() => refetch()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-all text-gray-600 shadow-sm">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center text-gray-500">
                        <div className="animate-spin w-10 h-10 border-4 border-[#5CAF90] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Loading categories...</p>
                    </div>
                ) : filteredCategories.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCategories.map((cat: any) => (
                                    <tr key={cat._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {cat.image ? (
                                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FiGrid size={22} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{cat.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{cat.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${cat.level === 0 ? 'bg-blue-100 text-blue-600' :
                                                cat.level === 1 ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-purple-100 text-purple-600'
                                                }`}>
                                                {cat.level === 0 ? 'Root' : cat.level === 1 ? 'Sub-Cat' : 'Grand-Cat'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                {cat.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                                            {cat.productCount || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            {cat.isFeatured ? (
                                                <span className="text-yellow-600 font-bold text-[10px] uppercase bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">Featured</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/dashboard/admin/categories/new?id=${cat._id}`}
                                                    className="p-2 hover:bg-white hover:shadow-md rounded-md text-[#5CAF90] transition-all border border-transparent hover:border-gray-100"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="p-2 hover:bg-white hover:shadow-md rounded-md text-red-500 transition-all border border-transparent hover:border-gray-100"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-gray-500 transition-all">
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <FiGrid size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No categories found</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Try adjusting your search or create a new category to get started.</p>
                        <Link
                            href="/dashboard/admin/categories/new"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-[#5CAF90] text-white rounded-xl font-bold hover:bg-[#4A9A7D] transition-all"
                        >
                            <FiPlus size={20} />
                            Create Your First Category
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
