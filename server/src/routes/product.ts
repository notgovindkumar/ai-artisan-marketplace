import express from 'express';
import { getFirestore, COLLECTIONS } from '../config/database';
import { authMiddleware, requireArtisan, optionalAuth } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { Product, ProductSearchFilters, SearchResult } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// Create new product
router.post('/',
  authMiddleware,
  requireArtisan,
  validateRequest(schemas.product),
  async (req, res) => {
    try {
      const artisanId = req.user?.id;
      const productData = req.body;
      const firestore = getFirestore();

      const product: Omit<Product, 'id'> = {
        ...productData,
        artisanId: artisanId!,
        images: [], // Will be updated after image upload
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        aiGenerated: false,
        seoKeywords: [],
        culturalStory: undefined,
        videoUrl: undefined,
        audioDescription: undefined
      };

      const productRef = await firestore.collection(COLLECTIONS.PRODUCTS).add(product);
      const productId = productRef.id;

      logger.info(`Product created: ${productId} by artisan ${artisanId}`);

      res.status(201).json({
        success: true,
        data: { productId },
        message: 'Product created successfully'
      });

    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get products with search and filters
router.get('/',
  optionalAuth,
  async (req, res) => {
    try {
      const filters: ProductSearchFilters = {
        category: req.query.category as string,
        subcategory: req.query.subcategory as string,
        priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
        priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
        artisanId: req.query.artisanId as string,
        region: req.query.region as string,
        materials: req.query.materials ? (req.query.materials as string).split(',') : undefined,
        techniques: req.query.techniques ? (req.query.techniques as string).split(',') : undefined,
        availability: req.query.availability as string,
        rating: req.query.rating ? Number(req.query.rating) : undefined,
        sortBy: (req.query.sortBy as string) || 'newest',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const firestore = getFirestore();
      let query = firestore.collection(COLLECTIONS.PRODUCTS)
        .where('isActive', '==', true);

      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.subcategory) {
        query = query.where('subcategory', '==', filters.subcategory);
      }
      if (filters.artisanId) {
        query = query.where('artisanId', '==', filters.artisanId);
      }
      if (filters.availability) {
        query = query.where('availability', '==', filters.availability);
      }

      // Apply price range
      if (filters.priceMin !== undefined) {
        query = query.where('price', '>=', filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        query = query.where('price', '<=', filters.priceMax);
      }

      // Get total count for pagination
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Apply pagination
      const offset = (filters.page! - 1) * filters.limit!;
      query = query.offset(offset).limit(filters.limit!);

      // Apply sorting
      const sortField = this.getSortField(filters.sortBy!);
      query = query.orderBy(sortField, filters.sortOrder as 'asc' | 'desc');

      const snapshot = await query.get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Apply client-side filters for materials and techniques
      let filteredProducts = products;
      if (filters.materials && filters.materials.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.materials!.some(material =>
            product.materials.some(pMaterial =>
              pMaterial.toLowerCase().includes(material.toLowerCase())
            )
          )
        );
      }

      if (filters.techniques && filters.techniques.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.techniques!.some(technique =>
            product.techniques.some(pTechnique =>
              pTechnique.toLowerCase().includes(technique.toLowerCase())
            )
          )
        );
      }

      const result: SearchResult<Product> = {
        items: filteredProducts,
        total: filteredProducts.length,
        page: filters.page!,
        limit: filters.limit!,
        totalPages: Math.ceil(total / filters.limit!),
        filters
      };

      res.json({
        success: true,
        data: result,
        message: 'Products retrieved successfully'
      });

    } catch (error) {
      logger.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get single product by ID
router.get('/:id',
  optionalAuth,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const firestore = getFirestore();

      const productDoc = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const product = {
        id: productDoc.id,
        ...productDoc.data()
      } as Product;

      // Get artisan information
      const artisanDoc = await firestore
        .collection(COLLECTIONS.ARTISANS)
        .doc(product.artisanId)
        .get();

      const artisan = artisanDoc.exists ? {
        id: artisanDoc.id,
        ...artisanDoc.data()
      } : null;

      res.json({
        success: true,
        data: {
          product,
          artisan
        },
        message: 'Product retrieved successfully'
      });

    } catch (error) {
      logger.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update product
router.put('/:id',
  authMiddleware,
  requireArtisan,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const artisanId = req.user?.id;
      const updates = req.body;
      const firestore = getFirestore();

      // Verify product ownership
      const productDoc = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const product = productDoc.data() as Product;
      if (product.artisanId !== artisanId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this product'
        });
      }

      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.artisanId;
      delete updates.createdAt;

      updates.updatedAt = new Date();

      await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .update(updates);

      logger.info(`Product updated: ${productId} by artisan ${artisanId}`);

      res.json({
        success: true,
        message: 'Product updated successfully'
      });

    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete product
router.delete('/:id',
  authMiddleware,
  requireArtisan,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const artisanId = req.user?.id;
      const firestore = getFirestore();

      // Verify product ownership
      const productDoc = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const product = productDoc.data() as Product;
      if (product.artisanId !== artisanId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this product'
        });
      }

      // Soft delete by setting isActive to false
      await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .doc(productId)
        .update({
          isActive: false,
          updatedAt: new Date()
        });

      logger.info(`Product deleted: ${productId} by artisan ${artisanId}`);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get artisan's products
router.get('/artisan/:artisanId',
  optionalAuth,
  async (req, res) => {
    try {
      const artisanId = req.params.artisanId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const firestore = getFirestore();

      const query = firestore
        .collection(COLLECTIONS.PRODUCTS)
        .where('artisanId', '==', artisanId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .offset((page - 1) * limit)
        .limit(limit);

      const snapshot = await query.get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Get total count
      const totalSnapshot = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .where('artisanId', '==', artisanId)
        .where('isActive', '==', true)
        .get();

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total: totalSnapshot.size,
            totalPages: Math.ceil(totalSnapshot.size / limit)
          }
        },
        message: 'Artisan products retrieved successfully'
      });

    } catch (error) {
      logger.error('Get artisan products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get artisan products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Helper function to get sort field
function getSortField(sortBy: string): string {
  const sortFields: Record<string, string> = {
    'price': 'price',
    'rating': 'rating',
    'newest': 'createdAt',
    'popular': 'viewCount'
  };
  return sortFields[sortBy] || 'createdAt';
}

export default router;
