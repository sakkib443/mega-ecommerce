"use client";

import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

const TopHeader: React.FC = () => {
    return (
        <div className="bg-[#f8f8f8] border-b border-gray-200 py-2 hidden md:block">
            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 flex justify-between items-center">
                {/* Left Side: Contact Info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                        <FiPhone className="text-[var(--color-primary)]" size={14} />
                        <a href="tel:01753923093" className="hover:text-[var(--color-primary)] transition-all">01753923093</a>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                        <BsWhatsapp className="text-[var(--color-primary)]" size={14} />
                        <a href="https://wa.me/01322840808" className="hover:text-[var(--color-primary)] transition-all">01322840808</a>
                    </div>
                </div>

                {/* Right Side: Links & Social */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-[13px] text-gray-600 font-medium">
                        <a href="#" className="hover:text-[var(--color-primary)] transition-all">Track Order</a>
                        <a href="#" className="hover:text-[var(--color-primary)] transition-all">FAQ</a>
                        <a href="#" className="hover:text-[var(--color-primary)] transition-all border-l border-gray-300 pl-4 ml-2">English</a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                        {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                            <a key={i} href="#" className="hover:text-[var(--color-primary)] transition-all">
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;
