// ===================================================================
// Mega E-Commerce Backend - Shipping Module
// Shipping zones, rates, and carrier integrations
// ===================================================================

import { Schema, model, Types } from 'mongoose';
import { z } from 'zod';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../utils/AppError';
import express from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

// ==================== INTERFACES ====================

// Shipping Zone Interface
export interface IShippingZone {
    _id?: Types.ObjectId;
    name: string;                    // "Dhaka City", "Outside Dhaka", etc.
    areas: string[];                 // Districts/areas in this zone
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Shipping Rate Interface
export interface IShippingRate {
    _id?: Types.ObjectId;
    zone: Types.ObjectId;
    name: string;                    // "Standard Delivery", "Express Delivery"
    description?: string;
    price: number;                   // Base shipping cost
    freeShippingMinimum?: number;    // Free shipping above this amount
    estimatedDays: {
        min: number;
        max: number;
    };
    weightLimit?: number;            // Max weight in kg
    additionalPricePerKg?: number;   // Extra charge per kg over limit
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Shipment/Tracking Interface
export interface IShipment {
    _id?: Types.ObjectId;
    order: Types.ObjectId;

    // Carrier Info
    carrier: 'pathao' | 'steadfast' | 'redx' | 'paperfly' | 'manual';
    carrierOrderId?: string;
    trackingNumber?: string;
    trackingUrl?: string;

    // Shipping Details
    shippingZone: Types.ObjectId;
    shippingRate: Types.ObjectId;
    shippingCost: number;
    weight?: number;

    // Status
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';

    // Dates
    pickedUpAt?: Date;
    deliveredAt?: Date;

    // Tracking History
    trackingHistory: {
        status: string;
        location?: string;
        timestamp: Date;
        note?: string;
    }[];

    // Delivery Info
    deliveryAttempts: number;
    deliveryNote?: string;
    proofOfDelivery?: string;       // Image URL

