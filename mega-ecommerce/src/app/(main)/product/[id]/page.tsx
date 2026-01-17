"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle, FiPlay, FiTwitter, FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaStar, FaFacebookF, FaTwitter as FaTwitterIcon, FaPinterestP, FaInstagram as FaInstagramIcon } from 'react-icons/fa';
import ProductCard from '@/components/shared/ProductCard';

const relatedProducts = [
    { id: 1, name: 'Green Apple', image: 'https://images.unsplash.com/photo-1610397648930-471f81b80ad4?q=80&w=500&auto=format&fit=crop', price: 14.99, mrp: 20.99, rating: 5, reviews: 12, categoryName: 'Vegetables' },
    { id: 2, name: 'Fresh Cauliflower', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?q=80&w=500&auto=format&fit=crop', price: 12.00, mrp: 15.00, rating: 5, reviews: 8, categoryName: 'Vegetables' },
    { id: 3, name: 'Green Capsicum', image: 'https://images.unsplash.com/photo-1563513307168-a400c4216c8e?q=80&w=500&auto=format&fit=crop', price: 9.00, mrp: 12.00, rating: 5, reviews: 24, categoryName: 'Vegetables' },
    { id: 4, name: 'Green Chili', image: 'https://images.unsplash.com/photo-1588252395816-447a13f8bc07?q=80&w=500&auto=format&fit=crop', price: 6.00, mrp: 8.00, rating: 4.8, reviews: 45, categoryName: 'Vegetables' },
];

export default function ProductDetailsPage() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(5);
    const [activeTab, setActiveTab] = useState('descriptions');
    const [selectedImage, setSelectedImage] = useState(0);

    // Mock product data based on the image
    const product = {
        id: id,
        name: "Chinese Cabbage",
        price: 17.28,
        mrp: 48.00,
        discount: "64% Off",
        rating: 4,
        reviews: 4,
        sku: "2,51,594",
        category: "Vegetables",
        brand: {
            name: "farmery",
            logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0N-O913P-lFclmJvYjW5E8G9h4y-x67B7lA&s" // Placeholder
        },
        tags: ["Vegetables", "Healthy", "Chinese", "Cabbage", "Green Cabbage"],
        images: [
            "https://purepng.com/public/uploads/large/purepng.com-bok-choybok-choychinese-cabbagewhite-cabbage-1701527244243jppie.png",
            "https://purepng.com/public/uploads/large/purepng.com-bok-choybok-choychinese-cabbagewhite-cabbage-1701527244215reul0.png",
            "https://purepng.com/public/uploads/large/purepng.com-bok-choybok-choychinese-cabbagewhite-cabbage-17015272439810t7m8.png",
            "https://purepng.com/public/uploads/large/purepng.com-bok-choybok-choychinese-cabbagewhite-cabbage-1701527244192bvx4j.png"
        ],
        shortDescription: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec, ultrices et ipsum. Nulla varius magna a consequat pulvinar.",
        longDescription: "Sed commodo aliquam dui ac porta. Fusce ipsum felis, imperdiet at posuere ac, viverra at mauris. Maecenas tincidunt ligula a sem vestibulum pharetra. Maecenas auctor tortor lacus, nec laoreet nisi porttitor vel. Etiam tincidunt metus vel dui interdum sollicitudin. Mauris sem ante, vestibulum nec orci vitae, aliquam mollis lacus. Sed et condimentum arcu, id molestie tellus. Nulla facilisi. Nam scelerisque vitae justo a convallis. Morbi urna ipsum, placerat quis commodo quis, egestas elementum leo. Donec convallis mollis enim. Aliquam id mi quam. Phasellus nec fringilla elit."
    };

    const mainGreen = "#00B207";

    return (
        <div className="bg-white min-h-screen font-['Poppins']">
            {/* Breadcrumb - Optional but common */}
            <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                <Link href="/" className="hover:text-[#00B207]">🏠</Link>
                <span>&gt;</span>
                <Link href="/shop" className="hover:text-[#00B207]">Categories</Link>
                <span>&gt;</span>
                <Link href="/shop/vegetables" className="hover:text-[#00B207]">{product.category}</Link>
                <span>&gt;</span>
                <span className="text-[#00B207]">{product.name}</span>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* LEFT: Image Gallery */}
                    <div className="w-full lg:w-1/2 flex gap-4">
                        {/* Thumbnails */}
                        <div className="hidden md:flex flex-col gap-3">
                            <button className="text-gray-400 hover:text-gray-600 flex justify-center"><FiMinus className="rotate-90" /></button>
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-20 h-20 border rounded-lg cursor-pointer flex items-center justify-center p-2 transition-all ${selectedImage === idx ? 'border-[#00B207]' : 'border-gray-200'}`}
                                >
                                    <img src={img} alt="thumb" className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                            <button className="text-gray-400 hover:text-gray-600 flex justify-center"><FiPlus className="rotate-90" /></button>
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 border border-gray-100 rounded-xl flex items-center justify-center p-10 relative bg-white">
                            <img src={product.images[selectedImage]} alt={product.name} className="max-w-full max-h-[500px] object-contain" />
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="w-full lg:w-1/2">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-semibold text-gray-900">{product.name}</h1>
                            <span className="bg-[#EDF2EE] text-[#00B207] text-xs px-2.5 py-1 rounded font-medium">In Stock</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} size={14} className={i < product.rating ? 'text-[#FF8A00]' : 'text-gray-300'} />
                                ))}
                                <span className="text-gray-600 ml-1">{product.reviews} Review</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="text-gray-900 font-medium">SKU: <span className="text-gray-500 font-normal">{product.sku}</span></div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-gray-400 line-through text-xl">${product.mrp.toFixed(2)}</span>
                            <span className="text-[#2C742F] text-2xl font-semibold">${product.price.toFixed(2)}</span>
                            <span className="bg-[#EA43351A] text-[#EA4335] text-xs font-semibold px-2.5 py-1 rounded-full">{product.discount}</span>
                        </div>

                        <div className="border-y border-gray-100 py-6 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-900 font-medium">Brand:</span>
                                <div className="border border-gray-100 rounded px-3 py-1.5 grayscale opacity-70">
                                    <span className="text-xs font-bold text-gray-400 italic">farmery</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-900 font-medium">Share item:</span>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full bg-[#00B207] text-white flex items-center justify-center hover:opacity-90 transition-all"><FaFacebookF size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaTwitterIcon size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaPinterestP size={14} /></button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><FaInstagramIcon size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            {product.shortDescription}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-full"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-full"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <button className="flex-1 bg-[#00B207] text-white rounded-full h-12 flex items-center justify-center gap-3 font-semibold hover:bg-[#009606] transition-all shadow-md">
                                Add to Cart <FiShoppingCart />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-[#EDF2EE] text-[#00B207] flex items-center justify-center hover:bg-[#00B207] hover:text-white transition-all">
                                <FiHeart size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1.5">
                                <span className="text-gray-900 font-medium">Category:</span>
                                <span className="text-gray-500">{product.category}</span>
                            </div>
                            <div className="flex gap-1.5">
                                <span className="text-gray-900 font-medium">Tag:</span>
                                <span className="text-gray-500">{product.tags.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS SECTION */}
                <div className="mt-20">
                    <div className="flex justify-center border-b border-gray-100 gap-8 md:gap-16">
                        {['Descriptions', 'Additional Information', 'Customer Feedback'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                className={`pb-4 text-sm md:text-base font-medium transition-all relative ${activeTab === tab.toLowerCase().split(' ')[0] ? 'text-gray-900 border-b-2 border-[#00B207]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="py-12 flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-3/5">
                            <p className="text-gray-500 text-sm leading-7 mb-8">
                                {product.longDescription}
                            </p>
                            <p className="text-gray-500 text-sm leading-7 mb-8">
                                Nulla mauris tellus, feugiat quis pharetra sed, gravida ac dui. Sed iaculis, metus faucibus elementum tincidunt, turpis mi viverra velit, pellentesque tristique neque mi eget nulla. Proin luctus elementum neque et pharetra.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "100 g of fresh leaves provides.",
                                    "Aliquam ac est at augue volutpat elementum.",
                                    "Quisque nec enim eget sapien molestie.",
                                    "Proin convallis odio volutpat finibus posuere."
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-[#00B207] flex items-center justify-center text-white">
                                            <FiCheckCircle size={12} className="fill-white text-[#00B207]" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-500 text-sm leading-7 mt-8">
                                Cras et diam maximus, accumsan sapien et, sollicitudin velit. Nulla blandit eros non turpis lobortis iaculis at ut massa.
                            </p>
                        </div>

                        <div className="lg:w-2/5">
                            <div className="relative rounded-2xl overflow-hidden mb-6 h-64 md:h-80">
                                <img
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                                    className="w-full h-full object-cover"
                                    alt="video cover"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <button className="w-16 h-16 rounded-full bg-[#00B207] text-white flex items-center justify-center hover:scale-110 transition-transform">
                                        <FiPlay size={24} className="ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-gray-100 rounded-xl p-5 flex items-center gap-4">
                                    <div className="bg-[#EDF2EE] w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="text-[#00B207] text-lg font-bold">64%</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">Discount</div>
                                        <div className="text-xs text-gray-500">Save your money</div>
                                    </div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-5 flex items-center gap-4">
                                    <div className="bg-[#EDF2EE] w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="text-[#00B207] text-lg">🌿</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">100% Organic</div>
                                        <div className="text-xs text-gray-500">Free from pesticides</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RELATED PRODUCTS */}
                <div className="mt-20 pt-20 border-t border-gray-100">
                    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
