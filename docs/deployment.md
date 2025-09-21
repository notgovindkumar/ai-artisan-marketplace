# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Google Cloud Platform account with required APIs enabled
- Domain name (optional, for production)

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account-key.json

# AI Services
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# Database
FIRESTORE_PROJECT_ID=your-project-id
BIGQUERY_PROJECT_ID=your-project-id

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Maps and Translation
GOOGLE_MAPS_API_KEY=your-maps-api-key
GOOGLE_TRANSLATE_API_KEY=your-translate-api-key

# Storage
CLOUD_STORAGE_BUCKET=artisan-marketplace-assets

# Security
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://redis:6379
```

## Google Cloud Setup

### 1. Enable Required APIs

```bash
# Enable required APIs
gcloud services enable \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  bigquery.googleapis.com \
  translate.googleapis.com \
  vision.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  storage.googleapis.com \
  maps-platform-backend.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create artisan-marketplace-sa \
  --display-name="Artisan Marketplace Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:artisan-marketplace-sa@your-project-id.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:artisan-marketplace-sa@your-project-id.iam.gserviceaccount.com" \
  --role="roles/firestore.user"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:artisan-marketplace-sa@your-project-id.iam.gserviceaccount.com" \
  --role="roles/bigquery.user"

# Download service account key
gcloud iam service-accounts keys create ./config/service-account-key.json \
  --iam-account=artisan-marketplace-sa@your-project-id.iam.gserviceaccount.com
```

### 3. Create Firestore Database

```bash
# Create Firestore database
gcloud firestore databases create --region=us-central1
```

### 4. Create BigQuery Dataset

```bash
# Create BigQuery dataset
bq mk --dataset --location=US artisan_marketplace
```

## Local Development

### 1. Start Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd ai-artisan-marketplace

# Install dependencies
npm install

# Start development servers
npm run dev
```

### 2. Access Applications

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Production Deployment

### 1. Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Using Google Cloud Run

#### Deploy Backend

```bash
# Build and push backend image
gcloud builds submit --tag gcr.io/your-project-id/artisan-marketplace-api ./server

# Deploy to Cloud Run
gcloud run deploy artisan-marketplace-api \
  --image gcr.io/your-project-id/artisan-marketplace-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT_ID=your-project-id"
```

#### Deploy Frontend

```bash
# Build and push frontend image
gcloud builds submit --tag gcr.io/your-project-id/artisan-marketplace-web ./client

# Deploy to Cloud Run
gcloud run deploy artisan-marketplace-web \
  --image gcr.io/your-project-id/artisan-marketplace-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## Monitoring and Logging

### 1. Google Cloud Monitoring

- Set up monitoring for API endpoints
- Configure alerts for error rates and response times
- Monitor resource usage

### 2. Logging

- Application logs are stored in Google Cloud Logging
- Access logs through Google Cloud Console
- Set up log-based metrics and alerts

### 3. Health Checks

- Backend health check: `GET /health`
- Frontend health check: `GET /`
- Database connectivity checks

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use Google Secret Manager for production secrets
- Rotate API keys regularly

### 2. Network Security

- Use HTTPS in production
- Configure CORS properly
- Set up rate limiting

### 3. Data Protection

- Encrypt data at rest and in transit
- Implement proper access controls
- Regular security audits

## Scaling

### 1. Horizontal Scaling

- Use Cloud Run or Kubernetes for auto-scaling
- Configure load balancers
- Implement database connection pooling

### 2. Caching

- Use Redis for session storage and caching
- Implement CDN for static assets
- Cache API responses where appropriate

### 3. Database Optimization

- Use Firestore indexes for queries
- Implement data archiving strategies
- Monitor query performance

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check environment variables
   - Verify service account permissions
   - Check network connectivity

2. **Database Connection Issues**
   - Verify Firestore database exists
   - Check service account permissions
   - Verify project ID configuration

3. **AI Service Errors**
   - Check API quotas and limits
   - Verify API keys are valid
   - Check service availability

### Debug Commands

```bash
# Check container logs
docker-compose logs api
docker-compose logs web

# Check service status
docker-compose ps

# Access container shell
docker-compose exec api sh
```

## Backup and Recovery

### 1. Database Backups

- Firestore automatic backups
- BigQuery table snapshots
- Regular export of critical data

### 2. Application Backups

- Source code in version control
- Container images in registry
- Configuration files backed up

### 3. Disaster Recovery

- Multi-region deployment
- Database replication
- Automated failover procedures

## Performance Optimization

### 1. Frontend Optimization

- Code splitting and lazy loading
- Image optimization
- CDN for static assets

### 2. Backend Optimization

- Database query optimization
- Caching strategies
- API response compression

### 3. Monitoring

- Performance metrics collection
- Real-time monitoring dashboards
- Automated performance alerts
