import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { getGeminiAI } from '../config/ai';
import { VoiceRequest, VoiceResponse, VoiceAction } from '../types';
import { logger } from '../utils/logger';

export class VoiceAssistant {
  private geminiAI: GoogleGenerativeAI;
  private speechClient: SpeechClient;
  private ttsClient: TextToSpeechClient;

  constructor() {
    this.geminiAI = getGeminiAI();
    this.speechClient = new SpeechClient({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.ttsClient = new TextToSpeechClient({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async processVoiceRequest(request: VoiceRequest): Promise<VoiceResponse> {
    try {
      logger.info(`Processing voice request for user ${request.userId}`);

      // Step 1: Convert speech to text
      const transcription = await this.speechToText(request.audio, request.language);
      logger.info('Speech transcribed successfully');

      // Step 2: Process the text with AI
      const aiResponse = await this.processTextWithAI(transcription, request.context, request.language);
      logger.info('AI processing completed');

      // Step 3: Generate voice response if needed
      let audioResponse: string | undefined;
      if (aiResponse.shouldSpeak) {
        audioResponse = await this.textToSpeech(aiResponse.text, request.language);
        logger.info('Voice response generated');
      }

      const response: VoiceResponse = {
        text: aiResponse.text,
        audio: audioResponse,
        actions: aiResponse.actions,
        confidence: aiResponse.confidence
      };

      logger.info('Voice request processed successfully');
      return response;

    } catch (error) {
      logger.error('Error processing voice request:', error);
      throw new Error('Failed to process voice request');
    }
  }

  private async speechToText(audioBase64: string, language: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const audioData = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '');
      const audioBytes = Buffer.from(audioData, 'base64');

      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: 'WEBM_OPUS' as const,
          sampleRateHertz: 48000,
          languageCode: this.mapLanguageCode(language),
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          model: 'latest_long',
        },
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join(' ')
        .trim() || '';

      if (!transcription) {
        throw new Error('No speech detected in audio');
      }

      return transcription;

    } catch (error) {
      logger.error('Error in speech-to-text conversion:', error);
      throw new Error('Failed to convert speech to text');
    }
  }

  private async processTextWithAI(
    text: string, 
    context: string, 
    language: string
  ): Promise<{
    text: string;
    actions?: VoiceAction[];
    shouldSpeak: boolean;
    confidence: number;
  }> {
    const model = this.geminiAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    You are an AI assistant for an Indian artisan marketplace. Process the following user input and respond appropriately.

    Context: ${context}
    User Input: "${text}"
    Language: ${language}

    Based on the context, determine:
    1. The appropriate response text
    2. Any actions the user wants to perform
    3. Whether the response should be spoken aloud
    4. Confidence level (0-1)

    Context-specific responses:
    - product_listing: Help with creating product listings, suggest descriptions, pricing
    - order_management: Help with order status, updates, tracking
    - customer_support: General help, FAQ, troubleshooting
    - general: General conversation, greetings, basic help

    Respond in JSON format:
    {
      "text": "response text in the user's language",
      "actions": [
        {
          "type": "navigate|create_listing|update_order|search|help",
          "parameters": {}
        }
      ],
      "shouldSpeak": true/false,
      "confidence": 0.0-1.0
    }

    Be helpful, culturally appropriate, and speak in the user's preferred language.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        text: this.getFallbackResponse(text, context, language),
        shouldSpeak: true,
        confidence: 0.5
      };

    } catch (error) {
      logger.error('Error processing text with AI:', error);
      return {
        text: this.getFallbackResponse(text, context, language),
        shouldSpeak: true,
        confidence: 0.3
      };
    }
  }

