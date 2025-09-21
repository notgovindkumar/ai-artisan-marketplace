import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getFirestore, COLLECTIONS } from '../config/database';
import type { User } from '../types';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Get user from database
    const firestore = getFirestore();
    const userDoc = await firestore
      .collection(COLLECTIONS.USERS)
      .doc(decoded.userId)
      .get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data() as User;
    
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = {
      ...userData,
      id: userDoc.id
    };

    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    const firestore = getFirestore();
    const userDoc = await firestore
      .collection(COLLECTIONS.USERS)
      .doc(decoded.userId)
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      if (userData.isActive) {
        req.user = {
          ...userData,
          id: userDoc.id
        };
      }
    }

    next();

  } catch (error) {
    // Continue without user if auth fails
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireArtisan = requireRole(['artisan', 'admin']);
export const requireBuyer = requireRole(['buyer', 'admin']);
export const requireAdmin = requireRole(['admin']);
