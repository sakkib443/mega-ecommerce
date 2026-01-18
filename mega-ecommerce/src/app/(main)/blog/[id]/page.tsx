"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    FiCalendar,
    FiUser,
    FiMessageSquare,
    FiChevronRight,
    FiFacebook,
    FiTwitter,
    FiLinkedin,
    FiInstagram,
    FiSearch,
    FiCornerDownRight,
    FiClock
} from 'react-icons/fi';

const blogPosts = [
    {
        id: 1,
        title: "Aliquam tincidunt mauris eurisus",
        author: "John Doe",
        date: "03.05.2023",
        readTime: "8 min read",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/1.jpg",
        category: "Fashion",
        commentsCount: 12,
        content: `
            <p class="text-xl text-gray-600 mb-8 leading-relaxed font-normal">Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
            
            <h3 class="text-2xl font-black text-gray-900 mb-6 mt-10">The Importance of Modern Fashion</h3>
            <p class="mb-6 leading-loose">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>
            
            <div class="my-10 grid grid-cols-2 gap-4">
                <img src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg" alt="Gallery" class="rounded-2xl shadow-sm" />
                <img src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/3.jpg" alt="Gallery" class="rounded-2xl shadow-sm" />
            </div>

            <blockquote class="relative z-10 p-8 my-10 bg-gray-50 rounded-3xl overflow-hidden">
                <span class="absolute top-0 left-0 text-[120px] leading-none text-gray-200 -z-10 select-none">"</span>
                <p class="text-xl font-bold text-gray-800 italic relative z-20">
                    "Fashion is not something that exists in dresses only. Fashion is in the sky, in the street, fashion has to do with ideas, the way we live, what is happening."
                </p>
                <cite class="block mt-4 text-sm font-black text-[var(--color-primary)] uppercase tracking-widest not-italic">— Coco Chanel</cite>
            </blockquote>
            
            <p class="mb-6 leading-loose">Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
            
            <ul class="space-y-4 my-8">
                <li class="flex items-center gap-3 font-bold text-gray-800">
                    <span class="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs">1</span>
                    Directly in your inbox every morning.
                </li>
                <li class="flex items-center gap-3 font-bold text-gray-800">
                    <span class="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs">2</span>
                    Curated content by our best experts.
                </li>
                <li class="flex items-center gap-3 font-bold text-gray-800">
                    <span class="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs">3</span>
                    Exclusive deals for our subscribers.
                </li>
            </ul>
        `
    }
];

const comments = [
    {
        id: 1,
        author: "Sarah Johnson",
        date: "May 15, 2023",
        text: "Great article! This really helped me understand the current trends in the fashion industry.",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        id: 2,
        author: "Mark Spencer",
        date: "May 16, 2023",
        text: "I love the Coco Chanel quote. It's so true that fashion is more than just clothes.",
        avatar: "https://i.pravatar.cc/150?u=mark"
    }
];

const recentPosts = [
    {
        id: 2,
        title: "Cras ornare tristique elit",
        date: "May 14, 2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg"
    },
    {
        id: 3,
        title: "Vivamus vestibulum ntulla nec ante",
        date: "May 12, 2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/3.jpg"
    },
    {
        id: 4,
        title: "Fusce lacinia arcuet nulla",
        date: "May 10, 2023",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/4.jpg"
    }
];

