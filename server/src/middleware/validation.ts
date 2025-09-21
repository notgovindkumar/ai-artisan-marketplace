import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User registration
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('artisan', 'buyer').required(),
    language: Joi.string().length(2).optional()
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Artisan profile
  artisanProfile: Joi.object({
    craftSpecialization: Joi.array().items(Joi.string()).min(1).required(),
    experience: Joi.number().min(0).required(),
    location: Joi.object({
      state: Joi.string().required(),
      city: Joi.string().required(),
      pincode: Joi.string().pattern(/^\d{6}$/).required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).optional()
    }).required(),
    culturalBackground: Joi.object({
      familyHistory: Joi.string().max(1000).optional(),
      learningJourney: Joi.string().max(1000).optional(),
      traditions: Joi.array().items(Joi.string()).optional(),
      techniques: Joi.array().items(Joi.string()).optional()
    }).optional(),
    businessInfo: Joi.object({
      shopName: Joi.string().max(100).optional(),
      gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
      bankAccount: Joi.object({
        accountNumber: Joi.string().pattern(/^\d{9,18}$/).required(),
        ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
        bankName: Joi.string().required()
      }).optional()
    }).optional(),
    socialMedia: Joi.object({
      instagram: Joi.string().uri().optional(),
      facebook: Joi.string().uri().optional(),
      youtube: Joi.string().uri().optional()
    }).optional()
  }),

  // Product creation
  product: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).max(2000).required(),
    culturalSignificance: Joi.string().max(1000).optional(),
    materials: Joi.array().items(Joi.string()).min(1).required(),
    techniques: Joi.array().items(Joi.string()).min(1).required(),
    category: Joi.string().required(),
    subcategory: Joi.string().required(),
    price: Joi.number().min(0).required(),
    dimensions: Joi.object({
      length: Joi.number().min(0).optional(),
      width: Joi.number().min(0).optional(),
      height: Joi.number().min(0).optional(),
      unit: Joi.string().valid('cm', 'inches').required()
    }).optional(),
    weight: Joi.number().min(0).optional(),
    color: Joi.array().items(Joi.string()).min(1).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    availability: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').required(),
    stockQuantity: Joi.number().min(0).when('availability', {
      is: 'in_stock',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    madeToOrderTime: Joi.number().min(1).when('availability', {
      is: 'made_to_order',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // AI listing request
  aiListingRequest: Joi.object({
    language: Joi.string().length(2).required(),
    category: Joi.string().optional(),
    materials: Joi.array().items(Joi.string()).optional(),
    techniques: Joi.array().items(Joi.string()).optional(),
    voiceDescription: Joi.string().optional()
  }),

  // Voice request
  voiceRequest: Joi.object({
    audio: Joi.string().required(),
    language: Joi.string().length(2).required(),
    context: Joi.string().valid('product_listing', 'order_management', 'customer_support', 'general').required()
  }),

  // Order creation
  order: Joi.object({
    products: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).required(),
      customization: Joi.string().max(500).optional()
    })).min(1).required(),
    shippingAddress: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      addressLine1: Joi.string().min(5).max(100).required(),
      addressLine2: Joi.string().max(100).optional(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
      pincode: Joi.string().pattern(/^\d{6}$/).required(),
      country: Joi.string().default('India').optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).optional()
    }).required(),
    billingAddress: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      addressLine1: Joi.string().min(5).max(100).required(),
      addressLine2: Joi.string().max(100).optional(),
      city: Joi.string().min(2).max(50).required(),
      state: Joi.string().min(2).max(50).required(),
      pincode: Joi.string().pattern(/^\d{6}$/).required(),
      country: Joi.string().default('India').optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).optional()
    }).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Search filters
  searchFilters: Joi.object({
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.number().min(0).optional(),
    artisanId: Joi.string().optional(),
    region: Joi.string().optional(),
    materials: Joi.array().items(Joi.string()).optional(),
    techniques: Joi.array().items(Joi.string()).optional(),
    availability: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').optional(),
    rating: Joi.number().min(0).max(5).optional(),
    sortBy: Joi.string().valid('price', 'rating', 'newest', 'popular').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().min(1).default(1).optional(),
    limit: Joi.number().min(1).max(100).default(20).optional()
  })
};
