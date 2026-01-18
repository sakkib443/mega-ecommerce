"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiSend,
    FiChevronRight,
    FiFacebook,
    FiTwitter,
    FiInstagram,
    FiLinkedin,
    FiClock,
    FiCheckCircle
} from 'react-icons/fi';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setIsSent(false), 5000);
    };

    const contactInfo = [
        {
            icon: <FiMapPin size={24} />,
            title: "Visit Our Store",
            details: ["123 Luxury Street, Fashion Avenue", "New York, NY 10001"],
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: <FiPhone size={24} />,
            title: "Call Us 24/7",
            details: ["+1 (234) 567-890", "+1 (234) 987-654"],
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            icon: <FiMail size={24} />,
            title: "Email Support",
            details: ["support@megashop.com", "info@megashop.com"],
            color: "bg-rose-50 text-rose-600"
        },
        {
            icon: <FiClock size={24} />,
            title: "Working Hours",
            details: ["Mon - Fri: 9am - 10pm", "Sat - Sun: 10am - 8pm"],
            color: "bg-amber-50 text-amber-600"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Minimalist Header */}
            <div className="bg-gray-50 border-b border-gray-100 py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 relative z-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                        <FiChevronRight />
                        <span className="text-gray-900">Contact Us</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-none">
                        GET IN <span className="text-[var(--color-primary)]">TOUCH</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-500 font-medium text-lg leading-relaxed">
                        Have a question or just want to say hi? We'd love to hear from you. Our team is always here to help.
                    </p>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Contact Info Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {contactInfo.map((info, idx) => (
                            <div key={idx} className="group flex gap-6 p-8 rounded-[32px] bg-white border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
                                <div className={`w-14 h-14 rounded-2xl ${info.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    {info.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{info.title}</h3>
                                    {info.details.map((detail, i) => (
                                        <p key={i} className="text-gray-500 font-medium text-sm">{detail}</p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Social Links */}
                        <div className="p-8 rounded-[32px] bg-gray-900 text-white relative overflow-hidden group">
                            <h3 className="text-xl font-black mb-6 relative z-10">Follow Our Story</h3>
                            <div className="flex gap-4 relative z-10">
                                {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                                    <button key={i} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all">
                                        <Icon size={20} />
                                    </button>
                                ))}
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        </div>
                    </div>

                    {/* Contact Form Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[48px] p-8 md:p-16 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)]">
                            <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Send Us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                                        placeholder="How can we help you?"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        rows={6}
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none"
                                        placeholder="Type your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full md:w-auto min-w-[200px] h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--color-primary)]/10 ${isSent
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-900 text-white hover:bg-[var(--color-primary)]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : isSent ? (
                                        <><FiCheckCircle size={18} /> Message Sent!</>
                                    ) : (
                                        <><FiSend size={18} /> Send Message</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Maps Placeholder: Stylized */}
            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 mb-24">
                <div className="w-full h-[500px] bg-gray-100 rounded-[64px] relative overflow-hidden group shadow-inner">
                    <img
                        src="https://portotheme.com/html/wolmart/assets/images/demos/demo1/banners/4.jpg"
                        className="w-full h-full object-cover grayscale opacity-20"
                        alt="Map Background"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center relative z-10 max-w-sm border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                            <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                                <FiMapPin size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">MEGA OFFICE</h3>
                            <p className="text-gray-500 font-medium text-sm px-4">Visit us at our headquarters for a coffee and a chat about your needs.</p>
                            <button className="mt-8 text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline">Open in Google Maps</button>
                        </div>
                    </div>
                    {/* Decorative Map Grid overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>
            </div>
        </div>
    );
}
