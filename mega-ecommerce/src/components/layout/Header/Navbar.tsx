"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiChevronDown, FiZap } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Shop Now', href: '/shop' },
        { label: 'Special Offers', href: '/offers' },
        { label: 'Our Blog', href: '/blog' },
        { label: 'Contact Us', href: '/contact' },
    ];

    return (
        <div className='bg-white border-b border-gray-100 shadow-sm'>
            <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16'>
                <div className='flex justify-between items-center h-14'>
                    {/* Category Selector */}
                    <div className="hidden lg:flex items-center w-72 h-full">
                        <button className="bg-[var(--color-primary)] text-white w-full h-full px-6 flex items-center gap-3 font-bold text-sm tracking-wide">
                            <BiCategory size={20} />
                            BROWSE CATEGORIES
                            <FiChevronDown className="ml-auto" size={16} />
                        </button>
                    </div>    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center gap-10 h-full'>
                        {navLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.href}
                                className={`text-[14px] font-medium transition-all hover:text-[var(--color-primary)] relative py-4 ${isActive(link.href)
                                    ? 'text-[var(--color-primary)] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-primary)]'
                                    : 'text-gray-700'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Special Deal Button */}
                    <Link href="/offers" className='hidden lg:flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm animate-pulse cursor-pointer group'>
                        <FiZap size={18} />
                        <span className="group-hover:underline">BLACK FRIDAY: UP TO 80% OFF!</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className='md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-all'
                    >
                        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className='md:hidden absolute left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-50 animate-slideDown'>
                        <div className='flex flex-col p-4 gap-1'>
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-md text-sm font-semibold transition-all ${isActive(link.href) ? 'bg-gray-50 text-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
