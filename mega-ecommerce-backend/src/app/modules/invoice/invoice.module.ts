// ===================================================================
// Mega E-Commerce Backend - Invoice Module
// PDF Invoice Generation
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../utils/AppError';
import express from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import PDFDocument from 'pdfkit';

// ==================== INTERFACES ====================
export interface IInvoiceItem {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface IInvoiceData {
    invoiceNumber: string;
    orderNumber: string;
    orderDate: Date;

    // Company Info
    company: {
        name: string;
        address: string;
        phone: string;
        email: string;
        logo?: string;
    };

    // Customer Info
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        zipCode?: string;
    };

    // Items
    items: IInvoiceItem[];

    // Totals
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax: number;
    total: number;

    // Payment Info
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;

    // Notes
    notes?: string;
}

// ==================== SERVICE ====================
const InvoiceService = {
    // Generate invoice number
    generateInvoiceNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `INV-${year}${month}-${random}`;
    },

    // Get invoice data from order
    async getInvoiceDataFromOrder(orderId: string): Promise<IInvoiceData> {
        const { Order } = await import('../order/order.module');
        const order = await Order.findById(orderId)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name');

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        const user = order.user as any;
        const address = order.shippingAddress;

        return {
            invoiceNumber: this.generateInvoiceNumber(),
            orderNumber: order.orderNumber,
            orderDate: order.createdAt!,

            company: {
                name: 'Mega E-Commerce',
                address: 'Dhaka, Bangladesh',
                phone: '+880 1XXX-XXXXXX',
                email: 'support@megaecommerce.com',
            },

            customer: {
                name: address.fullName || `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: address.phone,
                address: address.street,
                city: address.city,
                zipCode: address.zipCode,
            },

            items: order.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
            })),

            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            discount: order.discount,
            tax: order.tax || 0,
            total: order.total,

            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            transactionId: order.transactionId,

            notes: order.customerNote,
        };
    },

    // Generate PDF Invoice
    async generatePDF(invoiceData: IInvoiceData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Colors
            const primaryColor = '#2563eb';
            const textColor = '#1f2937';
            const grayColor = '#6b7280';

            // Header
            doc.fontSize(24)
                .fillColor(primaryColor)
                .text(invoiceData.company.name, 50, 50, { align: 'left' });

            doc.fontSize(10)
                .fillColor(grayColor)
                .text(invoiceData.company.address, 50, 80)
                .text(`Phone: ${invoiceData.company.phone}`, 50, 95)
                .text(`Email: ${invoiceData.company.email}`, 50, 110);

            // Invoice Title
            doc.fontSize(28)
                .fillColor(textColor)
                .text('INVOICE', 400, 50, { align: 'right' });

            doc.fontSize(10)
                .fillColor(grayColor)
                .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 85, { align: 'right' })
                .text(`Order #: ${invoiceData.orderNumber}`, 400, 100, { align: 'right' })
                .text(`Date: ${new Date(invoiceData.orderDate).toLocaleDateString('en-GB')}`, 400, 115, { align: 'right' });

            // Horizontal Line
            doc.moveTo(50, 140)
                .lineTo(545, 140)
                .stroke(primaryColor);

            // Bill To
            doc.fontSize(12)
                .fillColor(primaryColor)
                .text('Bill To:', 50, 160);

            doc.fontSize(11)
                .fillColor(textColor)
                .text(invoiceData.customer.name, 50, 180)
                .fontSize(10)
                .fillColor(grayColor)
                .text(invoiceData.customer.address, 50, 195)
                .text(`${invoiceData.customer.city}${invoiceData.customer.zipCode ? ', ' + invoiceData.customer.zipCode : ''}`, 50, 210)
                .text(`Phone: ${invoiceData.customer.phone}`, 50, 225)
                .text(`Email: ${invoiceData.customer.email}`, 50, 240);

            // Payment Info
            doc.fontSize(12)
                .fillColor(primaryColor)
                .text('Payment Info:', 350, 160);

            doc.fontSize(10)
                .fillColor(grayColor)
                .text(`Method: ${invoiceData.paymentMethod.toUpperCase()}`, 350, 180)
                .text(`Status: ${invoiceData.paymentStatus.toUpperCase()}`, 350, 195);

            if (invoiceData.transactionId) {
                doc.text(`Transaction: ${invoiceData.transactionId}`, 350, 210);
            }

            // Items Table Header
            const tableTop = 280;
            doc.rect(50, tableTop, 495, 25)
                .fill(primaryColor);

            doc.fontSize(10)
                .fillColor('white')
                .text('Item', 60, tableTop + 8)
                .text('Qty', 350, tableTop + 8, { width: 50, align: 'center' })
                .text('Price', 410, tableTop + 8, { width: 60, align: 'right' })
                .text('Total', 480, tableTop + 8, { width: 60, align: 'right' });

            // Items
            let yPosition = tableTop + 35;
            invoiceData.items.forEach((item, index) => {
                const rowColor = index % 2 === 0 ? '#f9fafb' : 'white';
                doc.rect(50, yPosition - 5, 495, 25)
                    .fill(rowColor);

                doc.fontSize(10)
                    .fillColor(textColor)
                    .text(item.name, 60, yPosition, { width: 280 })
                    .text(item.quantity.toString(), 350, yPosition, { width: 50, align: 'center' })
                    .text(`৳${item.price.toLocaleString()}`, 410, yPosition, { width: 60, align: 'right' })
                    .text(`৳${item.subtotal.toLocaleString()}`, 480, yPosition, { width: 60, align: 'right' });

                yPosition += 25;
            });

            // Totals
            yPosition += 20;
            const totalsX = 380;

            doc.fontSize(10)
                .fillColor(grayColor)
                .text('Subtotal:', totalsX, yPosition)
                .fillColor(textColor)
                .text(`৳${invoiceData.subtotal.toLocaleString()}`, 480, yPosition, { width: 60, align: 'right' });

            yPosition += 20;
            doc.fillColor(grayColor)
                .text('Shipping:', totalsX, yPosition)
                .fillColor(textColor)
                .text(`৳${invoiceData.shippingCost.toLocaleString()}`, 480, yPosition, { width: 60, align: 'right' });

            if (invoiceData.discount > 0) {
                yPosition += 20;
                doc.fillColor(grayColor)
                    .text('Discount:', totalsX, yPosition)
                    .fillColor('#059669')
                    .text(`-৳${invoiceData.discount.toLocaleString()}`, 480, yPosition, { width: 60, align: 'right' });
            }

            if (invoiceData.tax > 0) {
                yPosition += 20;
                doc.fillColor(grayColor)
                    .text('Tax:', totalsX, yPosition)
                    .fillColor(textColor)
                    .text(`৳${invoiceData.tax.toLocaleString()}`, 480, yPosition, { width: 60, align: 'right' });
            }

            // Total
            yPosition += 25;
            doc.rect(totalsX - 10, yPosition - 5, 165, 30)
                .fill(primaryColor);

            doc.fontSize(12)
                .fillColor('white')
                .text('TOTAL:', totalsX, yPosition + 3)
                .fontSize(14)
                .text(`৳${invoiceData.total.toLocaleString()}`, 480, yPosition + 2, { width: 60, align: 'right' });

            // Notes
            if (invoiceData.notes) {
                yPosition += 60;
                doc.fontSize(10)
                    .fillColor(primaryColor)
                    .text('Notes:', 50, yPosition);
                doc.fillColor(grayColor)
                    .text(invoiceData.notes, 50, yPosition + 15, { width: 400 });
            }

            // Footer
            const footerY = 750;
            doc.moveTo(50, footerY)
                .lineTo(545, footerY)
                .stroke('#e5e7eb');

            doc.fontSize(9)
                .fillColor(grayColor)
                .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 495 })
                .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 30, { align: 'center', width: 495 });

            doc.end();
        });
    },

    // Generate HTML Invoice (for email)
    generateHTML(invoiceData: IInvoiceData): string {
        const itemsHTML = invoiceData.items.map(item => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${item.price.toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${item.subtotal.toLocaleString()}</td>
            </tr>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; margin: 0; padding: 20px; }
        .invoice { max-width: 800px; margin: 0 auto; background: #fff; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-name { font-size: 28px; color: #2563eb; font-weight: bold; }
        .invoice-title { font-size: 32px; color: #1f2937; text-align: right; }
        .invoice-meta { color: #6b7280; font-size: 14px; text-align: right; }
        .addresses { display: flex; justify-content: space-between; margin: 30px 0; }
        .address-box { flex: 1; }
        .address-title { color: #2563eb; font-weight: 600; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #2563eb; color: white; padding: 12px; text-align: left; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
        .total-label { width: 120px; color: #6b7280; }
        .total-value { width: 100px; text-align: right; }
        .grand-total { background: #2563eb; color: white; padding: 10px 20px; font-size: 18px; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <div class="company-name">${invoiceData.company.name}</div>
                <div style="color: #6b7280; font-size: 14px;">
                    ${invoiceData.company.address}<br>
                    Phone: ${invoiceData.company.phone}<br>
                    Email: ${invoiceData.company.email}
                </div>
            </div>
            <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-meta">
                    Invoice #: ${invoiceData.invoiceNumber}<br>
                    Order #: ${invoiceData.orderNumber}<br>
                    Date: ${new Date(invoiceData.orderDate).toLocaleDateString('en-GB')}
                </div>
            </div>
        </div>

        <div class="addresses">
            <div class="address-box">
                <div class="address-title">Bill To:</div>
                <div>
                    <strong>${invoiceData.customer.name}</strong><br>
                    ${invoiceData.customer.address}<br>
                    ${invoiceData.customer.city}${invoiceData.customer.zipCode ? ', ' + invoiceData.customer.zipCode : ''}<br>
                    Phone: ${invoiceData.customer.phone}<br>
                    Email: ${invoiceData.customer.email}
                </div>
            </div>
            <div class="address-box" style="text-align: right;">
                <div class="address-title">Payment Info:</div>
                <div>
                    Method: ${invoiceData.paymentMethod.toUpperCase()}<br>
                    Status: ${invoiceData.paymentStatus.toUpperCase()}
                    ${invoiceData.transactionId ? '<br>Transaction: ' + invoiceData.transactionId : ''}
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">৳${invoiceData.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
                <span class="total-label">Shipping:</span>
                <span class="total-value">৳${invoiceData.shippingCost.toLocaleString()}</span>
            </div>
            ${invoiceData.discount > 0 ? `
            <div class="total-row">
                <span class="total-label">Discount:</span>
                <span class="total-value" style="color: #059669;">-৳${invoiceData.discount.toLocaleString()}</span>
            </div>
            ` : ''}
            ${invoiceData.tax > 0 ? `
            <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-value">৳${invoiceData.tax.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row grand-total">
                <span class="total-label" style="color: white;">TOTAL:</span>
                <span class="total-value" style="font-weight: bold;">৳${invoiceData.total.toLocaleString()}</span>
            </div>
        </div>

        ${invoiceData.notes ? `
        <div style="margin-top: 30px;">
            <strong style="color: #2563eb;">Notes:</strong>
            <p style="color: #6b7280;">${invoiceData.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
</body>
</html>
        `;
    },
};

// ==================== CONTROLLER ====================
const InvoiceController = {
    // Download PDF invoice
    downloadInvoice: catchAsync(async (req: Request, res: Response) => {
        const { orderId } = req.params;

        // Verify user has access to this order
        const { Order } = await import('../order/order.module');
        const order = await Order.findById(orderId);

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user!.userId &&
            !['admin', 'super_admin'].includes(req.user!.role)) {
            throw new AppError(403, 'You do not have permission to access this invoice');
        }

        const invoiceData = await InvoiceService.getInvoiceDataFromOrder(orderId);
        const pdfBuffer = await InvoiceService.generatePDF(invoiceData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${invoiceData.orderNumber}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }),

    // View HTML invoice
    viewInvoice: catchAsync(async (req: Request, res: Response) => {
        const { orderId } = req.params;

        // Verify user has access
        const { Order } = await import('../order/order.module');
        const order = await Order.findById(orderId);

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        if (order.user.toString() !== req.user!.userId &&
            !['admin', 'super_admin'].includes(req.user!.role)) {
            throw new AppError(403, 'You do not have permission to access this invoice');
        }

        const invoiceData = await InvoiceService.getInvoiceDataFromOrder(orderId);
        const html = InvoiceService.generateHTML(invoiceData);

        res.set('Content-Type', 'text/html');
        res.send(html);
    }),

    // Get invoice data (JSON)
    getInvoiceData: catchAsync(async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const { Order } = await import('../order/order.module');
        const order = await Order.findById(orderId);

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        if (order.user.toString() !== req.user!.userId &&
            !['admin', 'super_admin'].includes(req.user!.role)) {
            throw new AppError(403, 'You do not have permission to access this invoice');
        }

        const invoiceData = await InvoiceService.getInvoiceDataFromOrder(orderId);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Invoice data fetched',
            data: invoiceData,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

router.get('/:orderId/download', authMiddleware, InvoiceController.downloadInvoice);
router.get('/:orderId/view', authMiddleware, InvoiceController.viewInvoice);
router.get('/:orderId/data', authMiddleware, InvoiceController.getInvoiceData);

export const InvoiceRoutes = router;
export default InvoiceService;
