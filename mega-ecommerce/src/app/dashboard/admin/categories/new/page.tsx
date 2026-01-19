"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiSave,
    FiImage,
    FiX,
    FiPlus,
    FiInfo,
    FiSettings,
} from 'react-icons/fi';
import {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useGetCategoryByIdQuery,
    useGetCategoriesQuery
} from '@/redux/api/categoryApi';
import { toast } from 'react-hot-toast';

const CategoryFormInner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('id');
    const isEditing = !!categoryId;

    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const { data: categoryToEdit, isLoading: isFetching } = useGetCategoryByIdQuery(categoryId, { skip: !isEditing });
    const { data: categoriesData } = useGetCategoriesQuery({});

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentCategory: '',
        status: 'active',
        isFeatured: false,
        showInMenu: true,
        showInHome: true,
        order: 0,
        image: '',
        icon: '',
        banner: '',
        metaTitle: '',
        metaDescription: '',
    });

    // Populate form if editing
    useEffect(() => {
        if (isEditing && categoryToEdit?.data) {
            const cat = categoryToEdit.data;
            setFormData({
                name: cat.name || '',
                slug: cat.slug || '',
                description: cat.description || '',
                parentCategory: cat.parentCategory?._id || cat.parentCategory || '',
                status: cat.status || 'active',
                isFeatured: !!cat.isFeatured,
                showInMenu: !!cat.showInMenu,
                showInHome: !!cat.showInHome,
                order: cat.order || 0,
                image: cat.image || '',
                icon: cat.icon || '',
                banner: cat.banner || '',
                metaTitle: cat.metaTitle || '',
                metaDescription: cat.metaDescription || '',
            });
        }
    }, [isEditing, categoryToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-generate slug from name if not editing slug manually
        if (name === 'name' && !isEditing) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                await updateCategory({ id: categoryId, data: formData }).unwrap();
                toast.success('Category updated successfully');
            } else {
                await createCategory(formData).unwrap();
                toast.success('Category created successfully');
            }
            router.push('/dashboard/admin/categories');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Something went wrong');
        }
    };

    if (isEditing && isFetching) {
        return <div className="p-20 text-center">Loading category data...</div>;
    }

    const categories = categoriesData?.data || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/categories"
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600"
                    >
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Category' : 'Create New Category'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditing ? `Update details for "${formData.name}"` : 'Setup a new product category for your store'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isCreating || isUpdating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5CAF90] text-white rounded-md font-bold hover:bg-[#4A9A7D] transition-all shadow-md disabled:opacity-50"
                >
                    <FiSave size={20} />
                    {isCreating || isUpdating ? 'Saving...' : 'Save Category'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <FiInfo className="text-[#5CAF90]" size={18} />
                            <h2 className="font-bold text-gray-800">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Electronics, Men's Fashion"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Slug (URL Key)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    placeholder="electronics-products"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Parent Category</label>
                            <select
                                name="parentCategory"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                value={formData.parentCategory}
                                onChange={handleChange}
                            >
                                <option value="">Root Category (None)</option>
                                {categories.map((cat: any) => (
                                    cat._id !== categoryId && (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.level > 0 ? '— '.repeat(cat.level) : ''}{cat.name}
                                        </option>
                                    )
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Describe this category for your customers..."
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <FiSettings className="text-[#5CAF90]" size={18} />
                            <h2 className="font-bold text-gray-800">Display & SEO</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Meta Title</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    placeholder="SEO Page Title"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.order}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                            <textarea
                                name="metaDescription"
                                rows={3}
                                placeholder="SEO Meta Description..."
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                value={formData.metaDescription}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar Config */}
                <div className="space-y-6">
                    {/* Media */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <FiImage className="text-[#5CAF90]" size={18} />
                            <h2 className="font-bold text-gray-800">Media & Icon</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                                {formData.image && (
                                    <div className="mt-2 w-full aspect-square bg-gray-50 rounded-md overflow-hidden border border-gray-200 relative group">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Icon URL (SVG/Font)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    placeholder="https://icon-url.svg"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                    value={formData.icon}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visibility & Status */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <FiSettings className="text-[#5CAF90]" size={18} />
                            <h2 className="font-bold text-gray-800">Status & Toggle</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Status</label>
                            <select
                                name="status"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#5CAF90] transition-all text-sm"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-4 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        className="sr-only"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.isFeatured ? 'bg-[#5CAF90]' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-all ${formData.isFeatured ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Featured Category</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="showInMenu"
                                        className="sr-only"
                                        checked={formData.showInMenu}
                                        onChange={handleChange}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.showInMenu ? 'bg-[#5CAF90]' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-all ${formData.showInMenu ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Show in Menu</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="showInHome"
                                        className="sr-only"
                                        checked={formData.showInHome}
                                        onChange={handleChange}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.showInHome ? 'bg-[#5CAF90]' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-all ${formData.showInHome ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Show on Homepage</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const CategoryForm = () => {
    return (
        <Suspense fallback={<div className="p-20 text-center text-[#5CAF90]">Initializing category form...</div>}>
            <CategoryFormInner />
        </Suspense>
    );
};

export default CategoryForm;