export default function BlogPostPage() {
    const { id } = useParams();
    const post = blogPosts[0];
    const [commentText, setCommentText] = useState('');

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Page Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100 py-10 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                        <FiChevronRight size={14} className="text-gray-300" />
                        <Link href="/blog" className="hover:text-[var(--color-primary)] transition-colors">Blog</Link>
                        <FiChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><FiUser className="text-[var(--color-primary)]" /> {post.author}</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><FiCalendar className="text-[var(--color-primary)]" /> {post.date}</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><FiClock className="text-[var(--color-primary)]" /> {post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiFacebook size={18} /></button>
                            <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"><FiTwitter size={18} /></button>
                            <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white transition-all shadow-sm"><FiLinkedin size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Area */}
                    <div className="flex-1 max-w-4xl mx-auto lg:mx-0">
                        <article className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 mb-12 animate-fadeIn">
                            {/* Featured Image */}
                            <div className="aspect-[21/10] relative overflow-hidden group">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute top-8 left-8">
                                    <span className="bg-[var(--color-primary)] text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="p-8 md:p-16">
                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-10 leading-[1.1] tracking-tight">
                                    {post.title}
                                </h1>

                                <div
                                    className="prose prose-lg max-w-none text-gray-600 font-medium leading-[1.8]"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Tags Area */}
                                <div className="mt-16 pt-10 border-t border-gray-50 flex flex-wrap gap-3">
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] w-full mb-2">Post Tags:</span>
                                    {['Fashion', 'Lifestyle', 'Shopping', 'Trends', 'E-commerce'].map(tag => (
                                        <span key={tag} className="text-xs bg-gray-50 text-gray-400 font-bold px-4 py-2 rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer">#{tag}</span>
                                    ))}
                                </div>

                                {/* Author Card */}
                                <div className="mt-16 bg-gray-900 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 text-white group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0 border-4 border-gray-800 shadow-2xl group-hover:border-[var(--color-primary)] transition-colors duration-500">
                                        <img src="https://i.pravatar.cc/150?u=john" alt="Author" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                            <div>
                                                <h4 className="text-2xl font-black">{post.author}</h4>
                                                <p className="text-[var(--color-primary)] text-xs font-black uppercase tracking-widest mt-1">Senior Content Strategist</p>
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all"><FiFacebook size={14} /></button>
                                                <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all"><FiTwitter size={14} /></button>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Navigation Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 px-4">
                            <Link href="/blog/1" className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-[var(--color-primary)] transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shrink-0">
                                    <FiChevronRight className="rotate-180" size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previous</span>
                                    <h5 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">How to choose the right accessories</h5>
                                </div>
                            </Link>
                            <Link href="/blog/1" className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-end gap-6 text-right group hover:border-[var(--color-primary)] transition-all">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Post</span>
                                    <h5 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">Top 10 Trends for this season</h5>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shrink-0">
                                    <FiChevronRight size={24} />
                                </div>
                            </Link>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-[40px] p-8 md:p-16 border border-gray-100 shadow-sm mb-12">
                            <h3 className="text-3xl font-black text-gray-900 mb-12 flex items-center gap-3">
                                Comments <span className="text-lg bg-gray-50 px-4 py-1.5 rounded-2xl text-gray-400">{post.commentsCount}</span>
                            </h3>

                            <div className="space-y-12 mb-16">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-6 group">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-4 ring-gray-50">
                                            <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-black text-gray-900">{comment.author}</h5>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm leading-relaxed font-medium mb-4">{comment.text}</p>
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] hover:opacity-70 transition-all">
                                                <FiCornerDownRight /> Reply
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-12 border-t border-gray-50">
                                <h3 className="text-2xl font-black text-gray-900 mb-8">Leave a Reply</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" placeholder="Your Name" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
                                        <input type="email" placeholder="Your Email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
                                    </div>
                                    <textarea
                                        rows={6}
                                        placeholder="Write your comment here..."
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    ></textarea>
                                    <button className="bg-gray-900 text-white font-black px-10 py-5 rounded-[20px] text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl">
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-96 space-y-10">
                        {/* Search */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.25em] mb-6">Search Post</h4>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Keywords..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                                />
                                <button className="absolute right-2 top-2 bottom-2 w-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-[var(--color-primary)] transition-all">
                                    <FiSearch size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Recent Posts */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.25em] mb-8">Trending Articles</h4>
                            <div className="space-y-8">
                                {recentPosts.map((rPost) => (
                                    <Link key={rPost.id} href={`/blog/${rPost.id}`} className="flex gap-5 group">
                                        <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                                            <img src={rPost.image} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h5 className="text-[13px] font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug mb-2">
                                                {rPost.title}
                                            </h5>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rPost.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.25em] mb-6">Categories</h4>
                            <div className="space-y-3">
                                {['Fashion', 'Lifestyle', 'Travel', 'Shopping', 'Technology'].map(cat => (
                                    <Link key={cat} href="/blog" className="flex items-center justify-between group p-3 rounded-xl hover:bg-gray-50 transition-all">
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-widest">{cat}</span>
                                        <FiChevronRight className="text-gray-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Sidebar */}
                        <div className="bg-[var(--color-primary)] rounded-[32px] p-10 relative overflow-hidden group shadow-2xl">
                            <h4 className="text-white text-2xl font-black mb-4 relative z-10">Never miss a story.</h4>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-8 relative z-10 leading-relaxed">Get the best stories delivered directly to your inbox every week.</p>
                            <div className="relative z-10 space-y-3">
                                <input type="email" placeholder="Email address..." className="w-full bg-white/20 border border-white/20 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all" />
                                <button className="w-full bg-white text-[var(--color-primary)] font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl">
                                    Subscribe Now
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
