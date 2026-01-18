"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import {
    FiZap,
    FiPercent,
    FiCopy,
    FiCheckCircle,
    FiArrowRight,
    FiClock,
    FiStar,
    FiGift,
    FiAward
} from 'react-icons/fi';

const flashProducts = [
    { id: 1, name: 'Floral Summer Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-1.jpg', price: 45.00, originalPrice: 65.00, rating: 5, reviews: 12, category: 'Fashion' },
    { id: 2, name: 'Elegant Evening Gown', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-2.jpg', price: 120.00, originalPrice: 150.00, discount: 20, rating: 5, reviews: 8, category: 'Fashion' },
    { id: 11, name: 'Premium Leather Backpack', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-2.jpg', price: 85.00, originalPrice: 110.00, discount: 22, rating: 5, reviews: 24, category: 'Accessories' },
    { id: 14, name: 'Minimalist Black Cap', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-1.jpg', price: 18.00, originalPrice: 25.00, discount: 28, rating: 4.2, reviews: 18, category: 'Accessories' },
];

const promoCards = [
    {
        title: "Winter Collection",
        discount: "40% OFF",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/banners/2.jpg",
        color: "bg-black"
    },
    {
        title: "Tech Innovation",
        discount: "UP TO $200",
        image: "https://portotheme.com/html/wolmart/assets/images/demos/demo1/banners/3.jpg",
        color: "bg-[var(--color-primary)]"
    }
];

const vouchers = [
    { code: 'MEGA2024', label: 'Storewide', value: '20% OFF', color: 'indigo' },
    { code: 'FREESHIP', label: 'Delivery', value: 'FREE', color: 'emerald' },
    { code: 'WELCOME', label: 'New User', value: '$50 OFF', color: 'rose' },
];

export default function SpecialOffersPage() {
    const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 0 });
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-20 overflow-x-hidden">
            {/* Minimalist Hero Section */}
            <section className="relative pt-10 md:pt-20 px-4 mb-20">
                <div className="container mx-auto">
                    <div className="bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-10 md:p-20 flex flex-col justify-center relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="w-12 h-0.5 bg-[var(--color-primary)]"></span>
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-400">Limited Edition</span>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.9] mb-8 tracking-tighter">
                                    EXCLUSIVE <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 font-outline-2">OFFERS</span>
                                </h1>
                                <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 max-w-md leading-relaxed">
                                    Curated deals for those who settle for nothing but the best. Experience luxury shopping at its finest.
                                </p>

                                <div className="flex flex-wrap gap-8 items-center">
                                    <Link href="/shop" className="group bg-gray-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all flex items-center gap-3 shadow-2xl">
                                        Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs font-black text-gray-400">
                                            <span className="text-gray-900">12k+</span> Happy Shoppers
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-[400px] lg:h-auto overflow-hidden">
                                <img
                                    src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/banners/1.jpg"
                                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3000ms]"
                                    alt="Hero"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>

                                {/* Float Tags */}
                                <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] animate-bounce-slow">
                                    <div className="text-[var(--color-primary)] text-3xl font-black mb-1">60%</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white">Daily Flash</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voucher Grid: Modern Minimalist */}
            <section className="container mx-auto px-4 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {vouchers.map((v) => (
                        <div key={v.code} className="group relative bg-white border border-gray-100 p-8 rounded-[40px] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] transition-all overflow-hidden">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{v.label}</p>
                                    <h3 className="text-4xl font-black text-gray-900">{v.value}</h3>
                                </div>
                                <div className={`w-12 h-12 bg-${v.color}-50 text-${v.color}-500 rounded-2xl flex items-center justify-center`}>
                                    <FiGift size={24} />
                                </div>
                            </div>

                            <div className="relative mt-auto">
                                <div className="bg-gray-50 border border-gray-100 border-dashed rounded-2xl p-4 flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-400 tracking-widest">{v.code}</span>
                                    <button
                                        onClick={() => copyCode(v.code)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] hover:opacity-70 transition-opacity flex items-center gap-2"
                                    >
                                        {copiedCode === v.code ? <><FiCheckCircle /> Copied</> : <><FiCopy /> Copy</>}
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Cutouts */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#fcfcfc] border border-gray-100 rounded-full translate-y-[20px]"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#fcfcfc] border border-gray-100 rounded-full translate-y-[20px]"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Flash Deals: Modern Layout */}
            <section className="container mx-auto px-4 mb-32">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">FLASH DEALS</h2>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Ending Soon</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {[
                            { val: timeLeft.h, unit: 'H' },
                            { val: timeLeft.m, unit: 'M' },
                            { val: timeLeft.s, unit: 'S' }
                        ].map(t => (
                            <div key={t.unit} className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-gray-900">
                                    {t.val.toString().padStart(2, '0')}
                                </div>
                                <span className="text-[10px] font-black text-gray-400 mt-2">{t.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {flashProducts.map(product => (
                        <div key={product.id} className="animate-slideUp" style={{ animationDelay: `${product.id * 100}ms` }}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Editorial Showcase */}
            <section className="container mx-auto px-4 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {promoCards.map((promo, idx) => (
                        <div key={idx} className="group relative h-[600px] rounded-[64px] overflow-hidden">
                            <img
                                src={promo.image}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                                alt={promo.title}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700"></div>
                            <div className="absolute inset-0 p-12 md:p-20 flex flex-col justify-end text-white">
                                <span className="text-xs font-black uppercase tracking-[0.4em] text-white/70 mb-4">{promo.discount}</span>
                                <h3 className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] tracking-tighter">{promo.title}</h3>
                                <Link
                                    href="/shop"
                                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all transform group-hover:translate-x-2"
                                >
                                    <FiArrowRight size={24} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="container mx-auto px-4">
                <div className="bg-white border border-gray-100 rounded-[48px] p-10 md:p-20 grid grid-cols-2 md:grid-cols-4 gap-10">
                    {[
                        { icon: <FiAward size={32} />, label: "Quality First", desc: "Highest standards" },
                        { icon: <FiZap size={32} />, label: "Express Shipping", desc: "Fast delivery" },
                        { icon: <FiClock size={32} />, label: "24/7 Support", desc: "Expert help" },
                        { icon: <FiStar size={32} />, label: "Top Rated", desc: "99% satisfaction" }
                    ].map((badge, i) => (
                        <div key={i} className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-all mb-6">
                                {badge.icon}
                            </div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">{badge.label}</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">{badge.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
                .font-outline-2 {
                    -webkit-text-stroke: 1px var(--color-primary);
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
