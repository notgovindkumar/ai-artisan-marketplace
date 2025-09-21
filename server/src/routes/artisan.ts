import express from 'express';
import { getFirestore, COLLECTIONS } from '../config/database';
import { authMiddleware, requireArtisan, optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all artisans
router.get('/',
  optionalAuth,
  async (req, res) => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const state = req.query.state as string;
      const craftType = req.query.craftType as string;
      const firestore = getFirestore();

      let query = firestore
        .collection(COLLECTIONS.ARTISANS)
        .where('verificationStatus', '==', 'verified')
        .orderBy('rating', 'desc')
        .offset((page - 1) * limit)
        .limit(limit);

      // Apply filters
      if (state) {
        query = query.where('location.state', '==', state);
      }

      const snapshot = await query.get();
      const artisans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by craft type if specified
      let filteredArtisans = artisans;
      if (craftType) {
        filteredArtisans = artisans.filter((artisan: any) =>
          artisan.craftSpecialization?.some((craft: string) =>
            craft.toLowerCase().includes(craftType.toLowerCase())
          )
        );
      }

      // Get total count
      const totalSnapshot = await firestore
        .collection(COLLECTIONS.ARTISANS)
        .where('verificationStatus', '==', 'verified')
        .get();

      res.json({
        success: true,
        data: {
          artisans: filteredArtisans,
          pagination: {
            page,
            limit,
            total: totalSnapshot.size,
            totalPages: Math.ceil(totalSnapshot.size / limit)
          }
        },
        message: 'Artisans retrieved successfully'
      });

    } catch (error) {
      logger.error('Get artisans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get artisans',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get single artisan by ID
router.get('/:id',
  optionalAuth,
  async (req, res) => {
    try {
      const artisanId = req.params.id;
      const firestore = getFirestore();

      const artisanDoc = await firestore
        .collection(COLLECTIONS.ARTISANS)
        .doc(artisanId)
        .get();

      if (!artisanDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Artisan not found'
        });
      }

      const artisan = {
        id: artisanDoc.id,
        ...artisanDoc.data()
      };

      // Get artisan's products count
      const productsSnapshot = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .where('artisanId', '==', artisanId)
        .where('isActive', '==', true)
        .get();

      const productsCount = productsSnapshot.size;

      res.json({
        success: true,
        data: {
          artisan,
          productsCount
        },
        message: 'Artisan retrieved successfully'
      });

    } catch (error) {
      logger.error('Get artisan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get artisan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get artisan's dashboard data
router.get('/:id/dashboard',
  authMiddleware,
  requireArtisan,
  async (req, res) => {
    try {
      const artisanId = req.params.id;
      const requestingUserId = req.user?.id;

      // Verify artisan can access this dashboard
      if (artisanId !== requestingUserId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this dashboard'
        });
      }

      const firestore = getFirestore();

      // Get artisan data
      const artisanDoc = await firestore
        .collection(COLLECTIONS.ARTISANS)
        .doc(artisanId)
        .get();

      if (!artisanDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Artisan not found'
        });
      }

      const artisan = {
        id: artisanDoc.id,
        ...artisanDoc.data()
      };

      // Get products count
      const productsSnapshot = await firestore
        .collection(COLLECTIONS.PRODUCTS)
        .where('artisanId', '==', artisanId)
        .where('isActive', '==', true)
        .get();

      const productsCount = productsSnapshot.size;

      // Get orders count (pending, processing, completed)
      const ordersSnapshot = await firestore
        .collection(COLLECTIONS.ORDERS)
        .where('artisanId', '==', artisanId)
        .get();

      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const ordersCount = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
        completed: orders.filter(order => order.status === 'delivered').length
      };

      // Get recent orders
      const recentOrdersSnapshot = await firestore
        .collection(COLLECTIONS.ORDERS)
        .where('artisanId', '==', artisanId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get analytics data (simplified)
      const analytics = {
        totalSales: artisan.totalSales || 0,
        rating: artisan.rating || 0,
        productsCount,
        ordersCount,
        recentOrders
      };

      res.json({
        success: true,
        data: analytics,
        message: 'Dashboard data retrieved successfully'
      });

    } catch (error) {
      logger.error('Get artisan dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update artisan verification status (admin only)
router.put('/:id/verify',
  authMiddleware,
  async (req, res) => {
    try {
      const artisanId = req.params.id;
      const { status, notes } = req.body;
      const adminId = req.user?.id;

      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status'
        });
      }

      const firestore = getFirestore();

      await firestore
        .collection(COLLECTIONS.ARTISANS)
        .doc(artisanId)
        .update({
          verificationStatus: status,
          verificationNotes: notes,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          updatedAt: new Date()
        });

      logger.info(`Artisan verification updated: ${artisanId} by admin ${adminId}`);

      res.json({
        success: true,
        message: 'Artisan verification status updated successfully'
      });

    } catch (error) {
      logger.error('Update artisan verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update verification status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
