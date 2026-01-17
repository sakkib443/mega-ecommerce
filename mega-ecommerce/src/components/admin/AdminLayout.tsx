"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FiHome,
    FiShoppingBag,
    FiUsers,
    FiShoppingCart,
    FiPackage,
    FiSettings,
    FiBarChart2,
    FiTag,
    FiGrid,
    FiFileText,
    FiMessageSquare,
    FiHelpCircle,
    FiLogOut,
    FiMenu,
    FiX,
    FiBell,
    FiSearch,
    FiChevronDown,
    FiDroplet
} from 'react-icons/fi';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Products', href: '/admin/products', icon: FiShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FiGrid },
    { name: 'Orders', href: '/admin/orders', icon: FiShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: FiUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
    { name: 'Coupons', href: '/admin/coupons', icon: FiTag },
    { name: 'Inventory', href: '/admin/inventory', icon: FiPackage },
    { name: 'Reviews', href: '/admin/reviews', icon: FiMessageSquare },
    { name: 'Pages', href: '/admin/pages', icon: FiFileText },
    { name: 'Theme', href: '/admin/theme', icon: FiDroplet },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full bg-[#1E293B] text-white transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                    {sidebarOpen && (
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#5CAF90] flex items-center justify-center font-bold">
                                M
                            </div>
                            <span className="font-bold text-lg">MegaShop</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:block p-2 hover:bg-gray-700 rounded-lg"
                    >
                        <FiMenu size={20} />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive
                                        ? 'bg-[#5CAF90] text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                `}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                    >
                        <FiLogOut size={20} />
                        {sidebarOpen && <span>Back to Store</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <FiMenu size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                            <FiSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent outline-none w-64"
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <FiBell size={22} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2">
                            <div className="w-9 h-9 rounded-full bg-[#5CAF90] flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                            <FiChevronDown className="hidden sm:block text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
