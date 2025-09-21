import { GoogleGenerativeAI } from '@google/generative-ai';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Translate } from '@google-cloud/translate';
import { Storage } from '@google-cloud/storage';
import { logger } from '../utils/logger';

let geminiAI: GoogleGenerativeAI;
let vertexAI: PredictionServiceClient;
let visionClient: ImageAnnotatorClient;
let translateClient: Translate;
let storageClient: Storage;

export const initializeAI = async (): Promise<void> => {
  try {
    // Initialize Gemini AI
    geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    logger.info('Gemini AI initialized');

    // Initialize Vertex AI
    vertexAI = new PredictionServiceClient({
      apiEndpoint: `${process.env.VERTEX_AI_LOCATION}-aiplatform.googleapis.com`,
      projectId: process.env.VERTEX_AI_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    logger.info('Vertex AI initialized');

    // Initialize Vision API
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    logger.info('Vision API initialized');

    // Initialize Translation API
    translateClient = new Translate({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    logger.info('Translation API initialized');

    // Initialize Cloud Storage
    storageClient = new Storage({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    logger.info('Cloud Storage initialized');

  } catch (error) {
    logger.error('AI services initialization failed:', error);
    throw error;
  }
};

export const getGeminiAI = (): GoogleGenerativeAI => {
  if (!geminiAI) {
    throw new Error('Gemini AI not initialized. Call initializeAI() first.');
  }
  return geminiAI;
};

export const getVertexAI = (): PredictionServiceClient => {
  if (!vertexAI) {
    throw new Error('Vertex AI not initialized. Call initializeAI() first.');
  }
  return vertexAI;
};

export const getVisionClient = (): ImageAnnotatorClient => {
  if (!visionClient) {
    throw new Error('Vision client not initialized. Call initializeAI() first.');
  }
  return visionClient;
};

export const getTranslateClient = (): Translate => {
  if (!translateClient) {
    throw new Error('Translate client not initialized. Call initializeAI() first.');
  }
  return translateClient;
};

export const getStorageClient = (): Storage => {
  if (!storageClient) {
    throw new Error('Storage client not initialized. Call initializeAI() first.');
  }
  return storageClient;
};

// Supported languages for the platform
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
  { code: 'bo', name: 'Bodo', nativeName: 'बड़ो' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' }
] as const;
