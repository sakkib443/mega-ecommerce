"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { FiFilter, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';

const demoProducts = [
    { id: 1, name: 'Floral Summer Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-1.jpg', price: 45.00, rating: 5, reviews: 12, category: 'Fashion' },
    { id: 2, name: 'Elegant Evening Gown', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-2.jpg', price: 120.00, originalPrice: 150.00, discount: 20, rating: 5, reviews: 8, category: 'Fashion' },
    { id: 3, name: 'Casual Denim Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-3.jpg', price: 35.00, rating: 4, reviews: 15, category: 'Fashion' },
    { id: 4, name: 'Bohemian Maxi Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-4.jpg', price: 55.00, rating: 4.5, reviews: 20, category: 'Fashion' },
    { id: 11, name: 'Premium Leather Backpack', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-2.jpg', price: 85.00, originalPrice: 110.00, discount: 22, rating: 5, reviews: 24, category: 'Accessories' },
    { id: 12, name: 'Modern White Sneakers', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-5.jpg', price: 65.00, rating: 4.8, reviews: 45, category: 'Shoes' },
    { id: 13, name: 'Navy Blue Cotton T-Shirt', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-10.jpg', price: 25.00, rating: 4.5, reviews: 32, category: 'Fashion' },
    { id: 14, name: 'Minimalist Black Cap', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-1.jpg', price: 18.00, originalPrice: 25.00, discount: 28, rating: 4.2, reviews: 18, category: 'Accessories' },
    { id: 7, name: 'Multi Functional Apple iPhone', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-3.jpg', price: 136.26, originalPrice: 145.90, discount: 7, rating: 5, reviews: 5, category: 'Electronics' },
    { id: 9, name: 'Smart LED Television', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-9.jpg', price: 450.00, originalPrice: 499.00, discount: 10, rating: 4, reviews: 9, category: 'Electronics' },
];

const categories = ['All', 'Fashion', 'Accessories', 'Shoes', 'Electronics', 'Home & Garden'];
const priceRanges = ['All', 'Under $50', '$50 - $100', '$100 - $200', 'Over $200'];

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Default Sorting');

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb / Page Header */}
            <div className="bg-white border-b border-gray-100 py-10">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">SHOP</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900">Shop</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-50">
                                <FiFilter className="text-[var(--color-primary)]" size={20} />
                                <h2 className="text-lg font-bold text-gray-900">FILTERS</h2>
                            </div>

                            {/* Categories Filter */}
                            <div className="mb-10">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`flex items-center justify-between w-full text-sm font-medium transition-all hover:text-[var(--color-primary)] ${selectedCategory === cat ? 'text-[var(--color-primary)]' : 'text-gray-500'
                                                }`}
                                        >
                                            {cat}
                                            <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-400">12</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-10">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5">Price Range</h3>
                                <div className="space-y-3">
                                    {priceRanges.map((range) => (
                                        <label key={range} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                                            <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{range}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Promo Banner in Sidebar */}
                            <div className="rounded-xl overflow-hidden relative aspect-[3/4] group">
                                <img
                                    src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/banners/4.jpg"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt="Promo"
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">New Season</p>
                                    <h4 className="text-white text-xl font-black mb-4 leading-tight">SALE UP TO<br />50% OFF</h4>
                                    <button className="bg-white text-gray-900 py-2 rounded font-bold text-xs hover:bg-[var(--color-primary)] hover:text-white transition-all uppercase">Shop Now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        {/* Control Bar */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                            <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                Showing <span className="text-gray-900 font-bold">1–10</span> of <span className="text-gray-900 font-bold">56</span> results
                            </p>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative group flex-1 md:flex-initial">
                                    <button className="flex items-center justify-between gap-10 w-full px-6 py-2.5 bg-gray-50 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                        {sortBy}
                                        <FiChevronDown />
                                    </button>
                                </div>
                                <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <button className="p-2.5 bg-white text-[var(--color-primary)] hover:bg-gray-50 transition-colors border-r border-gray-100">
                                        <FiGrid size={20} />
                                    </button>
                                    <button className="p-2.5 bg-white text-gray-400 hover:bg-gray-50 transition-colors">
                                        <FiList size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {demoProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-16 flex justify-center items-center gap-3">
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">1</button>
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">2</button>
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">3</button>
                            <button className="px-6 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">NEXT →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