    createdAt?: Date;
    updatedAt?: Date;
}

// ==================== MODELS ====================

// Shipping Zone Schema
const shippingZoneSchema = new Schema<IShippingZone>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        areas: [{
            type: String,
            trim: true,
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const ShippingZone = model<IShippingZone>('ShippingZone', shippingZoneSchema);

// Shipping Rate Schema
const shippingRateSchema = new Schema<IShippingRate>(
    {
        zone: {
            type: Schema.Types.ObjectId,
            ref: 'ShippingZone',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        freeShippingMinimum: {
            type: Number,
            min: 0,
        },
        estimatedDays: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
        },
        weightLimit: Number,
        additionalPricePerKg: Number,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const ShippingRate = model<IShippingRate>('ShippingRate', shippingRateSchema);

// Shipment Schema
const shipmentSchema = new Schema<IShipment>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        carrier: {
            type: String,
            enum: ['pathao', 'steadfast', 'redx', 'paperfly', 'manual'],
            default: 'manual',
        },
        carrierOrderId: String,
        trackingNumber: String,
        trackingUrl: String,
        shippingZone: {
            type: Schema.Types.ObjectId,
            ref: 'ShippingZone',
        },
        shippingRate: {
            type: Schema.Types.ObjectId,
            ref: 'ShippingRate',
        },
        shippingCost: {
            type: Number,
            required: true,
            default: 0,
        },
        weight: Number,
        status: {
            type: String,
            enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'],
            default: 'pending',
        },
        pickedUpAt: Date,
        deliveredAt: Date,
        trackingHistory: [{
            status: String,
            location: String,
            timestamp: { type: Date, default: Date.now },
            note: String,
        }],
        deliveryAttempts: {
            type: Number,
            default: 0,
        },
        deliveryNote: String,
        proofOfDelivery: String,
    },
    { timestamps: true }
);

// Indexes
shipmentSchema.index({ order: 1 });
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });

export const Shipment = model<IShipment>('Shipment', shipmentSchema);

// ==================== VALIDATIONS ====================
export const createZoneValidation = z.object({
    body: z.object({
        name: z.string().min(1, 'Zone name is required'),
        areas: z.array(z.string()).min(1, 'At least one area is required'),
        isActive: z.boolean().optional().default(true),
    }),
});

export const createRateValidation = z.object({
    body: z.object({
        zone: z.string(),
        name: z.string().min(1, 'Rate name is required'),
        description: z.string().optional(),
        price: z.number().min(0),
        freeShippingMinimum: z.number().min(0).optional(),
        estimatedDays: z.object({
            min: z.number().min(0),
            max: z.number().min(0),
        }),
        weightLimit: z.number().min(0).optional(),
        additionalPricePerKg: z.number().min(0).optional(),
        isActive: z.boolean().optional().default(true),
    }),
});

export const updateShipmentValidation = z.object({
    body: z.object({
        status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled']).optional(),
        trackingNumber: z.string().optional(),
        trackingUrl: z.string().optional(),
        deliveryNote: z.string().optional(),
    }),
});

// ==================== SERVICE ====================
const ShippingService = {
    // ==================== ZONES ====================
    async createZone(data: Partial<IShippingZone>): Promise<IShippingZone> {
        return ShippingZone.create(data);
    },

    async getAllZones(): Promise<IShippingZone[]> {
        return ShippingZone.find({ isActive: true }).sort({ name: 1 });
    },

    async getZoneById(id: string): Promise<IShippingZone | null> {
        return ShippingZone.findById(id);
    },

    async updateZone(id: string, data: Partial<IShippingZone>): Promise<IShippingZone | null> {
        return ShippingZone.findByIdAndUpdate(id, data, { new: true });
    },

    async deleteZone(id: string): Promise<void> {
        await ShippingZone.findByIdAndDelete(id);
    },

    // Find zone by area/city
    async findZoneByArea(area: string): Promise<IShippingZone | null> {
        return ShippingZone.findOne({
            areas: { $regex: new RegExp(area, 'i') },
            isActive: true,
        });
    },

    // ==================== RATES ====================
    async createRate(data: Partial<IShippingRate>): Promise<IShippingRate> {
        return ShippingRate.create(data);
    },

    async getRatesByZone(zoneId: string): Promise<IShippingRate[]> {
        return ShippingRate.find({ zone: zoneId, isActive: true }).sort({ price: 1 });
    },

    async getAllRates(): Promise<IShippingRate[]> {
        return ShippingRate.find({ isActive: true })
            .populate('zone', 'name')
            .sort({ 'zone.name': 1, price: 1 });
    },

    async updateRate(id: string, data: Partial<IShippingRate>): Promise<IShippingRate | null> {
        return ShippingRate.findByIdAndUpdate(id, data, { new: true });
    },

    async deleteRate(id: string): Promise<void> {
        await ShippingRate.findByIdAndDelete(id);
    },

    // Calculate shipping cost
    async calculateShippingCost(
        city: string,
        weight: number = 0,
        orderTotal: number
    ): Promise<{
        zone: IShippingZone | null;
        rates: {
            rateId: string;
            name: string;
            price: number;
            isFree: boolean;
            estimatedDays: { min: number; max: number };
        }[];
    }> {
        // Find zone
        const zone = await this.findZoneByArea(city);
        if (!zone) {
            // Return default "Outside" zone rates or throw error
            const defaultZone = await ShippingZone.findOne({ name: /outside|অন্যান্য/i, isActive: true });
            if (!defaultZone) {
                return { zone: null, rates: [] };
            }
            const rates = await this.getRatesByZone(defaultZone._id!.toString());
            return {
                zone: defaultZone,
                rates: rates.map(rate => ({
                    rateId: rate._id!.toString(),
                    name: rate.name,
                    price: rate.freeShippingMinimum && orderTotal >= rate.freeShippingMinimum ? 0 : rate.price,
                    isFree: !!(rate.freeShippingMinimum && orderTotal >= rate.freeShippingMinimum),
                    estimatedDays: rate.estimatedDays,
                })),
            };
        }

        // Get rates for zone
        const rates = await this.getRatesByZone(zone._id!.toString());

        return {
            zone,
            rates: rates.map(rate => {
                let price = rate.price;

                // Add weight-based pricing
                if (rate.weightLimit && weight > rate.weightLimit && rate.additionalPricePerKg) {
                    const extraWeight = weight - rate.weightLimit;
                    price += extraWeight * rate.additionalPricePerKg;
                }

                // Check free shipping
                const isFree = !!(rate.freeShippingMinimum && orderTotal >= rate.freeShippingMinimum);
                if (isFree) price = 0;

                return {
                    rateId: rate._id!.toString(),
                    name: rate.name,
                    price,
                    isFree,
                    estimatedDays: rate.estimatedDays,
                };
            }),
        };
    },

    // ==================== SHIPMENTS ====================
    async createShipment(orderId: string, shippingCost: number): Promise<IShipment> {
        const shipment = await Shipment.create({
            order: new Types.ObjectId(orderId),
            shippingCost,
            status: 'pending',
            trackingHistory: [{
                status: 'Order placed',
                timestamp: new Date(),
            }],
        });
        return shipment;
    },

    async getShipmentByOrder(orderId: string): Promise<IShipment | null> {
        return Shipment.findOne({ order: orderId })
            .populate('shippingZone', 'name')
            .populate('shippingRate', 'name estimatedDays');
    },

    async updateShipmentStatus(
        shipmentId: string,
        status: IShipment['status'],
        note?: string,
        location?: string
    ): Promise<IShipment | null> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) return null;

