# API Documentation

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.artisan-marketplace.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "artisan" | "buyer",
  "phone": "string (optional)",
  "language": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "language": "string"
    },
    "token": "string"
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login

Login user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "language": "string"
    },
    "token": "string"
  },
  "message": "Login successful"
}
```

#### GET /auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "language": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "isActive": boolean,
      "profileImage": "string"
    },
    "artisanProfile": {
      // Artisan-specific fields if role is artisan
    }
  },
  "message": "Profile retrieved successfully"
}
```

### Products

#### GET /product

Get products with filters and pagination.

**Query Parameters:**
- `category` - Filter by category
- `subcategory` - Filter by subcategory
- `priceMin` - Minimum price
- `priceMax` - Maximum price
- `artisanId` - Filter by artisan
- `region` - Filter by region
- `materials` - Filter by materials (comma-separated)
- `techniques` - Filter by techniques (comma-separated)
- `availability` - Filter by availability
- `rating` - Minimum rating
- `sortBy` - Sort field (price, rating, newest, popular)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "price": number,
        "currency": "INR",
        "category": "string",
        "subcategory": "string",
        "materials": ["string"],
        "techniques": ["string"],
        "images": [
          {
            "id": "string",
            "url": "string",
            "altText": "string",
            "isPrimary": boolean,
            "order": number
          }
        ],
        "availability": "in_stock" | "out_of_stock" | "made_to_order",
        "artisanId": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ],
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number,
    "filters": {}
  },
  "message": "Products retrieved successfully"
}
```

#### POST /product

Create a new product (Artisan only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "culturalSignificance": "string",
  "materials": ["string"],
  "techniques": ["string"],
  "category": "string",
  "subcategory": "string",
  "price": number,
  "dimensions": {
    "length": number,
    "width": number,
    "height": number,
    "unit": "cm" | "inches"
  },
  "weight": number,
  "color": ["string"],
  "tags": ["string"],
  "availability": "in_stock" | "out_of_stock" | "made_to_order",
  "stockQuantity": number,
  "madeToOrderTime": number
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "string"
  },
  "message": "Product created successfully"
}
```

#### GET /product/:id

Get a single product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": number,
      "currency": "INR",
      "category": "string",
      "subcategory": "string",
      "materials": ["string"],
      "techniques": ["string"],
      "images": [
        {
          "id": "string",
          "url": "string",
          "altText": "string",
          "isPrimary": boolean,
          "order": number
        }
      ],
      "availability": "string",
      "artisanId": "string",
      "culturalSignificance": "string",
      "culturalStory": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    },
    "artisan": {
      "id": "string",
      "name": "string",
      "location": {
        "state": "string",
        "city": "string"
      },
      "rating": number,
      "totalSales": number
    }
  },
  "message": "Product retrieved successfully"
}
```

### AI Services

#### POST /ai/generate-listing

Generate AI-powered product listing.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `images` - Array of image files (max 5)
- `language` - Target language code
- `category` - Product category (optional)
- `materials` - JSON array of materials (optional)
- `techniques` - JSON array of techniques (optional)
- `voiceDescription` - Voice description (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "string",
    "description": "string",
    "culturalSignificance": "string",
    "materials": ["string"],
    "techniques": ["string"],
    "category": "string",
    "subcategory": "string",
    "tags": ["string"],
    "seoKeywords": ["string"],
    "culturalStory": "string",
    "suggestedPrice": number,
    "qualityScore": number,
    "authenticityScore": number
  },
  "message": "AI listing generated successfully"
}
```

#### POST /ai/analyze-images

Analyze product images for quality and content.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `images` - Array of image files (max 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "craftType": "string",
    "region": "string",
    "analysis": {
      "labels": [
        {
          "description": "string",
          "score": number
        }
      ],
      "objects": [
        {
          "name": "string",
          "score": number,
          "boundingPoly": {}
        }
      ],
      "colors": [
        {
          "color": {},
          "score": number
        }
      ]
    }
  },
  "message": "Image analysis completed successfully"
}
```

### Voice Assistant

#### POST /voice/process

Process voice input and get AI response.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "audio": "string (base64 encoded audio)",
  "language": "string",
  "context": "product_listing" | "order_management" | "customer_support" | "general"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "string",
    "audio": "string (base64 encoded response audio)",
    "actions": [
      {
        "type": "navigate" | "create_listing" | "update_order" | "search" | "help",
        "parameters": {}
      }
    ],
    "confidence": number
  },
  "message": "Voice request processed successfully"
}
```

