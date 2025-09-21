import express from 'express';
import { getFirestore, COLLECTIONS } from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get market intelligence data
router.get('/intelligence',
  optionalAuth,
  async (req, res) => {
    try {
      const category = req.query.category as string;
      const region = req.query.region as string;
      const firestore = getFirestore();

      let query = firestore
        .collection(COLLECTIONS.MARKET_INTELLIGENCE)
        .orderBy('createdAt', 'desc')
        .limit(1);

      if (category) {
        query = query.where('category', '==', category);
      }
      if (region) {
        query = query.where('region', '==', region);
      }

      const snapshot = await query.get();
      
      if (snapshot.empty) {
        // Return default market data if no intelligence available
        const defaultData = {
          demandTrend: 'stable',
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          topKeywords: [],
          seasonalTrends: [],
          competitorAnalysis: [],
          recommendations: ['Focus on quality', 'Improve product photography', 'Engage with customers']
        };

        return res.json({
          success: true,
          data: defaultData,
          message: 'Default market intelligence retrieved'
        });
      }

      const intelligence = snapshot.docs[0].data();

      res.json({
        success: true,
        data: intelligence,
        message: 'Market intelligence retrieved successfully'
      });

    } catch (error) {
      logger.error('Get market intelligence error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get market intelligence',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get trending products
router.get('/trending',
  optionalAuth,
  async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const firestore = getFirestore();

      // Get products with highest view count or most recent orders
      const snapshot = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit * 2) // Get more to filter
        .get();

      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Simple trending algorithm based on recent creation and price
      const trendingProducts = products
        .sort((a, b) => {
          const aScore = this.calculateTrendingScore(a);
          const bScore = this.calculateTrendingScore(b);
          return bScore - aScore;
        })
        .slice(0, limit);

      res.json({
        success: true,
        data: trendingProducts,
        message: 'Trending products retrieved successfully'
      });

    } catch (error) {
      logger.error('Get trending products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get categories
router.get('/categories',
  async (req, res) => {
    try {
      const firestore = getFirestore();

      const snapshot = await firestore
        .collection(COLLECTIONS.CATEGORIES)
        .orderBy('name')
        .get();

      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      });

    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get regions/states
router.get('/regions',
  async (req, res) => {
    try {
      // Static list of Indian states for now
      const regions = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
      ];

      res.json({
        success: true,
        data: regions,
        message: 'Regions retrieved successfully'
      });

    } catch (error) {
      logger.error('Get regions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get regions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get craft types
router.get('/craft-types',
  async (req, res) => {
    try {
      const firestore = getFirestore();

      const snapshot = await firestore
        .collection(COLLECTIONS.CATEGORIES)
        .where('type', '==', 'craft')
        .orderBy('name')
        .get();

      const craftTypes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no craft types in database, return default list
      if (craftTypes.length === 0) {
        const defaultCraftTypes = [
          'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
          'Bamboo Crafts', 'Leather Work', 'Stone Carving', 'Embroidery',
          'Weaving', 'Painting', 'Sculpture', 'Basketry', 'Carpentry'
        ];

        return res.json({
          success: true,
          data: defaultCraftTypes.map((name, index) => ({ id: index.toString(), name })),
          message: 'Default craft types retrieved'
        });
      }

      res.json({
        success: true,
        data: craftTypes,
        message: 'Craft types retrieved successfully'
      });

    } catch (error) {
      logger.error('Get craft types error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get craft types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get analytics data
router.get('/analytics',
  optionalAuth,
  async (req, res) => {
    try {
      const firestore = getFirestore();

      // Get basic platform statistics
      const [
        productsSnapshot,
        artisansSnapshot,
        ordersSnapshot
      ] = await Promise.all([
        firestore.collection(COLLECTIONS.PRODUCTS).where('isActive', '==', true).get(),
        firestore.collection(COLLECTIONS.ARTISANS).where('verificationStatus', '==', 'verified').get(),
        firestore.collection(COLLECTIONS.ORDERS).get()
      ]);

      const analytics = {
        totalProducts: productsSnapshot.size,
        totalArtisans: artisansSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalRevenue: ordersSnapshot.docs.reduce((sum, doc) => {
          const order = doc.data();
          return sum + (order.totalAmount || 0);
        }, 0)
      };

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics data retrieved successfully'
      });

    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Helper function to calculate trending score
function calculateTrendingScore(product: any): number {
  const now = new Date();
  const createdAt = product.createdAt?.toDate() || now;
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // Higher score for newer products
  const recencyScore = Math.max(0, 30 - daysSinceCreation) / 30;
  
  // Higher score for lower prices (more accessible)
  const priceScore = Math.max(0, 1 - (product.price || 0) / 10000);
  
  // Higher score for products with more images
  const imageScore = Math.min(1, (product.images?.length || 0) / 5);
  
  return (recencyScore * 0.4) + (priceScore * 0.3) + (imageScore * 0.3);
}

export default router;
