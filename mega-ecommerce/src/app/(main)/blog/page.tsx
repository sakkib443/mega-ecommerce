"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiChevronRight, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';

const blogPosts = [
    {
        id: 1,
        title: "Aliquam tincidunt mauris eurisus",
        author: "John Doe",
        date: "03.05.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/1.jpg",
        category: "Fashion",
        comments: 12,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/1"
    },
    {
        id: 2,
        title: "Cras ornare tristique elit",
        author: "John Doe",
        date: "14.05.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg",
        category: "Lifestyle",
        comments: 8,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/2"
    },
    {
        id: 3,
        title: "Vivamus vestibulum ntulla nec ante",
        author: "John Doe",
        date: "22.05.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/3.jpg",
        category: "Shopping",
        comments: 5,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/3"
    },
    {
        id: 4,
        title: "Fusce lacinia arcuet nulla",
        author: "John Doe",
        date: "04.06.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/4.jpg",
        category: "Trends",
        comments: 15,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/4"
    },
    {
        id: 5,
        title: "Pellentesque habitant morbi tristique",
        author: "John Doe",
        date: "12.06.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/1.jpg",
        category: "Fashion",
        comments: 3,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/5"
    },
    {
        id: 6,
        title: "Vestibulum ante ipsum primis",
        author: "John Doe",
        date: "20.06.2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg",
        category: "Lifestyle",
        comments: 21,
        excerpt: "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.",
        href: "/blog/6"
    }
];

const categories = [
    { name: "Fashion", count: 12 },
    { name: "Lifestyle", count: 8 },
    { name: "Shopping", count: 15 },
    { name: "Trends", count: 10 },
    { name: "Entertainment", count: 7 },
];

const recentPosts = blogPosts.slice(0, 3);

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb / Page Header */}
            <div className="bg-white border-b border-gray-100 py-12">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">OUR BLOG</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                        <FiChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-900">Blog</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Area */}
                    <div className="flex-1 order-2 lg:order-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {blogPosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                    {/* Image Container */}
                                    <Link href={post.href} className="block relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                {post.category}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Content Area */}
                                    <div className="p-8">
                                        <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5"><FiCalendar className="text-[var(--color-primary)]" /> {post.date}</span>
                                            <span className="flex items-center gap-1.5"><FiMessageSquare className="text-[var(--color-primary)]" /> {post.comments} Comments</span>
                                        </div>

                                        <Link href={post.href}>
                                            <h2 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={post.href}
                                            className="inline-flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest group/link"
                                        >
                                            Continue Reading
                                            <span className="w-8 h-px bg-gray-200 group-hover/link:w-12 group-hover/link:bg-[var(--color-primary)] transition-all duration-300"></span>
                                            <FiChevronRight className="text-gray-400 group-hover/link:text-[var(--color-primary)] group-hover/link:translate-x-1 transition-all" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-16 flex justify-center items-center gap-3">
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">1</button>
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">2</button>
                            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">3</button>
                            <button className="px-6 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all">NEXT <FiChevronRight /></button>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 order-1 lg:order-2 space-y-10">
                        {/* Search Widget */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Search Blog</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    className="w-full bg-gray-50 border-none rounded-xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="absolute right-2 top-2 bottom-2 w-10 bg-[var(--color-primary)] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FiSearch size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Categories Widget */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Categories</h3>
                            <div className="space-y-4">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.name}
                                        href={`/blog/category/${cat.name.toLowerCase()}`}
                                        className="flex items-center justify-between group"
                                    >
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[var(--color-primary)] transition-colors"></span>
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md group-hover:text-white group-hover:bg-[var(--color-primary)] transition-all">
                                            {cat.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Posts Widget */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Recent Posts</h3>
                            <div className="space-y-6">
                                {recentPosts.map((post) => (
                                    <Link key={post.id} href={post.href} className="flex gap-4 group">
                                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight mb-1">
                                                {post.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{post.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter/Promo Widget */}
                        <div className="bg-[var(--color-primary)] p-8 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-white text-xl font-black mb-2">Join Our Newsletter</h3>
                                <p className="text-white/80 text-xs font-medium mb-6">Get latest updates and news directly in your inbox.</p>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-white/20 border border-white/30 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/60 outline-none focus:bg-white/30 transition-all mb-3"
                                />
                                <button className="w-full bg-white text-[var(--color-primary)] font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                                    Subscribe Now
                                </button>
                            </div>
                            {/* Decorative bubbles */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
