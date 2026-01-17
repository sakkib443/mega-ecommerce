"use client";

import React from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useAppDispatch } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToWishlist } from '@/redux/slices/wishlistSlice';

interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    mrp?: number;
    discount?: number | string;
    rating: number;
    reviews: number;
    categoryName?: string;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const dispatch = useAppDispatch();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            mrp: product.mrp || product.originalPrice || product.price,
            image: product.image,
            category: product.categoryName || 'General'
        }));
    };

    const handleAddToWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(addToWishlist({
            id: product.id,
            name: product.name,
            price: product.price,
            mrp: product.mrp || product.originalPrice || product.price,
            image: product.image,
            category: product.categoryName || 'General',
            rating: product.rating
        }));
    };

    const currentPrice = product.price;
    const oldPrice = product.mrp || product.originalPrice;
    const discountText = product.discount || (oldPrice ? `${Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}%` : null);

    return (
        <Link href={`/product/${product.id}`}>
            <div className='group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#00B207] transition-all duration-500 relative flex flex-col h-full'>
                {/* Image Container */}
                <div className='relative aspect-[4/3] bg-white overflow-hidden p-6'>
                    {/* Discount Badge */}
                    {discountText && (
                        <span className='absolute top-4 left-4 bg-[#EA4335] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase z-10'>
                            Sale {typeof discountText === 'number' ? `${discountText}%` : discountText}
                        </span>
                    )}

                    {/* Product Image */}
                    <div className='w-full h-full flex items-center justify-center'>
                        <img
                            src={product.image}
                            alt={product.name}
                            className='max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700'
                        />
                    </div>

                    {/* Hover Actions */}
                    <div className='absolute top-4 right-4 flex flex-col gap-2 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500'>
                        <button
                            onClick={handleAddToWishlist}
                            className='w-9 h-9 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center hover:bg-[#00B207] hover:text-white transition-all'
                        >
                            <FiHeart size={16} />
                        </button>
                        <button className='w-9 h-9 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center hover:bg-[#00B207] hover:text-white transition-all'>
                            <FiEye size={16} />
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className='p-4 pt-0 flex flex-col flex-1'>
                    <div className='flex justify-between items-start mb-2'>
                        <div>
                            <h3 className='text-gray-700 font-medium text-sm group-hover:text-[#00B207] transition-colors line-clamp-1'>
                                {product.name}
                            </h3>
                            <div className='flex items-center gap-1 mt-1'>
                                <span className='text-gray-900 font-bold'>${currentPrice.toFixed(2)}</span>
                                {oldPrice && (
                                    <span className='text-gray-400 text-xs line-through ml-1'>${oldPrice.toFixed(2)}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className='w-10 h-10 bg-[#EDF2EE] text-gray-900 rounded-full flex items-center justify-center hover:bg-[#00B207] hover:text-white transition-all shadow-sm'
                        >
                            <FiShoppingCart size={18} />
                        </button>
                    </div>

                    {/* Rating */}
                    <div className='flex items-center gap-1 mt-auto'>
                        <div className='flex text-[#FF8A00]'>
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={10} className={i < Math.floor(product.rating) ? 'text-[#FF8A00]' : 'text-gray-200'} />
                            ))}
                        </div>
                        <span className='text-gray-400 text-[10px]'>({product.reviews})</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
