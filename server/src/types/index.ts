// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'artisan' | 'buyer' | 'admin';
  language: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profileImage?: string;
}

export interface ArtisanProfile extends User {
  role: 'artisan';
  craftSpecialization: string[];
  experience: number;
  location: {
    state: string;
    city: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  culturalBackground: {
    familyHistory: string;
    learningJourney: string;
    traditions: string[];
    techniques: string[];
  };
  businessInfo: {
    shopName?: string;
    gstNumber?: string;
    bankAccount?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  totalSales: number;
  joinedDate: Date;
}

// Product Types
export interface Product {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  culturalSignificance: string;
  materials: string[];
  techniques: string[];
  category: string;
  subcategory: string;
  images: ProductImage[];
  price: number;
  currency: 'INR';
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'inches';
  };
  weight?: number;
  color: string[];
  tags: string[];
  availability: 'in_stock' | 'out_of_stock' | 'made_to_order';
  stockQuantity?: number;
  madeToOrderTime?: number; // in days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  aiGenerated: boolean;
  seoKeywords: string[];
  culturalStory?: string;
  videoUrl?: string;
  audioDescription?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  order: number;
  aiGenerated?: boolean;
}

// Order Types
export interface Order {
  id: string;
  buyerId: string;
  artisanId: string;
  products: OrderItem[];
  totalAmount: number;
  currency: 'INR';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  customization?: string;
}

export interface Address {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// AI Generated Content Types
export interface AIListingRequest {
  images: string[];
  voiceDescription?: string;
  language: string;
  artisanId: string;
  category?: string;
  materials?: string[];
  techniques?: string[];
}

export interface AIListingResponse {
  title: string;
  description: string;
  culturalSignificance: string;
  materials: string[];
  techniques: string[];
  category: string;
  subcategory: string;
  tags: string[];
  seoKeywords: string[];
  culturalStory: string;
  suggestedPrice?: number;
  qualityScore: number;
  authenticityScore: number;
}

// Market Intelligence Types
export interface MarketIntelligence {
  id: string;
  category: string;
  region: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    topKeywords: string[];
    seasonalTrends: {
      month: string;
      demandMultiplier: number;
    }[];
    competitorAnalysis: {
      platform: string;
      averagePrice: number;
      marketShare: number;
    }[];
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Voice Assistant Types
export interface VoiceRequest {
  audio: string; // base64 encoded audio
  language: string;
  context: 'product_listing' | 'order_management' | 'customer_support' | 'general';
  userId: string;
}

export interface VoiceResponse {
  text: string;
  audio?: string; // base64 encoded response audio
  actions?: VoiceAction[];
  confidence: number;
}

export interface VoiceAction {
  type: 'navigate' | 'create_listing' | 'update_order' | 'search' | 'help';
  parameters: Record<string, any>;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 'page_view' | 'product_view' | 'search' | 'purchase' | 'voice_interaction';
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  deviceInfo: {
    platform: 'web' | 'mobile' | 'voice';
    userAgent: string;
    language: string;
  };
}

// Cultural Story Types
export interface CulturalStory {
  id: string;
  artisanId: string;
  craftType: string;
  region: string;
  title: string;
  content: string;
  images: string[];
  audioUrl?: string;
  videoUrl?: string;
  language: string;
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Search and Filter Types
export interface ProductSearchFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  artisanId?: string;
  region?: string;
  materials?: string[];
  techniques?: string[];
  availability?: string;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: ProductSearchFilters;
}
