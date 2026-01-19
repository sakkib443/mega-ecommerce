"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    FiLogOut,
    FiMenu,
    FiX,
    FiBell,
    FiSearch,
    FiChevronDown,
    FiDroplet,
    FiCreditCard,
    FiTruck,
    FiStar,
    FiImage,
    FiGlobe,
    FiMail,
    FiChevronRight
} from 'react-icons/fi';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    {
        name: 'Dashboard',
        href: '/dashboard/admin',
        icon: FiHome,
        badge: null
    },
    {
        name: 'Products',
        href: '/dashboard/admin/products',
        icon: FiShoppingBag,
        badge: null,
        submenu: [
            { name: 'All Products', href: '/dashboard/admin/products' },
            { name: 'Add Product', href: '/dashboard/admin/products/new' },
        ]
    },
    {
        name: 'Categories',
        href: '/dashboard/admin/categories',
        icon: FiGrid,
        badge: null,
        submenu: [
            { name: 'All Categories', href: '/dashboard/admin/categories' },
            { name: 'Create Category', href: '/dashboard/admin/categories/new' },
        ]
    },
    {
        name: 'Orders',
        href: '/dashboard/admin/orders',
        icon: FiShoppingCart,
        badge: '12',
        badgeColor: 'bg-red-500'
    },
    {
        name: 'Customers',
        href: '/dashboard/admin/customers',
        icon: FiUsers,
        badge: null
    },
    {
        name: 'Payments',
        href: '/dashboard/admin/payments',
        icon: FiCreditCard,
        badge: null
    },
    {
        name: 'Shipping',
        href: '/dashboard/admin/shipping',
        icon: FiTruck,
        badge: null
    },
    {
        name: 'Reviews',
        href: '/dashboard/admin/reviews',
        icon: FiStar,
        badge: '5',
        badgeColor: 'bg-yellow-500'
    },
    {
        name: 'Coupons',
        href: '/dashboard/admin/coupons',
        icon: FiTag,
        badge: null
    },
    {
        name: 'Analytics',
        href: '/dashboard/admin/analytics',
        icon: FiBarChart2,
        badge: null
    },
];

const settingsItems = [
    { name: 'General', href: '/dashboard/admin/settings', icon: FiSettings },
    { name: 'Theme', href: '/dashboard/admin/theme', icon: FiDroplet },
    { name: 'Site Content', href: '/dashboard/admin/content', icon: FiFileText },
    { name: 'Media', href: '/dashboard/admin/media', icon: FiImage },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [notifications, setNotifications] = useState(3);
    const pathname = usePathname();
    const router = useRouter();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const isActive = (href: string) => {
        if (href === '/dashboard/admin') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full bg-[#1E293B] text-white transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'w-72' : 'w-20'}
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
                    {sidebarOpen && (
                        <Link href="/dashboard/admin" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#5CAF90] to-[#4A9A7D] flex items-center justify-center font-bold text-lg shadow-md">
                                M
                            </div>
                            <div>
                                <span className="font-bold text-lg">MegaShop</span>
                                <p className="text-xs text-gray-400">Admin Panel</p>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex p-2 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-md"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-10rem)] custom-scrollbar">
                    {/* Main Menu Label */}
                    {sidebarOpen && (
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                            Main Menu
                        </p>
                    )}

                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        const hasSubmenu = item.submenu && item.submenu.length > 0;
                        const isExpanded = expandedMenu === item.name;

                        return (
                            <div key={item.name}>
                                <Link
                                    href={hasSubmenu ? '#' : item.href}
                                    onClick={(e) => {
                                        if (hasSubmenu) {
                                            e.preventDefault();
                                            setExpandedMenu(isExpanded ? null : item.name);
                                        }
                                    }}
                                    className={`
                                        flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200
                                        ${active
                                            ? 'bg-[#5CAF90] text-white shadow-md'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        {sidebarOpen && <span className="font-medium">{item.name}</span>}
                                    </div>
                                    {sidebarOpen && (
                                        <div className="flex items-center gap-2">
                                            {item.badge && (
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor || 'bg-gray-600'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {hasSubmenu && (
                                                <FiChevronDown
                                                    size={16}
                                                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </div>
                                    )}
                                </Link>

                                {/* Submenu */}
                                {hasSubmenu && isExpanded && sidebarOpen && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
                                        {item.submenu!.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className={`
                                                    block px-4 py-2 rounded-md text-sm transition-colors
                                                    ${pathname === sub.href
                                                        ? 'text-[#5CAF90] bg-[#5CAF90]/10'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Settings Section */}
                    {sidebarOpen && (
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mt-8 mb-3">
                            Settings
                        </p>
                    )}

                    {settingsItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200
                                    ${active
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-[#1E293B]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <FiLogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                        >
                            <FiMenu size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-md px-4 py-2.5">
                            <FiSearch className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders, products..."
                                className="bg-transparent outline-none w-72 text-sm"
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {/* Visit Store */}
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-600 transition-colors"
                        >
                            <FiGlobe size={16} />
                            Visit Store
                        </Link>

                        {/* Notifications */}
                        <button className="relative p-2.5 hover:bg-gray-100 rounded-md">
                            <FiBell size={22} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#5CAF90] to-[#4A9A7D] flex items-center justify-center text-white font-bold shadow-md">
                                A
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                            <FiChevronDown className="hidden sm:block text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.3);
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
