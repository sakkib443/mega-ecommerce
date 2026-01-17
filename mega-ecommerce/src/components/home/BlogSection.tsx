"use client";

import React from 'react';
import Link from 'next/link';

const blogPosts = [
    {
        id: 1,
        title: "Aliquam tincidunt mauris eurisus",
        author: "John Doe",
        date: "03.05.2021",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/1.jpg",
        href: "/blog/1"
    },
    {
        id: 2,
        title: "Cras ornare tristique elit",
        author: "John Doe",
        date: "03.05.2021",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg",
        href: "/blog/2"
    },
    {
        id: 3,
        title: "Vivamus vestibulum ntulla nec ante",
        author: "John Doe",
        date: "03.05.2021",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/3.jpg",
        href: "/blog/3"
    },
    {
        id: 4,
        title: "Fusce lacinia arcuet nulla",
        author: "John Doe",
        date: "03.05.2021",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/4.jpg",
        href: "/blog/4"
    }
];

const BlogSection: React.FC = () => {
    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            {/* Header - Left Aligned */}
            <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4'>
                <div className='text-left'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>From Our Blog</h2>
                    <p className='text-gray-500 font-medium'>Latest news, trends and stories from our experts</p>
                </div>
                <Link
                    href="/blog"
                    className='text-[var(--color-primary)] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-all border-b-2 border-transparent hover:border-[var(--color-primary)] pb-1 w-fit'
                >
                    View All Articles <span className='text-lg'>→</span>
                </Link>
            </div>

            {/* Blogs Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                {blogPosts.map((post) => (
                    <div key={post.id} className='group'>
                        {/* Image */}
                        <Link href={post.href}>
                            <div className='relative aspect-[16/10] overflow-hidden rounded-xl mb-5 shadow-sm'>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                                />
                                <div className='absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500'></div>
                            </div>
                        </Link>

                        {/* Content */}
                        <div className='text-left'>
                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                by <span className='text-gray-900'>{post.author}</span> • {post.date}
                            </p>
                            <Link href={post.href}>
                                <h3 className='text-gray-900 font-bold text-[18px] mb-4 leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors'>
                                    {post.title}
                                </h3>
                            </Link>
                            <Link
                                href={post.href}
                                className='inline-flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-[var(--color-primary)] transition-all uppercase tracking-wider'
                            >
                                Read More <span className='text-sm transition-transform group-hover:translate-x-1'>→</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogSection;