        shipment.status = status;
        shipment.trackingHistory.push({
            status,
            location,
            timestamp: new Date(),
            note,
        });

        // Update dates based on status
        if (status === 'picked_up') {
            shipment.pickedUpAt = new Date();
        } else if (status === 'delivered') {
            shipment.deliveredAt = new Date();

            // Update order status
            const { Order } = await import('../order/order.module');
            await Order.findByIdAndUpdate(shipment.order, { status: 'delivered' });
        }

        await shipment.save();
        return shipment;
    },

    async updateTrackingInfo(
        shipmentId: string,
        trackingNumber: string,
        trackingUrl?: string,
        carrier?: IShipment['carrier']
    ): Promise<IShipment | null> {
        const updateData: any = { trackingNumber };
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
        if (carrier) updateData.carrier = carrier;

        return Shipment.findByIdAndUpdate(shipmentId, updateData, { new: true });
    },

    // Get tracking info (public)
    async getTrackingInfo(trackingNumber: string): Promise<{
        order: any;
        shipment: IShipment;
    } | null> {
        const shipment = await Shipment.findOne({ trackingNumber })
            .populate('shippingZone', 'name')
            .lean();

        if (!shipment) return null;

        const { Order } = await import('../order/order.module');
        const order = await Order.findById(shipment.order)
            .select('orderNumber status shippingAddress createdAt')
            .lean();

        return { order, shipment: shipment as IShipment };
    },

    // Admin: Get all shipments
    async getAllShipments(
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<{ data: IShipment[]; total: number }> {
        const query: any = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [shipments, total] = await Promise.all([
            Shipment.find(query)
                .populate('order', 'orderNumber total shippingAddress')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Shipment.countDocuments(query),
        ]);

        return { data: shipments as IShipment[], total };
    },

    // Shipping statistics
    async getShippingStats(): Promise<{
        totalShipments: number;
        pending: number;
        inTransit: number;
        delivered: number;
        returned: number;
        avgDeliveryDays: number;
    }> {
        const [
            totalShipments,
            pending,
            inTransit,
            delivered,
            returned,
            avgDeliveryResult,
        ] = await Promise.all([
            Shipment.countDocuments({}),
            Shipment.countDocuments({ status: 'pending' }),
            Shipment.countDocuments({ status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] } }),
            Shipment.countDocuments({ status: 'delivered' }),
            Shipment.countDocuments({ status: 'returned' }),
            Shipment.aggregate([
                { $match: { status: 'delivered', deliveredAt: { $exists: true } } },
                {
                    $project: {
                        deliveryDays: {
                            $divide: [
                                { $subtract: ['$deliveredAt', '$createdAt'] },
                                1000 * 60 * 60 * 24, // Convert to days
                            ],
                        },
                    },
                },
                { $group: { _id: null, avg: { $avg: '$deliveryDays' } } },
            ]),
        ]);

        return {
            totalShipments,
            pending,
            inTransit,
            delivered,
            returned,
            avgDeliveryDays: Math.round((avgDeliveryResult[0]?.avg || 0) * 10) / 10,
        };
    },
};

