import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getFirestore, COLLECTIONS } from '../config/database';
import { validateRequest, schemas } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { User, ArtisanProfile } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// Register new user
router.post('/register', 
  validateRequest(schemas.register),
  async (req, res) => {
    try {
      const { name, email, phone, password, role, language } = req.body;
      const firestore = getFirestore();

      // Check if user already exists
      const existingUser = await firestore
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user document
      const userData: Omit<User, 'id'> = {
        name,
        email,
        phone,
        role,
        language: language || 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        profileImage: undefined
      };

      const userRef = await firestore.collection(COLLECTIONS.USERS).add(userData);
      const userId = userRef.id;

      // Create artisan profile if role is artisan
      if (role === 'artisan') {
        const artisanData: Omit<ArtisanProfile, 'id'> = {
          ...userData,
          role: 'artisan',
          craftSpecialization: [],
          experience: 0,
          location: {
            state: '',
            city: '',
            pincode: ''
          },
          culturalBackground: {
            familyHistory: '',
            learningJourney: '',
            traditions: [],
            techniques: []
          },
          businessInfo: {},
          verificationStatus: 'pending',
          rating: 0,
          totalSales: 0,
          joinedDate: new Date()
        };

        await firestore.collection(COLLECTIONS.ARTISANS).doc(userId).set(artisanData);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: userId,
            name,
            email,
            role,
            language: language || 'en'
          },
          token
        },
        message: 'User registered successfully'
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Login user
router.post('/login',
  validateRequest(schemas.login),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const firestore = getFirestore();

      // Find user by email
      const userQuery = await firestore
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as User;

      // Check if account is active
      if (!userData.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userData.password || '');
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: userDoc.id, role: userData.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            language: userData.language
          },
          token
        },
        message: 'Login successful'
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get current user profile
router.get('/me',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const firestore = getFirestore();

      // Get user data
      const userDoc = await firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId!)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data() as User;

      // Get artisan profile if user is artisan
      let artisanProfile = null;
      if (userData.role === 'artisan') {
        const artisanDoc = await firestore
          .collection(COLLECTIONS.ARTISANS)
          .doc(userId!)
          .get();

        if (artisanDoc.exists) {
          artisanProfile = artisanDoc.data();
        }
      }

      res.json({
        success: true,
        data: {
          user: {
            id: userDoc.id,
            ...userData
          },
          artisanProfile
        },
        message: 'Profile retrieved successfully'
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update user profile
router.put('/profile',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const updates = req.body;
      const firestore = getFirestore();

      // Remove sensitive fields
      delete updates.password;
      delete updates.id;
      delete updates.createdAt;

      updates.updatedAt = new Date();

      // Update user document
      await firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId!)
        .update(updates);

      logger.info(`User profile updated: ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update artisan profile
router.put('/artisan-profile',
  authMiddleware,
  validateRequest(schemas.artisanProfile),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (userRole !== 'artisan') {
        return res.status(403).json({
          success: false,
          message: 'Only artisans can update artisan profile'
        });
      }

      const updates = req.body;
      const firestore = getFirestore();

      updates.updatedAt = new Date();

      // Update artisan document
      await firestore
        .collection(COLLECTIONS.ARTISANS)
        .doc(userId!)
        .update(updates);

      logger.info(`Artisan profile updated: ${userId}`);

      res.json({
        success: true,
        message: 'Artisan profile updated successfully'
      });

    } catch (error) {
      logger.error('Update artisan profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update artisan profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Change password
router.put('/change-password',
  authMiddleware,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      const firestore = getFirestore();

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Get current user data
      const userDoc = await firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId!)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data() as User;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password || '');
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId!)
        .update({
          password: hashedNewPassword,
          updatedAt: new Date()
        });

      logger.info(`Password changed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Logout (client-side token removal)
router.post('/logout',
  authMiddleware,
  (req, res) => {
    logger.info(`User logged out: ${req.user?.id}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);

export default router;