#### POST /voice/command

Process voice command and get actions.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "command": "string",
  "language": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "type": "string",
        "parameters": {}
      }
    ]
  },
  "message": "Voice command processed successfully"
}
```

### Market Intelligence

#### GET /market/intelligence

Get market intelligence data.

**Query Parameters:**
- `category` - Product category
- `region` - Geographic region

**Response:**
```json
{
  "success": true,
  "data": {
    "demandTrend": "increasing" | "stable" | "decreasing",
    "averagePrice": number,
    "priceRange": {
      "min": number,
      "max": number
    },
    "topKeywords": ["string"],
    "seasonalTrends": [
      {
        "month": "string",
        "demandMultiplier": number
      }
    ],
    "competitorAnalysis": [
      {
        "platform": "string",
        "averagePrice": number,
        "marketShare": number
      }
    ],
    "recommendations": ["string"]
  },
  "message": "Market intelligence retrieved successfully"
}
```

#### GET /market/trending

Get trending products.

**Query Parameters:**
- `limit` - Number of products to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "price": number,
      "images": [
        {
          "url": "string",
          "altText": "string"
        }
      ],
      "artisanId": "string",
      "rating": number
    }
  ],
  "message": "Trending products retrieved successfully"
}
```

### Payments

#### POST /payment/create-order

Create a payment order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "products": [
    {
      "productId": "string",
      "quantity": number,
      "price": number,
      "customization": "string (optional)"
    }
  ],
  "shippingAddress": {
    "name": "string",
    "phone": "string",
    "addressLine1": "string",
    "addressLine2": "string (optional)",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "country": "string",
    "coordinates": {
      "lat": number,
      "lng": number
    }
  },
  "billingAddress": {
    // Same structure as shippingAddress
  },
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "razorpayOrderId": "string",
    "amount": number,
    "currency": "INR",
    "key": "string"
  },
  "message": "Payment order created successfully"
}
```

#### POST /payment/verify

Verify payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "paymentId": "string",
    "status": "paid"
  },
  "message": "Payment verified successfully"
}
```

## Rate Limiting

- API calls are limited to 100 requests per 15 minutes per IP
- Voice processing is limited to 50 requests per hour per user
- AI listing generation is limited to 20 requests per hour per user

## Webhooks

### Payment Webhooks

The system supports Razorpay webhooks for payment status updates:

**Endpoint:** `POST /webhooks/razorpay`

**Headers:**
```
X-Razorpay-Signature: <signature>
```

**Payload:**
```json
{
  "event": "payment.captured",
  "account_id": "string",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "string",
        "amount": number,
        "currency": "INR",
        "status": "captured",
        "order_id": "string"
      }
    }
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @artisan-marketplace/sdk
```

```javascript
import { ArtisanMarketplaceAPI } from '@artisan-marketplace/sdk';

const api = new ArtisanMarketplaceAPI({
  baseURL: 'https://api.artisan-marketplace.com/api',
  apiKey: 'your-api-key'
});

// Get products
const products = await api.products.list({
  category: 'pottery',
  limit: 20
});

// Create product
const product = await api.products.create({
  title: 'Handmade Pottery Vase',
  description: 'Beautiful traditional pottery...',
  price: 2500,
  category: 'pottery'
});
```

### Python

```bash
pip install artisan-marketplace-sdk
```

```python
from artisan_marketplace import ArtisanMarketplaceAPI

api = ArtisanMarketplaceAPI(
    base_url='https://api.artisan-marketplace.com/api',
    api_key='your-api-key'
)

# Get products
products = api.products.list(category='pottery', limit=20)

# Create product
product = api.products.create({
    'title': 'Handmade Pottery Vase',
    'description': 'Beautiful traditional pottery...',
    'price': 2500,
    'category': 'pottery'
})
```

## Support

For API support and questions:

- Email: api-support@artisan-marketplace.com
- Documentation: https://docs.artisan-marketplace.com
- Status Page: https://status.artisan-marketplace.com
