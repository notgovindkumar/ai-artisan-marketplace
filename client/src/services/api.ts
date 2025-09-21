import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 403) {
      toast.error('You are not authorized to perform this action.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// API Response interface
interface ApiResponse<T = any> {
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

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'artisan' | 'buyer';
    phone?: string;
    language?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any): Promise<ApiResponse> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  updateArtisanProfile: async (data: any): Promise<ApiResponse> => {
    const response = await api.put('/auth/artisan-profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Product API
export const productAPI = {
  getProducts: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/product', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  createProduct: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/product', data);
    return response.data;
  },

  updateProduct: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/product/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  getArtisanProducts: async (artisanId: string, params?: any): Promise<ApiResponse> => {
    const response = await api.get(`/product/artisan/${artisanId}`, { params });
    return response.data;
  }
};

// Artisan API
export const artisanAPI = {
  getArtisans: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/artisan', { params });
    return response.data;
  },

  getArtisan: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/artisan/${id}`);
    return response.data;
  },

  getArtisanDashboard: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/artisan/${id}/dashboard`);
    return response.data;
  },

  updateVerification: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/artisan/${id}/verify`, data);
    return response.data;
  }
};

// AI API
export const aiAPI = {
  generateListing: async (formData: FormData): Promise<ApiResponse> => {
    const response = await api.post('/ai/generate-listing', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateStory: async (data: {
    craftType: string;
    region: string;
    language: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/ai/generate-story', data);
    return response.data;
  },

  analyzeImages: async (formData: FormData): Promise<ApiResponse> => {
    const response = await api.post('/ai/analyze-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateKeywords: async (data: {
    title: string;
    description: string;
    category: string;
    materials: string[];
    techniques: string[];
    craftType: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/ai/generate-keywords', data);
    return response.data;
  },

  translate: async (data: {
    text: string;
    targetLanguage: string;
    sourceLanguage?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/ai/translate', data);
    return response.data;
  }
};

// Voice API
export const voiceAPI = {
  process: async (data: {
    audio: string;
    language: string;
    context: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/voice/process', data);
    return response.data;
  },

  processCommand: async (command: string, language: string): Promise<ApiResponse> => {
    const response = await api.post('/voice/command', { command, language });
    return response.data;
  },

  getLanguages: async (): Promise<ApiResponse> => {
    const response = await api.get('/voice/languages');
    return response.data;
  },

  synthesize: async (data: {
    text: string;
    language: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/voice/synthesize', data);
    return response.data;
  }
};

// Market API
export const marketAPI = {
  getIntelligence: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/market/intelligence', { params });
    return response.data;
  },

  getTrending: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/market/trending', { params });
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse> => {
    const response = await api.get('/market/categories');
    return response.data;
  },

  getRegions: async (): Promise<ApiResponse> => {
    const response = await api.get('/market/regions');
    return response.data;
  },

  getCraftTypes: async (): Promise<ApiResponse> => {
    const response = await api.get('/market/craft-types');
    return response.data;
  },

  getAnalytics: async (): Promise<ApiResponse> => {
    const response = await api.get('/market/analytics');
    return response.data;
  }
};

// Payment API
export const paymentAPI = {
  createOrder: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/payment/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/payment/verify', data);
    return response.data;
  },

  getPaymentMethods: async (): Promise<ApiResponse> => {
    const response = await api.get('/payment/methods');
    return response.data;
  },

  getOrders: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/payment/orders', { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/payment/orders/${id}`);
    return response.data;
  }
};

// File upload utility
export const uploadFile = async (file: File, type: 'image' | 'audio' = 'image'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};

// Export default api instance for custom requests
export default api;
