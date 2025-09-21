import express from 'express';
import { VoiceAssistant } from '../services/voiceAssistant';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const voiceAssistant = new VoiceAssistant();

// Process voice input and get AI response
router.post('/process', 
  authMiddleware,
  async (req, res) => {
    try {
      const { audio, language, context } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!audio) {
        return res.status(400).json({
          success: false,
          message: 'Audio data is required'
        });
      }

      const request = {
        audio,
        language: language || 'en',
        context: context || 'general',
        userId
      };

      const response = await voiceAssistant.processVoiceRequest(request);

      logger.info(`Voice request processed for user ${userId}`);

      res.json({
        success: true,
        data: response,
        message: 'Voice request processed successfully'
      });

    } catch (error) {
      logger.error('Error processing voice request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process voice request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Process voice command and get actions
router.post('/command',
  authMiddleware,
  async (req, res) => {
    try {
      const { command, language } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!command) {
        return res.status(400).json({
          success: false,
          message: 'Command is required'
        });
      }

      const actions = await voiceAssistant.processVoiceCommand(
        command, 
        userId, 
        language || 'en'
      );

      logger.info(`Voice command processed for user ${userId}`);

      res.json({
        success: true,
        data: { actions },
        message: 'Voice command processed successfully'
      });

    } catch (error) {
      logger.error('Error processing voice command:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process voice command',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get supported languages
router.get('/languages', (req, res) => {
  const { SUPPORTED_LANGUAGES } = require('../config/ai');
  
  res.json({
    success: true,
    data: { languages: SUPPORTED_LANGUAGES },
    message: 'Supported languages retrieved successfully'
  });
});

// Test voice synthesis
router.post('/synthesize',
  authMiddleware,
  async (req, res) => {
    try {
      const { text, language } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text is required for synthesis'
        });
      }

      const audioResponse = await voiceAssistant.textToSpeech(
        text, 
        language || 'en'
      );

      logger.info(`Text synthesized for user ${userId}`);

      res.json({
        success: true,
        data: { audio: audioResponse },
        message: 'Text synthesized successfully'
      });

    } catch (error) {
      logger.error('Error synthesizing text:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to synthesize text',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
