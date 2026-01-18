"use client";

import React, { useState } from 'react';
import {
    FiSave,
    FiGlobe,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiImage,
    FiShield,
    FiTruck,
    FiCreditCard,
    FiCheck,
    FiAlertCircle,
    FiInfo,
} from 'react-icons/fi';

// Tab Component
const Tab = ({ active, onClick, children, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${active
                ? 'text-[#5CAF90] border-[#5CAF90]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
    >
        <Icon size={18} />
        {children}
    </button>
);

// Input Field
const FormField = ({ label, name, type = 'text', placeholder, value, onChange, hint }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
        />
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

// Toggle Switch
const Toggle = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="font-medium text-gray-700">{label}</p>
            {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#5CAF90]' : 'bg-gray-300'
                }`}
        >
            <div
                className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${checked ? 'translate-x-6' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        // General
        siteName: 'MegaShop',
        tagline: 'Your One-Stop E-Commerce Store',
        siteUrl: 'https://megashop.com',
        logo: '',
        favicon: '',

        // Contact
        email: 'support@megashop.com',
        phone: '+880 1712 345 678',
        whatsapp: '+880 1712 345 678',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh',

        // Currency
        currency: 'BDT',
        currencySymbol: '৳',
        currencyPosition: 'before',

        // Shipping
        freeShippingThreshold: 2000,
        defaultShippingCost: 60,
        enableFreeShipping: true,

        // Payment
        codEnabled: true,
        sslcommerzEnabled: true,
        bkashEnabled: true,
        nagadEnabled: false,

        // Notifications
        orderNotifications: true,
        stockAlerts: true,
        reviewNotifications: true,
        marketingEmails: false,

        // Security
        twoFactorAuth: false,
        loginNotifications: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: FiGlobe },
        { id: 'shipping', label: 'Shipping', icon: FiTruck },
        { id: 'payment', label: 'Payment', icon: FiCreditCard },
        { id: 'notifications', label: 'Notifications', icon: FiMail },
        { id: 'security', label: 'Security', icon: FiShield },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your store settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5CAF90] to-[#4A9A7D] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#5CAF90]/30 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <FiCheck size={18} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <FiSave size={18} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-gray-100">
                    {tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            active={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            icon={tab.icon}
                        >
                            {tab.label}
                        </Tab>
                    ))}
                </div>

                <div className="p-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            {/* Site Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Site Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Site Name"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                        placeholder="Your store name"
                                    />
                                    <FormField
                                        label="Tagline"
                                        name="tagline"
                                        value={settings.tagline}
                                        onChange={handleChange}
                                        placeholder="A short description"
                                    />
                                    <FormField
                                        label="Site URL"
                                        name="siteUrl"
                                        value={settings.siteUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        placeholder="support@example.com"
                                    />
                                    <FormField
                                        label="Phone Number"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleChange}
                                        placeholder="+880 1XXX XXX XXX"
                                    />
                                    <FormField
                                        label="WhatsApp"
                                        name="whatsapp"
                                        value={settings.whatsapp}
                                        onChange={handleChange}
                                        placeholder="+880 1XXX XXX XXX"
                                    />
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <textarea
                                            name="address"
                                            value={settings.address}
                                            onChange={(e: any) => handleChange(e)}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Currency Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                        <select
                                            name="currency"
                                            value={settings.currency}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                                        >
                                            <option value="BDT">BDT - Bangladeshi Taka</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </select>
                                    </div>
                                    <FormField
                                        label="Currency Symbol"
                                        name="currencySymbol"
                                        value={settings.currencySymbol}
                                        onChange={handleChange}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Symbol Position</label>
                                        <select
                                            name="currencyPosition"
                                            value={settings.currencyPosition}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5CAF90] focus:border-transparent"
                                        >
                                            <option value="before">Before (৳100)</option>
                                            <option value="after">After (100৳)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Settings */}
                    {activeTab === 'shipping' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <FiInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-blue-700">
                                    Configure shipping options and costs. These settings apply to all orders unless overridden by specific shipping zones.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Toggle
                                    label="Enable Free Shipping"
                                    description="Offer free shipping when order total exceeds threshold"
                                    checked={settings.enableFreeShipping}
                                    onChange={(val: boolean) => setSettings(prev => ({ ...prev, enableFreeShipping: val }))}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Free Shipping Threshold"
                                        name="freeShippingThreshold"
                                        type="number"
                                        value={settings.freeShippingThreshold}
                                        onChange={handleChange}
                                        hint="Minimum order amount for free shipping"
                                    />
                                    <FormField
                                        label="Default Shipping Cost"
                                        name="defaultShippingCost"
                                        type="number"
                                        value={settings.defaultShippingCost}
                                        onChange={handleChange}
                                        hint="Applied when free shipping doesn't qualify"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Cash on Delivery (COD)"
                                        description="Allow customers to pay on delivery"
                                        checked={settings.codEnabled}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, codEnabled: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="SSLCommerz"
                                        description="Accept cards, mobile banking & more"
                                        checked={settings.sslcommerzEnabled}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, sslcommerzEnabled: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="bKash"
                                        description="Accept bKash mobile payments"
                                        checked={settings.bkashEnabled}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, bkashEnabled: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Nagad"
                                        description="Accept Nagad mobile payments"
                                        checked={settings.nagadEnabled}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, nagadEnabled: val }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800">Email Notifications</h3>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Order Notifications"
                                        description="Receive email when new orders are placed"
                                        checked={settings.orderNotifications}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, orderNotifications: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Low Stock Alerts"
                                        description="Get notified when products are running low"
                                        checked={settings.stockAlerts}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, stockAlerts: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Review Notifications"
                                        description="Receive alerts for new product reviews"
                                        checked={settings.reviewNotifications}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, reviewNotifications: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Marketing Emails"
                                        description="Receive promotional and marketing updates"
                                        checked={settings.marketingEmails}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, marketingEmails: val }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                                <FiAlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-yellow-700">
                                    Security settings help protect your admin account. We recommend enabling two-factor authentication.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Two-Factor Authentication"
                                        description="Add an extra layer of security to your account"
                                        checked={settings.twoFactorAuth}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, twoFactorAuth: val }))}
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <Toggle
                                        label="Login Notifications"
                                        description="Receive email when someone logs into your account"
                                        checked={settings.loginNotifications}
                                        onChange={(val: boolean) => setSettings(prev => ({ ...prev, loginNotifications: val }))}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <h4 className="font-medium text-gray-800 mb-4">Change Password</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Current Password"
                                        name="currentPassword"
                                        type="password"
                                        placeholder="Enter current password"
                                    />
                                    <div></div>
                                    <FormField
                                        label="New Password"
                                        name="newPassword"
                                        type="password"
                                        placeholder="Enter new password"
                                    />
                                    <FormField
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
