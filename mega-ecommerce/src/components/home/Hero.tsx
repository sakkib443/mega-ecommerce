"use client";

import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import {
    MdOutlineCheckroom,
    MdOutlineHome,
    MdOutlineDevices,
    MdOutlineChair,
    MdOutlineFace,
    MdOutlineCardGiftcard,
    MdOutlineSportsEsports,
    MdOutlineRestaurant,
    MdOutlinePhoneIphone,
    MdOutlineCameraAlt,
    MdOutlineHeadphones
} from 'react-icons/md';

const categories = [
    { name: 'Fashion', icon: MdOutlineCheckroom, href: '/shop?category=fashion' },
    { name: 'Home & Garden', icon: MdOutlineHome, href: '/shop?category=home' },
    { name: 'Electronics', icon: MdOutlineDevices, href: '/shop?category=electronics' },
    { name: 'Furniture', icon: MdOutlineChair, href: '/shop?category=furniture' },
    { name: 'Healthy & Beauty', icon: MdOutlineFace, href: '/shop?category=beauty' },
    { name: 'Gift Ideas', icon: MdOutlineCardGiftcard, href: '/shop?category=gifts' },
    { name: 'Toy & Games', icon: MdOutlineSportsEsports, href: '/shop?category=toys' },
    { name: 'Cooking', icon: MdOutlineRestaurant, href: '/shop?category=cooking' },
    { name: 'Smart Phones', icon: MdOutlinePhoneIphone, href: '/shop?category=phones' },
    { name: 'Cameras & Photo', icon: MdOutlineCameraAlt, href: '/shop?category=cameras' },
    { name: 'Accessories', icon: MdOutlineHeadphones, href: '/shop?category=accessories' },
];

const Hero: React.FC = () => {
    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16'>
            <div className='flex gap-0 leading-none'>
                {/* Left Sidebar - Categories (Aligned with Navbar w-72) */}
                <div className='hidden lg:block w-72 flex-shrink-0 bg-white border-x border-b border-gray-100'>
                    <div className='py-0'>
                        {categories.map((cat, index) => (
                            <Link
                                key={index}
                                href={cat.href}
                                className='group flex items-center justify-between px-6 py-[13.5px] text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0'
                            >
                                <div className='flex items-center gap-4'>
                                    <cat.icon size={18} className='text-gray-400 group-hover:text-[var(--color-primary)] transition-colors' />
                                    <span className='text-[13px] font-medium'>{cat.name}</span>
                                </div>
                                <FiChevronRight size={14} className='text-gray-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 outline-none' />
                            </Link>
                        ))}
                        <Link
                            href="/categories"
                            className='flex items-center gap-2 px-6 py-4 text-[var(--color-primary)] font-bold text-[12px] hover:bg-gray-50 uppercase tracking-wider'
                        >
                            View All Categories
                            <FiChevronRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Right Side - Hero Banner */}
                <div className='flex-1 lg:pl-8 py-8'>
                    <div
                        className='h-[510px] bg-[#f2f3f5] rounded-2xl overflow-hidden relative group'
                    >
                        {/* Decorative Gradient Overlay */}
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none'></div>

                        {/* Content */}
                        <div className='relative z-10 h-full flex flex-col md:flex-row items-center'>
                            {/* Left Text Content */}
                            <div className='flex-1 flex flex-col justify-center px-8 md:px-16 text-center md:text-left'>
                                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                                    <span className="w-10 h-[2px] bg-gray-400"></span>
                                    <p className='text-gray-500 text-sm font-bold uppercase tracking-[0.3em]'>Top Weekly Seller</p>
                                </div>
                                <h1 className='text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-2 leading-tight uppercase'>
                                    Trending Collection
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-10">
                                    <span className="bg-[#f5a623] text-white px-5 py-2 text-3xl md:text-4xl font-black italic transform -skew-x-12 shadow-lg">Roller</span>
                                    <span className="text-3xl md:text-4xl font-black text-gray-800 uppercase">-skate</span>
                                </div>
                                <Link
                                    href="/shop"
                                    className='inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 font-bold text-sm hover:bg-[var(--color-primary)] transition-all rounded-md w-fit shadow-xl group-hover:scale-105 duration-300 uppercase tracking-wider'
                                >
                                    Shop Now
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>

                            {/* Right Image Area */}
                            <div className='hidden md:flex items-center justify-center w-[45%] lg:w-[50%] h-full pr-8'>
                                <img
                                    src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/sliders/men.png"
                                    alt="Fashion"
                                    className='h-[95%] w-auto object-contain transform group-hover:scale-110 transition-transform duration-1000'
                                />
                            </div>
                        </div>

                        {/* Slider Dots */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                            <span className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full"></span>
                            <span className="w-10 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 cursor-pointer transition-all"></span>
                            <span className="w-10 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 cursor-pointer transition-all"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
