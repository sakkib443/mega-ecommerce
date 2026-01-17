"use client";

import React, { useState } from 'react';
import ProductCard from '../shared/ProductCard';

// Demo products - will be replaced with API data
const demoProducts = [
    { id: 1, name: 'Floral Summer Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-1.jpg', price: 45.00, rating: 5, reviews: 12, category: 'new' },
    { id: 2, name: 'Elegant Evening Gown', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-2.jpg', price: 120.00, originalPrice: 150.00, discount: 20, rating: 5, reviews: 8, category: 'best' },
    { id: 3, name: 'Casual Denim Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-3.jpg', price: 35.00, rating: 4, reviews: 15, category: 'popular' },
    { id: 4, name: 'Bohemian Maxi Dress', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/2-4.jpg', price: 55.00, rating: 4.5, reviews: 20, category: 'featured' },
    { id: 11, name: 'Premium Leather Backpack', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-2.jpg', price: 85.00, originalPrice: 110.00, discount: 22, rating: 5, reviews: 24, category: 'new' },
    { id: 12, name: 'Modern White Sneakers', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-5.jpg', price: 65.00, rating: 4.8, reviews: 45, category: 'best' },
    { id: 13, name: 'Navy Blue Cotton T-Shirt', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-10.jpg', price: 25.00, rating: 4.5, reviews: 32, category: 'popular' },
    { id: 14, name: 'Minimalist Black Cap', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-1.jpg', price: 18.00, originalPrice: 25.00, discount: 28, rating: 4.2, reviews: 18, category: 'featured' },
    { id: 5, name: 'Classic Hat', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/1.jpg', price: 53.00, rating: 4, reviews: 1, category: 'new' },
    { id: 6, name: "Women's White Handbag", image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/2.jpg', price: 26.62, rating: 4, reviews: 3, category: 'best' },
    { id: 7, name: 'Multi Functional Apple iPhone', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-3.jpg', price: 136.26, originalPrice: 145.90, discount: 7, rating: 5, reviews: 5, category: 'popular' },
    { id: 15, name: 'Designer Leather Bag', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/3.jpg', price: 120.00, rating: 5, reviews: 10, category: 'best' },
    { id: 8, name: 'Fashion Blue Towel', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-4.jpg', price: 26.55, rating: 4, reviews: 8, category: 'featured' },
    { id: 9, name: 'Smart LED Television', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/products/1-9.jpg', price: 450.00, originalPrice: 499.00, discount: 10, rating: 4, reviews: 9, category: 'new' },
    { id: 10, name: 'Casual Cotton T-Shirt', image: 'https://portotheme.com/html/wolmart/assets/images/demos/demo1/blogs/4.jpg', price: 19.99, rating: 4, reviews: 22, category: 'best' },
];

const filters = [
    { id: 'all', label: 'ALL PRODUCTS' },
    { id: 'new', label: 'NEW ARRIVALS' },
    { id: 'best', label: 'BEST SELLER' },
    { id: 'popular', label: 'MOST POPULAR' },
    { id: 'featured', label: 'FEATURED' },
];

const PopularProducts: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('new');

    const filteredProducts = activeFilter === 'all'
        ? demoProducts
        : demoProducts.filter(p => p.category === activeFilter);

    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            {/* Section Header - Left Aligned */}
            <div className='mb-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-8'>
                    Popular Departments
                </h2>

                {/* Filter Tabs - Left Aligned */}
                <div className='flex flex-wrap gap-4'>
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-6 py-2.5 text-[13px] font-bold tracking-wider rounded-md transition-all ${activeFilter === filter.id
                                ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/20'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                {filteredProducts.slice(0, 10).map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default PopularProducts;
