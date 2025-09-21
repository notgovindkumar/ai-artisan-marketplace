import express from 'express';
import Razorpay from 'razorpay';
import { getFirestore, COLLECTIONS } from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Create payment order
router.post('/create-order',
  authMiddleware,
  validateRequest(schemas.order),
  async (req, res) => {
    try {
      const { products, shippingAddress, billingAddress, notes } = req.body;
      const buyerId = req.user?.id;
      const firestore = getFirestore();

      // Calculate total amount
      const totalAmount = products.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Get artisan IDs from products
      const productIds = products.map((item: any) => item.productId);
      const productDocs = await Promise.all(
        productIds.map((id: string) => 
          firestore.collection(COLLECTIONS.PRODUCTS).doc(id).get()
        )
      );

      const artisanIds = [...new Set(
        productDocs
          .filter(doc => doc.exists)
          .map(doc => doc.data()?.artisanId)
      )];

      if (artisanIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid products found'
        });
      }

      // Create order in database
      const orderData = {
        buyerId,
        artisanId: artisanIds[0], // For now, assume single artisan orders
        products,
        totalAmount,
        currency: 'INR',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes
      };

      const orderRef = await firestore.collection(COLLECTIONS.ORDERS).add(orderData);
      const orderId = orderRef.id;

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          orderId,
          buyerId,
          artisanId: artisanIds[0]
        }
      });

      logger.info(`Payment order created: ${orderId} for buyer ${buyerId}`);

      res.json({
        success: true,
        data: {
          orderId,
          razorpayOrderId: razorpayOrder.id,
          amount: totalAmount,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID
        },
        message: 'Payment order created successfully'
      });

    } catch (error) {
      logger.error('Create payment order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Verify payment
router.post('/verify',
  authMiddleware,
  async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const buyerId = req.user?.id;

      // Verify payment signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      const isValidSignature = generatedSignature === razorpay_signature;

      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Get order from Razorpay
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
      const orderId = razorpayOrder.notes.orderId;

      const firestore = getFirestore();

      // Update order status
      await firestore.collection(COLLECTIONS.ORDERS).doc(orderId).update({
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        updatedAt: new Date()
      });

      // Update artisan sales
      const orderDoc = await firestore.collection(COLLECTIONS.ORDERS).doc(orderId).get();
      const orderData = orderDoc.data();
      
      if (orderData) {
        await firestore.collection(COLLECTIONS.ARTISANS).doc(orderData.artisanId).update({
          totalSales: firestore.FieldValue.increment(orderData.totalAmount),
          updatedAt: new Date()
        });
      }

      logger.info(`Payment verified: ${razorpay_payment_id} for order ${orderId}`);

      res.json({
        success: true,
        data: {
          orderId,
          paymentId: razorpay_payment_id,
          status: 'paid'
        },
        message: 'Payment verified successfully'
      });

    } catch (error) {
      logger.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get payment methods
router.get('/methods',
  async (req, res) => {
    try {
      const paymentMethods = [
        {
          id: 'razorpay',
          name: 'Razorpay',
          description: 'Pay with UPI, Cards, Wallets, Net Banking',
          icon: 'credit-card',
          enabled: true
        },
        {
          id: 'upi',
          name: 'UPI',
          description: 'Pay using UPI ID or QR Code',
          icon: 'smartphone',
          enabled: true
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          description: 'Pay when you receive the product',
          icon: 'money',
          enabled: true
        }
      ];

      res.json({
        success: true,
        data: paymentMethods,
        message: 'Payment methods retrieved successfully'
      });

    } catch (error) {
      logger.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get order history
router.get('/orders',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const firestore = getFirestore();

      let query = firestore.collection(COLLECTIONS.ORDERS);

      // Filter by user role
      if (userRole === 'artisan') {
        query = query.where('artisanId', '==', userId);
      } else {
        query = query.where('buyerId', '==', userId);
      }

      query = query.orderBy('createdAt', 'desc')
        .offset((page - 1) * limit)
        .limit(limit);

      const snapshot = await query.get();
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get total count
      let countQuery = firestore.collection(COLLECTIONS.ORDERS);
      if (userRole === 'artisan') {
        countQuery = countQuery.where('artisanId', '==', userId);
      } else {
        countQuery = countQuery.where('buyerId', '==', userId);
      }

      const countSnapshot = await countQuery.get();
      const total = countSnapshot.size;

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Orders retrieved successfully'
      });

    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get single order
router.get('/orders/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const firestore = getFirestore();

      const orderDoc = await firestore.collection(COLLECTIONS.ORDERS).doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const order = orderDoc.data();

      // Check if user can access this order
      if (userRole === 'artisan' && order?.artisanId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }

      if (userRole === 'buyer' && order?.buyerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }

      res.json({
        success: true,
        data: {
          id: orderDoc.id,
          ...order
        },
        message: 'Order retrieved successfully'
      });

    } catch (error) {
      logger.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