// ==================== CONTROLLER ====================
const ShippingController = {
    // ========== ZONES ==========
    createZone: catchAsync(async (req: Request, res: Response) => {
        const zone = await ShippingService.createZone(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Shipping zone created',
            data: zone,
        });
    }),

    getAllZones: catchAsync(async (req: Request, res: Response) => {
        const zones = await ShippingService.getAllZones();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping zones fetched',
            data: zones,
        });
    }),

    updateZone: catchAsync(async (req: Request, res: Response) => {
        const zone = await ShippingService.updateZone(req.params.id, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping zone updated',
            data: zone,
        });
    }),

    deleteZone: catchAsync(async (req: Request, res: Response) => {
        await ShippingService.deleteZone(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping zone deleted',
            data: null,
        });
    }),

    // ========== RATES ==========
    createRate: catchAsync(async (req: Request, res: Response) => {
        const rate = await ShippingService.createRate(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Shipping rate created',
            data: rate,
        });
    }),

    getAllRates: catchAsync(async (req: Request, res: Response) => {
        const rates = await ShippingService.getAllRates();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping rates fetched',
            data: rates,
        });
    }),

    getRatesByZone: catchAsync(async (req: Request, res: Response) => {
        const rates = await ShippingService.getRatesByZone(req.params.zoneId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping rates fetched',
            data: rates,
        });
    }),

    updateRate: catchAsync(async (req: Request, res: Response) => {
        const rate = await ShippingService.updateRate(req.params.id, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping rate updated',
            data: rate,
        });
    }),

    deleteRate: catchAsync(async (req: Request, res: Response) => {
        await ShippingService.deleteRate(req.params.id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping rate deleted',
            data: null,
        });
    }),

    // Calculate shipping cost (public)
    calculateCost: catchAsync(async (req: Request, res: Response) => {
        const { city, weight, orderTotal } = req.query;
        const result = await ShippingService.calculateShippingCost(
            city as string,
            Number(weight) || 0,
            Number(orderTotal) || 0
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping cost calculated',
            data: result,
        });
    }),

    // ========== SHIPMENTS ==========
    getShipmentByOrder: catchAsync(async (req: Request, res: Response) => {
        const shipment = await ShippingService.getShipmentByOrder(req.params.orderId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipment fetched',
            data: shipment,
        });
    }),

    updateShipmentStatus: catchAsync(async (req: Request, res: Response) => {
        const { status, note, location } = req.body;
        const shipment = await ShippingService.updateShipmentStatus(
            req.params.id,
            status,
            note,
            location
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipment status updated',
            data: shipment,
        });
    }),

    updateTrackingInfo: catchAsync(async (req: Request, res: Response) => {
        const { trackingNumber, trackingUrl, carrier } = req.body;
        const shipment = await ShippingService.updateTrackingInfo(
            req.params.id,
            trackingNumber,
            trackingUrl,
            carrier
        );
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Tracking info updated',
            data: shipment,
        });
    }),

    // Track shipment (public)
    trackShipment: catchAsync(async (req: Request, res: Response) => {
        const result = await ShippingService.getTrackingInfo(req.params.trackingNumber);
        if (!result) {
            throw new AppError(404, 'Shipment not found');
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Tracking info fetched',
            data: result,
        });
    }),

    getAllShipments: catchAsync(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status as string;

        const result = await ShippingService.getAllShipments(page, limit, status);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipments fetched',
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
            data: result.data,
        });
    }),

    getShippingStats: catchAsync(async (req: Request, res: Response) => {
        const stats = await ShippingService.getShippingStats();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Shipping statistics fetched',
            data: stats,
        });
    }),
};

// ==================== ROUTES ====================
const router = express.Router();

// Public routes
router.get('/calculate', ShippingController.calculateCost);
router.get('/track/:trackingNumber', ShippingController.trackShipment);
router.get('/zones', ShippingController.getAllZones);
router.get('/rates', ShippingController.getAllRates);
router.get('/rates/zone/:zoneId', ShippingController.getRatesByZone);

// Customer routes
router.get('/order/:orderId', authMiddleware, ShippingController.getShipmentByOrder);

// Admin routes
router.use(authMiddleware, authorizeRoles('admin', 'super_admin'));

// Zone management
router.post('/zones', validateRequest(createZoneValidation), ShippingController.createZone);
router.patch('/zones/:id', ShippingController.updateZone);
router.delete('/zones/:id', ShippingController.deleteZone);

// Rate management
router.post('/rates', validateRequest(createRateValidation), ShippingController.createRate);
router.patch('/rates/:id', ShippingController.updateRate);
router.delete('/rates/:id', ShippingController.deleteRate);

// Shipment management
router.get('/shipments', ShippingController.getAllShipments);
router.get('/stats', ShippingController.getShippingStats);
router.patch('/shipments/:id/status', validateRequest(updateShipmentValidation), ShippingController.updateShipmentStatus);
router.patch('/shipments/:id/tracking', ShippingController.updateTrackingInfo);

export const ShippingRoutes = router;
export default ShippingService;
