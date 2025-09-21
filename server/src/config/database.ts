import { Firestore } from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { logger } from '../utils/logger';

let firestore: Firestore;
let bigquery: BigQuery;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Initialize Firestore
    firestore = new Firestore({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Initialize BigQuery
    bigquery = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // Test connections
    await firestore.collection('test').doc('test').get();
    await bigquery.getDatasets();

    logger.info('Database connections established successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore not initialized. Call connectDatabase() first.');
  }
  return firestore;
};

export const getBigQuery = (): BigQuery => {
  if (!bigquery) {
    throw new Error('BigQuery not initialized. Call connectDatabase() first.');
  }
  return bigquery;
};

// Collection references
export const COLLECTIONS = {
  USERS: 'users',
  ARTISANS: 'artisans',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  CONVERSATIONS: 'conversations',
  ANALYTICS: 'analytics',
  CULTURAL_STORIES: 'cultural_stories',
  MARKET_INTELLIGENCE: 'market_intelligence'
} as const;
