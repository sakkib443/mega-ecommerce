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
    FiDollarSign,
    FiTag,
    FiShield,
    FiTruck,
    FiList,
    FiGlobe,
    FiTrash2,
    FiBox,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import {
    useCreateProductMutation,
    useUpdateProductMutation,
    useGetProductByIdQuery
} from '@/redux/api/productApi';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { toast } from 'react-hot-toast';

const ProductFormInner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditing = !!productId;

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const { data: productToEdit, isLoading: isFetching } = useGetProductByIdQuery(productId, { skip: !isEditing });
    const { data: categoriesData } = useGetCategoriesQuery({});

    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        price: 0,
        comparePrice: 0,
        costPrice: 0,
        sku: '',
        quantity: 0,
        lowStockThreshold: 5,
        category: '',
        subCategory: '',
        brand: '',
        status: 'active',
        visibility: 'visible',
        isFeatured: false,
        isNewProduct: true,
        isOnSale: false,
        thumbnail: '',
        images: [],
        tags: [],
        highlights: [],
        specifications: [],
        seo: {
            metaTitle: '',
            metaDescription: '',
            metaKeywords: []
        },
        warranty: {
            hasWarranty: false,
            duration: 0,
            durationUnit: 'months',
            type: 'manufacturer'
        },
        shipping: {
            freeShipping: false,
            shippingCost: 0,
            estimatedDays: 3
        }
    });

    // Populate form if editing
    useEffect(() => {
        if (isEditing && productToEdit?.data) {
            const prod = productToEdit.data;
            setFormData({
                ...formData,
                ...prod,
                category: prod.category?._id || prod.category,
                subCategory: prod.subCategory?._id || prod.subCategory,
                seo: prod.seo || formData.seo,
                warranty: prod.warranty || formData.warranty,
                shipping: prod.shipping || formData.shipping,
                specifications: prod.specifications || []
            });
        }
    }, [isEditing, productToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
                }
            }));
        } else {
            setFormData((prev: any) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }));
        }

        if (name === 'name' && !isEditing) {
            setFormData((prev: any) => ({
                ...prev,
                slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }));
        }
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        setFormData((prev: any) => ({ ...prev, tags }));
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const urls = e.target.value.split('\n').map(url => url.trim()).filter(url => url !== '');
        setFormData((prev: any) => ({ ...prev, images: urls }));
    };

    const handleSpecChange = (index: number, field: string, value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecification = () => {
        setFormData((prev: any) => ({
            ...prev,
            specifications: [...prev.specifications, { group: 'General', name: '', value: '' }]
        }));
    };

    const removeSpecification = (index: number) => {
        const newSpecs = [...formData.specifications];
        newSpecs.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, specifications: newSpecs }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category) return toast.error('Please select a category');

        try {
            if (isEditing) {
                await updateProduct({ id: productId, data: formData }).unwrap();
                toast.success('Product updated successfully');
            } else {
                await createProduct(formData).unwrap();
                toast.success('Product created successfully');
            }
            router.push('/dashboard/admin/products');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Something went wrong');
        }
    };

    if (isEditing && isFetching) return <div className="p-20 text-center text-[#4F46E5]">Loading product data...</div>;

    const categories = categoriesData?.data || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md border border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/products" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-400 transition-all hover:text-gray-600">
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Create Product'}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <p className="text-sm text-gray-500 capitalize">{formData.status} Mode</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => router.push('/dashboard/admin/products')} className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 rounded-md font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        Discard
                    </button>
                    <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-[#4F46E5] text-white rounded-md font-semibold hover:bg-[#4338CA] transition-all shadow-md disabled:opacity-50">
                        <FiSave size={20} />
                        {isCreating || isUpdating ? 'Processing...' : (isEditing ? 'Update Product' : 'Release Product')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: 8 Columns */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                                <FiInfo size={22} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Product Title *</label>
                                <input type="text" name="name" required placeholder="Enter product name (e.g. High-end Smartphone)" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/10 transition-all text-sm" value={formData.name} onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Product Slug</label>
                                    <input type="text" name="slug" placeholder="product-url-slug" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-xs font-mono" value={formData.slug} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Brand Name</label>
                                    <input type="text" name="brand" placeholder="e.g. Nike, Apple" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-sm" value={formData.brand} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Product Description</label>
                                <textarea name="description" rows={12} placeholder="Write a detailed description about the product features, benefits, etc." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-sm leading-relaxed" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-md bg-green-50 flex items-center justify-center text-green-600">
                                <FiDollarSign size={22} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Pricing & Inventory</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Regular Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                                    <input type="number" name="price" placeholder="0.00" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-base font-bold" value={formData.price} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sale Price (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                                    <input type="number" name="comparePrice" placeholder="0.00" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-base font-bold text-red-600" value={formData.comparePrice} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Current Stock</label>
                                <input type="number" name="quantity" placeholder="0" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-base font-bold text-[#4F46E5]" value={formData.quantity} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">SKU Number</label>
                                <input type="text" name="sku" placeholder="e.g. PROD-1024" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-sm font-mono" value={formData.sku} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Low Stock Alert Level</label>
                                <input type="number" name="lowStockThreshold" placeholder="5" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-[#4F46E5] transition-all text-sm" value={formData.lowStockThreshold} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                                    <FiList size={22} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Advanced Specifications</h2>
                            </div>
                            <button type="button" onClick={addSpecification} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-md text-sm font-bold hover:bg-purple-600 hover:text-white transition-all border border-purple-100">
                                <FiPlus /> Add Row
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.specifications.map((spec: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50/50 rounded-md border border-gray-100 relative group">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Module/Group</label>
                                        <input type="text" placeholder="e.g. Battery" className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-purple-300 bg-white" value={spec.group} onChange={(e) => handleSpecChange(idx, 'group', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Attribute Name</label>
                                        <input type="text" placeholder="e.g. Capacity" className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-purple-300 bg-white" value={spec.name} onChange={(e) => handleSpecChange(idx, 'name', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5 relative">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Value</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="e.g. 5000 mAh" className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-purple-300 bg-white" value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} />
                                            <button onClick={() => removeSpecification(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.specifications.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-md bg-gray-50/30">
                                    <p className="text-gray-400 text-sm">No specifications. Click 'Add Row' to define technical details.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Optimizations */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
                                <FiGlobe size={22} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Search Engine Optimization (SEO)</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Meta Title</label>
                                <input type="text" name="seo.metaTitle" placeholder="SEO optimized title for search engines" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md outline-none focus:border-orange-500 transition-all text-sm" value={formData.seo.metaTitle} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                                <textarea name="seo.metaDescription" rows={4} placeholder="Detailed SEO description to improve search rank..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md outline-none focus:border-orange-500 transition-all text-sm leading-normal" value={formData.seo.metaDescription} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: 4 Columns (Fixed Layout) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Media Assets */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiImage className="text-blue-500" /> Media Assets
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Master Thumbnail URL</label>
                                <input type="text" name="thumbnail" placeholder="Paste image URL here" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-xs outline-none focus:border-blue-400 transition-all font-mono" value={formData.thumbnail} onChange={handleChange} />
                            </div>
                            <div className="mt-2 aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50/50 relative group">
                                {formData.thumbnail ? (
                                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2 border-2 border-dashed border-gray-200 rounded-md">
                                        <FiImage size={40} />
                                        <p className="text-[10px] font-bold">PREVIEW BOX</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Gallery Images (One per line)</label>
                                <textarea name="images" rows={4} placeholder="Image URL 1&#10;Image URL 2..." className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md text-xs outline-none focus:border-blue-400 transition-all font-mono" value={formData.images.join('\n')} onChange={handleImagesChange}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiTag className="text-indigo-500" /> Store Categorization
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Primary Category *</label>
                                <select name="category" required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-semibold outline-none focus:border-indigo-400 transition-all cursor-pointer" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Categories</option>
                                    {categories.map((cat: any) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Search Tags</label>
                                <input type="text" placeholder="e.g. fashion, smartphone, summer" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-xs outline-none focus:border-indigo-400 transition-all" value={formData.tags.join(', ')} onChange={handleTagsChange} />
                            </div>
                        </div>
                    </div>

                    {/* Status & Highlights */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiSettings className="text-orange-500" /> Visibility & Promotion
                        </h3>
                        <div className="space-y-3">
                            {[
                                { key: 'isFeatured', label: 'Featured Product', color: 'bg-yellow-500' },
                                { key: 'isOnSale', label: 'On Sale Mode', color: 'bg-rose-500' },
                                { key: 'isNewProduct', label: 'New Arrival Badge', color: 'bg-emerald-500' }
                            ].map(item => (
                                <label key={item.key} className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-md transition-all border border-gray-100 cursor-pointer group">
                                    <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900">{item.label}</span>
                                    <div className="relative">
                                        <input type="checkbox" name={item.key} className="sr-only" checked={formData[item.key]} onChange={handleChange} />
                                        <div className={`w-11 h-6 rounded-full transition-colors ${formData[item.key] ? item.color : 'bg-gray-200'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${formData[item.key] ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="pt-2">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-3 pl-1">Publish Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['active', 'draft'].map(s => (
                                    <button key={s} type="button" onClick={() => setFormData((prev: any) => ({ ...prev, status: s }))} className={`py-2 rounded-md text-xs font-bold uppercase transition-all ${formData.status === s ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Warranty */}
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm space-y-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiShield className="text-emerald-500" /> Protection & Logistics
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-3 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="shipping.freeShipping" className="w-5 h-5 accent-emerald-500" checked={formData.shipping.freeShipping} onChange={handleChange} />
                                    <span className="text-sm font-bold text-gray-700">Free Shipping</span>
                                </label>
                                {!formData.shipping.freeShipping && (
                                    <div className="pt-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase pl-1">Shipping Cost (৳)</label>
                                        <input type="number" name="shipping.shippingCost" placeholder="0" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm mt-1 outline-none focus:border-emerald-300" value={formData.shipping.shippingCost} onChange={handleChange} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="warranty.hasWarranty" className="w-5 h-5 accent-[#4F46E5]" checked={formData.warranty.hasWarranty} onChange={handleChange} />
                                    <span className="text-sm font-bold text-gray-700">Full Warranty</span>
                                </label>
                                {formData.warranty.hasWarranty && (
                                    <div className="flex gap-2 pt-1">
                                        <input type="number" name="warranty.duration" placeholder="12" className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-blue-300" value={formData.warranty.duration} onChange={handleChange} />
                                        <select name="warranty.durationUnit" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-semibold outline-none focus:border-blue-300" value={formData.warranty.durationUnit} onChange={handleChange}>
                                            <option value="days">Days</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductForm = () => (
    <Suspense fallback={<div className="p-20 text-center text-[#4F46E5] font-bold animate-pulse">BOOTING PRODUCT ENGINE...</div>}>
        <ProductFormInner />
    </Suspense>
);

export default ProductForm;
