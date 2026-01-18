// ===================================================================
// Mega E-Commerce Backend - Email Templates
// Professional HTML Email Templates
// ===================================================================

// ==================== BASE TEMPLATE ====================
const baseTemplate = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mega E-Commerce</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', Arial, sans-serif;">
    <!-- Preheader (preview text) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        ${preheader}
    </div>
    
    <!-- Main Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🛒 Mega E-Commerce
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@megaecommerce.com" style="color: #2563eb; text-decoration: none;">support@megaecommerce.com</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} Mega E-Commerce. All rights reserved.
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24"></a>
                                <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" width="24"></a>
                                <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24"></a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// ==================== EMAIL TEMPLATES ====================
export const EmailTemplates = {
    // Welcome Email
    welcome: (firstName: string): string => {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    স্বাগতম, ${firstName}!
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                    Welcome to Mega E-Commerce
                </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এখন থেকে আপনি আমাদের সব প্রোডাক্ট ব্রাউজ করতে এবং অর্ডার করতে পারবেন।
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">আপনি যা পাচ্ছেন:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
                    <li>✨ হাজারো প্রোডাক্ট একজায়গায়</li>
                    <li>🚚 দ্রুত ডেলিভারি সার্ভিস</li>
                    <li>💰 এক্সক্লুসিভ অফার ও ডিসকাউন্ট</li>
                    <li>🔒 সুরক্ষিত পেমেন্ট সিস্টেম</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{{FRONTEND_URL}}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    শপিং শুরু করুন 🛍️
                </a>
            </div>
        `;
        return baseTemplate(content, `স্বাগতম ${firstName}! আপনার অ্যাকাউন্ট তৈরি হয়েছে।`);
    },

    // Order Confirmation
    orderConfirmation: (data: {
        orderNumber: string;
        customerName: string;
        items: { name: string; quantity: number; price: number }[];
        subtotal: number;
        shippingCost: number;
        discount: number;
        total: number;
        shippingAddress: string;
        paymentMethod: string;
    }): string => {
        const itemsHTML = data.items.map(item => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-weight: 500; color: #1f2937;">${item.name}</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</p>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 500;">
                    ৳${(item.price * item.quantity).toLocaleString()}
                </td>
            </tr>
        `).join('');

        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    অর্ডার কনফার্মড!
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                    Order #${data.orderNumber}
                </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                প্রিয় ${data.customerName},<br>
                আপনার অর্ডার সফলভাবে প্লেস হয়েছে! আমরা শীঘ্রই আপনার অর্ডার প্রসেস করবো।
            </p>
            
            <!-- Order Items -->
            <div style="background-color: #f9fafb; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="padding: 15px; background-color: #1f2937; color: #ffffff; font-weight: 600;">
                            অর্ডার আইটেম
                        </td>
                        <td style="padding: 15px; background-color: #1f2937; color: #ffffff; font-weight: 600; text-align: right;">
                            মূল্য
                        </td>
                    </tr>
                    ${itemsHTML}
                </table>
            </div>
            
            <!-- Order Summary -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">সাবটোটাল:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1f2937;">৳${data.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">শিপিং:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1f2937;">৳${data.shippingCost.toLocaleString()}</td>
                </tr>
                ${data.discount > 0 ? `
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">ডিসকাউন্ট:</td>
                    <td style="padding: 8px 0; text-align: right; color: #059669;">-৳${data.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 15px 0; color: #1f2937; font-weight: 700; font-size: 18px; border-top: 2px solid #e5e7eb;">সর্বমোট:</td>
                    <td style="padding: 15px 0; text-align: right; color: #2563eb; font-weight: 700; font-size: 18px; border-top: 2px solid #e5e7eb;">৳${data.total.toLocaleString()}</td>
                </tr>
            </table>
            
            <!-- Shipping Address -->
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">📍 ডেলিভারি ঠিকানা:</h3>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${data.shippingAddress}</p>
            </div>
            
            <!-- Payment Method -->
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: 600;">💳 পেমেন্ট মেথড:</h3>
                <p style="margin: 0; color: #4b5563; font-size: 14px;">${data.paymentMethod.toUpperCase()}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{{FRONTEND_URL}}/orders/${data.orderNumber}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    অর্ডার ট্র্যাক করুন 📦
                </a>
            </div>
        `;
        return baseTemplate(content, `Order #${data.orderNumber} confirmed! Total: ৳${data.total.toLocaleString()}`);
    },

    // Order Shipped
    orderShipped: (data: {
        orderNumber: string;
        customerName: string;
        trackingNumber?: string;
        trackingUrl?: string;
        carrier: string;
        estimatedDelivery?: string;
    }): string => {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🚚</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    আপনার অর্ডার শিপ হয়েছে!
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                    Order #${data.orderNumber}
                </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                প্রিয় ${data.customerName},<br>
                সুখবর! আপনার অর্ডার শিপ করা হয়েছে এবং আপনার দিকে আসছে।
            </p>
            
            <!-- Shipping Info -->
            <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="padding: 8px 0; color: #92400e; font-weight: 600;">কুরিয়ার:</td>
                        <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.carrier}</td>
                    </tr>
                    ${data.trackingNumber ? `
                    <tr>
                        <td style="padding: 8px 0; color: #92400e; font-weight: 600;">ট্র্যাকিং নম্বর:</td>
                        <td style="padding: 8px 0; color: #1f2937; text-align: right; font-family: monospace;">${data.trackingNumber}</td>
                    </tr>
                    ` : ''}
                    ${data.estimatedDelivery ? `
                    <tr>
                        <td style="padding: 8px 0; color: #92400e; font-weight: 600;">আনুমানিক ডেলিভারি:</td>
                        <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.estimatedDelivery}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            ${data.trackingUrl ? `
            <div style="text-align: center; margin-top: 30px;">
                <a href="${data.trackingUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    ট্র্যাক করুন 📍
                </a>
            </div>
            ` : ''}
        `;
        return baseTemplate(content, `Your order #${data.orderNumber} has been shipped!`);
    },

    // Order Delivered
    orderDelivered: (data: {
        orderNumber: string;
        customerName: string;
    }): string => {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🎊</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    অর্ডার ডেলিভারি সম্পন্ন!
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                    Order #${data.orderNumber}
                </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                প্রিয় ${data.customerName},<br>
                আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে। আশা করি আপনি সন্তুষ্ট হয়েছেন!
            </p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 15px 0; color: #166534; font-size: 16px; font-weight: 500;">
                    আপনার মতামত আমাদের কাছে গুরুত্বপূর্ণ!
                </p>
                <a href="{{FRONTEND_URL}}/orders/${data.orderNumber}/review" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;">
                    ⭐ রিভিউ দিন
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।
            </p>
        `;
        return baseTemplate(content, `Your order #${data.orderNumber} has been delivered!`);
    },

    // Password Reset
    passwordReset: (data: {
        firstName: string;
        resetLink: string;
    }): string => {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🔐</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    পাসওয়ার্ড রিসেট
                </h2>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                প্রিয় ${data.firstName},<br>
                আপনি পাসওয়ার্ড রিসেট করার অনুরোধ করেছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    পাসওয়ার্ড রিসেট করুন
                </a>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    ⚠️ এই লিংকটি ১০ মিনিট পর্যন্ত বৈধ থাকবে।
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                আপনি এই অনুরোধ না করলে এই ইমেইল উপেক্ষা করুন।
            </p>
        `;
        return baseTemplate(content, 'Password reset request for your account');
    },

    // Price Drop Alert (Wishlist)
    priceDropAlert: (data: {
        firstName: string;
        productName: string;
        productImage: string;
        oldPrice: number;
        newPrice: number;
        discountPercent: number;
        productUrl: string;
    }): string => {
        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🔥</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    দাম কমেছে!
                </h2>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                প্রিয় ${data.firstName},<br>
                আপনার উইশলিস্টে থাকা একটি প্রোডাক্টের দাম কমেছে!
            </p>
            
            <div style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                <img src="${data.productImage}" alt="${data.productName}" style="width: 100%; height: 200px; object-fit: cover;">
                <div style="padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">${data.productName}</h3>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="text-decoration: line-through; color: #9ca3af; font-size: 16px;">৳${data.oldPrice.toLocaleString()}</span>
                        <span style="color: #dc2626; font-size: 24px; font-weight: 700;">৳${data.newPrice.toLocaleString()}</span>
                        <span style="background-color: #dc2626; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${data.discountPercent}% OFF
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.productUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    এখনই কিনুন 🛒
                </a>
            </div>
        `;
        return baseTemplate(content, `Price drop alert: ${data.productName} now ৳${data.newPrice}`);
    },
};

export default EmailTemplates;