  private async textToSpeech(text: string, language: string): Promise<string> {
    try {
      const request = {
        input: { text },
        voice: {
          languageCode: this.mapLanguageCode(language),
          name: this.getVoiceName(language),
          ssmlGender: 'NEUTRAL' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 0.9,
          pitch: 0.0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      const audioContent = response.audioContent;
      
      if (!audioContent) {
        throw new Error('No audio content generated');
      }

      return `data:audio/mp3;base64,${audioContent.toString('base64')}`;

    } catch (error) {
      logger.error('Error in text-to-speech conversion:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  private mapLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'ur': 'ur-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'pa': 'pa-IN',
      'as': 'as-IN',
      'ml': 'ml-IN',
      'ne': 'ne-NP',
      'sa': 'sa-IN',
      'sd': 'sd-IN',
      'ks': 'ks-IN',
      'bo': 'bo-CN',
      'mni': 'mni-IN',
      'sat': 'sat-IN',
      'kok': 'kok-IN',
      'mai': 'mai-IN'
    };

    return languageMap[language] || 'en-US';
  }

  private getVoiceName(language: string): string {
    const voiceMap: Record<string, string> = {
      'en': 'en-US-Wavenet-D',
      'hi': 'hi-IN-Wavenet-A',
      'bn': 'bn-IN-Wavenet-A',
      'te': 'te-IN-Wavenet-A',
      'mr': 'mr-IN-Wavenet-A',
      'ta': 'ta-IN-Wavenet-A',
      'ur': 'ur-IN-Wavenet-A',
      'gu': 'gu-IN-Wavenet-A',
      'kn': 'kn-IN-Wavenet-A',
      'or': 'or-IN-Wavenet-A',
      'pa': 'pa-IN-Wavenet-A',
      'as': 'as-IN-Wavenet-A',
      'ml': 'ml-IN-Wavenet-A',
      'ne': 'ne-NP-Wavenet-A',
      'sa': 'sa-IN-Wavenet-A',
      'sd': 'sd-IN-Wavenet-A',
      'ks': 'ks-IN-Wavenet-A',
      'bo': 'bo-CN-Wavenet-A',
      'mni': 'mni-IN-Wavenet-A',
      'sat': 'sat-IN-Wavenet-A',
      'kok': 'kok-IN-Wavenet-A',
      'mai': 'mai-IN-Wavenet-A'
    };

    return voiceMap[language] || 'en-US-Wavenet-D';
  }

  private getFallbackResponse(text: string, context: string, language: string): string {
    const responses: Record<string, Record<string, string>> = {
      'en': {
        'product_listing': 'I can help you create a product listing. Please describe your craft and I\'ll assist you.',
        'order_management': 'I can help you with your orders. What would you like to know?',
        'customer_support': 'How can I help you today?',
        'general': 'Hello! I\'m here to help you with the artisan marketplace.'
      },
      'hi': {
        'product_listing': 'मैं आपकी उत्पाद सूची बनाने में मदद कर सकता हूं। कृपया अपनी कला का वर्णन करें।',
        'order_management': 'मैं आपके ऑर्डर के साथ मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
        'customer_support': 'आज मैं आपकी कैसे मदद कर सकता हूं?',
        'general': 'नमस्ते! मैं आपकी कारीगर बाज़ार में मदद करने के लिए यहां हूं।'
      }
    };

    const langResponses = responses[language] || responses['en'];
    return langResponses[context] || langResponses['general'];
  }

  // Voice commands for specific actions
  async processVoiceCommand(command: string, userId: string, language: string): Promise<VoiceAction[]> {
    const model = this.geminiAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Analyze this voice command and determine what actions the user wants to perform.

    Command: "${command}"
    User ID: ${userId}
    Language: ${language}

    Available actions:
    - navigate: Navigate to a specific page/section
    - create_listing: Create a new product listing
    - update_order: Update order status or details
    - search: Search for products or information
    - help: Get help or support

    Respond with a JSON array of actions:
    [
      {
        "type": "action_type",
        "parameters": {
          "key": "value"
        }
      }
    ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];

    } catch (error) {
      logger.error('Error processing voice command:', error);
      return [];
    }
  }
}
