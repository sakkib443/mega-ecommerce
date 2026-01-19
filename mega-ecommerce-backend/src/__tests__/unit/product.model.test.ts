// ===================================================================
// Mega E-Commerce Backend - Product Service Tests
// Unit tests for product functionality
// ===================================================================

import { describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { Product } from '../../app/modules/product/product.model';
import { Category } from '../../app/modules/category/category.model';

describe('Product Model', () => {
    let testCategory: any;

    beforeEach(async () => {
        // Create a test category for products
        testCategory = await Category.create({
            name: `Test Category ${Date.now()}`,
            slug: `test-category-${Date.now()}`,
            description: 'Test category for products',
            status: 'active',
        });
    });

    // ==================== Create Product Tests ====================
    describe('Create Product', () => {
        it('should create a product with valid data', async () => {
            const productData = {
                name: 'Test Product',
                slug: `test-product-${Date.now()}`,
                description: 'This is a test product',
                price: 999,
                quantity: 100,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
                status: 'active',
            };

            const product = await Product.create(productData);

            expect(product).toBeDefined();
            expect(product.name).toBe(productData.name);
            expect(product.price).toBe(productData.price);
            expect(product.quantity).toBe(productData.quantity);
            expect(product.status).toBe('active');
        });

        it('should fail without required fields', async () => {
            const invalidProduct = {
                name: 'Incomplete Product',
                // Missing required fields
            };

            await expect(Product.create(invalidProduct)).rejects.toThrow();
        });

        it('should auto-generate slug from name', async () => {
            const product = await Product.create({
                name: 'Auto Slug Product',
                description: 'Product with auto slug',
                price: 500,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
            });

            expect(product.slug).toBeDefined();
            expect(product.slug).toContain('auto-slug-product');
        });
    });

    // ==================== Virtual Properties Tests ====================
    describe('Virtual Properties', () => {
        it('should calculate isInStock correctly', async () => {
            const productInStock = await Product.create({
                name: 'In Stock Product',
                slug: `in-stock-${Date.now()}`,
                description: 'Product with stock',
                price: 500,
                quantity: 50,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
                trackQuantity: true,
            });

            const productOutOfStock = await Product.create({
                name: 'Out of Stock Product',
                slug: `out-stock-${Date.now()}`,
                description: 'Product without stock',
                price: 500,
                quantity: 0,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
                trackQuantity: true,
            });

            expect(productInStock.isInStock).toBe(true);
            expect(productOutOfStock.isInStock).toBe(false);
        });

        it('should calculate discountPercentage correctly', async () => {
            const product = await Product.create({
                name: 'Discounted Product',
                slug: `discount-${Date.now()}`,
                description: 'Product with discount',
                price: 800,
                comparePrice: 1000,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
            });

            expect(product.discountPercentage).toBe(20); // 20% discount
        });

        it('should detect low stock correctly', async () => {
            const lowStockProduct = await Product.create({
                name: 'Low Stock Product',
                slug: `low-stock-${Date.now()}`,
                description: 'Product with low stock',
                price: 500,
                quantity: 3,
                lowStockThreshold: 5,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
                trackQuantity: true,
            });

            expect(lowStockProduct.isLowStock).toBe(true);
        });
    });

    // ==================== Query Tests ====================
    describe('Product Queries', () => {
        beforeEach(async () => {
            // Create multiple products for query tests
            await Product.create([
                {
                    name: 'Query Product 1',
                    slug: `query-1-${Date.now()}`,
                    description: 'First query test product',
                    price: 100,
                    category: testCategory._id,
                    thumbnail: 'https://example.com/1.jpg',
                    status: 'active',
                    isFeatured: true,
                },
                {
                    name: 'Query Product 2',
                    slug: `query-2-${Date.now()}`,
                    description: 'Second query test product',
                    price: 200,
                    category: testCategory._id,
                    thumbnail: 'https://example.com/2.jpg',
                    status: 'active',
                    isFeatured: false,
                },
                {
                    name: 'Query Product 3',
                    slug: `query-3-${Date.now()}`,
                    description: 'Third query test product',
                    price: 300,
                    category: testCategory._id,
                    thumbnail: 'https://example.com/3.jpg',
                    status: 'draft',
                },
            ]);
        });

        it('should find products by category', async () => {
            const products = await Product.find({ category: testCategory._id });
            expect(products.length).toBeGreaterThanOrEqual(3);
        });

        it('should find featured products', async () => {
            const featuredProducts = await Product.find({ isFeatured: true });
            expect(featuredProducts.length).toBeGreaterThanOrEqual(1);
        });

        it('should find active products', async () => {
            const activeProducts = await Product.find({ status: 'active' });
            activeProducts.forEach((product) => {
                expect(product.status).toBe('active');
            });
        });

        it('should sort products by price', async () => {
            const productsByPrice = await Product.find({
                category: testCategory._id,
            }).sort({ price: 1 });

            for (let i = 1; i < productsByPrice.length; i++) {
                expect(productsByPrice[i].price).toBeGreaterThanOrEqual(
                    productsByPrice[i - 1].price
                );
            }
        });
    });

    // ==================== Update Product Tests ====================
    describe('Update Product', () => {
        it('should update product price', async () => {
            const product = await Product.create({
                name: 'Update Test Product',
                slug: `update-test-${Date.now()}`,
                description: 'Product to update',
                price: 500,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
            });

            const updated = await Product.findByIdAndUpdate(
                product._id,
                { price: 750 },
                { new: true }
            );

            expect(updated?.price).toBe(750);
        });

        it('should update product status', async () => {
            const product = await Product.create({
                name: 'Status Test Product',
                slug: `status-test-${Date.now()}`,
                description: 'Product to change status',
                price: 500,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
                status: 'draft',
            });

            const updated = await Product.findByIdAndUpdate(
                product._id,
                { status: 'active' },
                { new: true }
            );

            expect(updated?.status).toBe('active');
            expect(updated?.publishedAt).toBeDefined();
        });
    });

    // ==================== Delete Product Tests ====================
    describe('Delete Product', () => {
        it('should delete product by id', async () => {
            const product = await Product.create({
                name: 'Delete Test Product',
                slug: `delete-test-${Date.now()}`,
                description: 'Product to delete',
                price: 500,
                category: testCategory._id,
                thumbnail: 'https://example.com/image.jpg',
            });

            await Product.findByIdAndDelete(product._id);

            const deleted = await Product.findById(product._id);
            expect(deleted).toBeNull();
        });
    });
});
