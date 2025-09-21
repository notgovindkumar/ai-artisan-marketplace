import express from 'express';
import multer from 'multer';
import { AIListingGenerator } from '../services/aiListingGenerator';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();
const aiListingGenerator = new AIListingGenerator();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Generate AI-powered product listing
router.post('/generate-listing', 
  authMiddleware,
  upload.array('images', 5), // Max 5 images
  async (req, res) => {
    try {
      const { language, category, materials, techniques, voiceDescription } = req.body;
      const artisanId = req.user?.id;

      if (!artisanId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert uploaded images to base64 URLs
      const images = (req.files as Express.Multer.File[])?.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      }) || [];

      if (images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one image is required'
        });
      }

      const request = {
        images,
        voiceDescription,
        language: language || 'en',
        artisanId,
        category,
        materials: materials ? JSON.parse(materials) : undefined,
        techniques: techniques ? JSON.parse(techniques) : undefined
      };

      const result = await aiListingGenerator.generateListing(request);

      logger.info(`AI listing generated for artisan ${artisanId}`);

      res.json({
        success: true,
        data: result,
        message: 'AI listing generated successfully'
      });

    } catch (error) {
      logger.error('Error generating AI listing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI listing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Generate cultural story for a craft type
router.post('/generate-story', 
  authMiddleware,
  async (req, res) => {
    try {
      const { craftType, region, language } = req.body;
      const artisanId = req.user?.id;

      if (!artisanId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const story = await aiListingGenerator.generateCulturalStory({
        craftType,
        region: region || 'India',
        artisanId,
        language: language || 'en'
      });

      res.json({
        success: true,
        data: { story },
        message: 'Cultural story generated successfully'
      });

    } catch (error) {
      logger.error('Error generating cultural story:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate cultural story',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Analyze product images for quality and authenticity
router.post('/analyze-images',
  authMiddleware,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const images = (req.files as Express.Multer.File[])?.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      }) || [];

      if (images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one image is required'
        });
      }

      const analysis = await aiListingGenerator.analyzeImages(images);

      res.json({
        success: true,
        data: analysis,
        message: 'Image analysis completed successfully'
      });

    } catch (error) {
      logger.error('Error analyzing images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Generate SEO keywords for a product
router.post('/generate-keywords',
  authMiddleware,
  async (req, res) => {
    try {
      const { title, description, category, materials, techniques, craftType } = req.body;

      const content = {
        title,
        description,
        category,
        materials: materials || [],
        techniques: techniques || [],
        tags: []
      };

      const keywords = await aiListingGenerator.generateSEOKeywords(content, craftType || 'handicraft');

      res.json({
        success: true,
        data: { keywords },
        message: 'SEO keywords generated successfully'
      });

    } catch (error) {
      logger.error('Error generating SEO keywords:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate SEO keywords',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Translate content to multiple languages
router.post('/translate',
  authMiddleware,
  async (req, res) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({
          success: false,
          message: 'Text and target language are required'
        });
      }

      const { Translate } = require('@google-cloud/translate');
      const translate = new Translate({
        projectId: process.env.FIRESTORE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const [translation] = await translate.translate(text, {
        from: sourceLanguage,
        to: targetLanguage
      });

      res.json({
        success: true,
        data: { 
          originalText: text,
          translatedText: translation,
          sourceLanguage,
          targetLanguage
        },
        message: 'Translation completed successfully'
      });

    } catch (error) {
      logger.error('Error translating content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to translate content',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
