import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Translate } from '@google-cloud/translate';
import { getGeminiAI, getVisionClient, getTranslateClient } from '../config/ai';
import { AIListingRequest, AIListingResponse, Product } from '../types';
import { logger } from '../utils/logger';

export class AIListingGenerator {
  private geminiAI: GoogleGenerativeAI;
  private visionClient: ImageAnnotatorClient;
  private translateClient: Translate;

  constructor() {
    this.geminiAI = getGeminiAI();
    this.visionClient = getVisionClient();
    this.translateClient = getTranslateClient();
  }

  async generateListing(request: AIListingRequest): Promise<AIListingResponse> {
    try {
      logger.info(`Generating AI listing for artisan ${request.artisanId}`);

      // Step 1: Analyze images
      const imageAnalysis = await this.analyzeImages(request.images);
      logger.info('Image analysis completed', { craftType: imageAnalysis.craftType });

      // Step 2: Process voice description if provided
      let voiceText = '';
      if (request.voiceDescription) {
        voiceText = await this.processVoiceDescription(request.voiceDescription, request.language);
        logger.info('Voice description processed');
      }

      // Step 3: Generate enhanced content using Gemini
      const enhancedContent = await this.generateEnhancedContent({
        imageAnalysis,
        voiceText,
        language: request.language,
        artisanId: request.artisanId,
        category: request.category,
        materials: request.materials,
        techniques: request.techniques
      });

      // Step 4: Generate cultural story
      const culturalStory = await this.generateCulturalStory({
        craftType: imageAnalysis.craftType,
        region: imageAnalysis.region,
        artisanId: request.artisanId,
        language: request.language
      });

      // Step 5: Calculate quality and authenticity scores
      const qualityScore = this.calculateQualityScore(imageAnalysis);
      const authenticityScore = this.calculateAuthenticityScore(imageAnalysis, enhancedContent);

      // Step 6: Generate SEO keywords
      const seoKeywords = await this.generateSEOKeywords(enhancedContent, imageAnalysis.craftType);

      const response: AIListingResponse = {
        title: enhancedContent.title,
        description: enhancedContent.description,
        culturalSignificance: enhancedContent.culturalSignificance,
        materials: enhancedContent.materials,
        techniques: enhancedContent.techniques,
        category: enhancedContent.category,
        subcategory: enhancedContent.subcategory,
        tags: enhancedContent.tags,
        seoKeywords,
        culturalStory,
        suggestedPrice: enhancedContent.suggestedPrice,
        qualityScore,
        authenticityScore
      };

      logger.info('AI listing generation completed successfully');
      return response;

    } catch (error) {
      logger.error('Error generating AI listing:', error);
      throw new Error('Failed to generate AI listing');
    }
  }

  private async analyzeImages(imageUrls: string[]): Promise<any> {
    try {
      const results = await Promise.all(
        imageUrls.map(async (imageUrl) => {
          const [result] = await this.visionClient.annotateImage({
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'IMAGE_PROPERTIES' }
            ]
          });

          return {
            labels: result.labelAnnotations?.map(label => ({
              description: label.description,
              score: label.score
            })) || [],
            objects: result.localizedObjectAnnotations?.map(obj => ({
              name: obj.name,
              score: obj.score,
              boundingPoly: obj.boundingPoly
            })) || [],
            text: result.textAnnotations?.map(text => text.description) || [],
            colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
              color: color.color,
              score: color.score
            })) || []
          };
        })
      );

      // Combine results from all images
      const combinedAnalysis = this.combineImageAnalysis(results);
      
      // Determine craft type based on analysis
      const craftType = this.determineCraftType(combinedAnalysis);
      const region = this.determineRegion(combinedAnalysis);

      return {
        craftType,
        region,
        analysis: combinedAnalysis
      };

    } catch (error) {
      logger.error('Error analyzing images:', error);
      throw new Error('Failed to analyze images');
    }
  }

  private combineImageAnalysis(results: any[]): any {
    const combined = {
      labels: [] as any[],
      objects: [] as any[],
      text: [] as string[],
      colors: [] as any[]
    };

    results.forEach(result => {
      combined.labels.push(...result.labels);
      combined.objects.push(...result.objects);
      combined.text.push(...result.text);
      combined.colors.push(...result.colors);
    });

    // Remove duplicates and sort by score
    combined.labels = combined.labels
      .filter((label, index, self) => 
        index === self.findIndex(l => l.description === label.description)
      )
      .sort((a, b) => b.score - a.score);

    combined.objects = combined.objects
      .filter((obj, index, self) => 
        index === self.findIndex(o => o.name === obj.name)
      )
      .sort((a, b) => b.score - a.score);

    combined.text = [...new Set(combined.text)];
    combined.colors = combined.colors
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 colors

    return combined;
  }

  private determineCraftType(analysis: any): string {
    const craftKeywords = {
      'pottery': ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'bowl', 'plate'],
      'textile': ['fabric', 'cloth', 'sari', 'shawl', 'scarf', 'embroidery', 'weaving'],
      'jewelry': ['jewelry', 'necklace', 'bracelet', 'ring', 'earring', 'pendant'],
      'woodwork': ['wood', 'carving', 'furniture', 'sculpture', 'handicraft'],
      'metalwork': ['metal', 'brass', 'copper', 'silver', 'gold', 'jewelry'],
      'bamboo': ['bamboo', 'basket', 'mat', 'handicraft'],
      'leather': ['leather', 'bag', 'wallet', 'belt', 'shoes'],
      'stone': ['stone', 'sculpture', 'carving', 'statue']
    };

    const allText = [
      ...analysis.labels.map((l: any) => l.description),
      ...analysis.text
    ].join(' ').toLowerCase();

    let bestMatch = 'handicraft';
    let maxScore = 0;

    Object.entries(craftKeywords).forEach(([craft, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (allText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = craft;
      }
    });

    return bestMatch;
  }

  private determineRegion(analysis: any): string {
    // This would typically use more sophisticated region detection
    // For now, return a default or use location data if available
    return 'India';
  }

  private async processVoiceDescription(audioBase64: string, language: string): Promise<string> {
    // In a real implementation, this would use Google Cloud Speech-to-Text
    // For now, return a placeholder
    return 'Voice description processed';
  }

  private async generateEnhancedContent(params: {
    imageAnalysis: any;
    voiceText: string;
    language: string;
    artisanId: string;
    category?: string;
    materials?: string[];
    techniques?: string[];
  }): Promise<any> {
    const model = this.geminiAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Create a compelling product listing for an Indian artisan marketplace based on the following information:

    Image Analysis:
    - Craft Type: ${params.imageAnalysis.craftType}
    - Detected Objects: ${params.imageAnalysis.analysis.objects.map((o: any) => o.name).join(', ')}
    - Colors: ${params.imageAnalysis.analysis.colors.map((c: any) => c.color).join(', ')}
    - Labels: ${params.imageAnalysis.analysis.labels.map((l: any) => l.description).join(', ')}

    Voice Description: ${params.voiceText}

    Requirements:
    1. Create an engaging title (max 60 characters)
    2. Write a detailed description highlighting cultural significance
    3. Identify materials used
    4. Identify traditional techniques
    5. Suggest appropriate category and subcategory
    6. Generate relevant tags
    7. Suggest a fair price range
    8. Emphasize authenticity and craftsmanship

    Language: ${params.language}
    Target Audience: International buyers interested in authentic Indian crafts

    Respond in JSON format with the following structure:
    {
      "title": "string",
      "description": "string",
      "culturalSignificance": "string",
      "materials": ["string"],
      "techniques": ["string"],
      "category": "string",
      "subcategory": "string",
      "tags": ["string"],
      "suggestedPrice": number
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      logger.error('Error generating enhanced content:', error);
      throw new Error('Failed to generate enhanced content');
    }
  }

  private async generateCulturalStory(params: {
    craftType: string;
    region: string;
    artisanId: string;
    language: string;
  }): Promise<string> {
    const model = this.geminiAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Create a compelling cultural story for a ${params.craftType} from ${params.region}.
    
    The story should:
    1. Highlight the cultural heritage and traditions
    2. Explain the significance of this craft in Indian culture
    3. Mention traditional techniques and materials
    4. Connect to festivals, rituals, or daily life
    5. Be engaging for international buyers
    6. Be 2-3 paragraphs long
    
    Language: ${params.language}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Error generating cultural story:', error);
      return 'This beautiful craft represents the rich cultural heritage of India, passed down through generations of skilled artisans.';
    }
  }

  private calculateQualityScore(imageAnalysis: any): number {
    // Simple quality scoring based on image analysis
    let score = 0.5; // Base score

    // Add points for clear images
    if (imageAnalysis.analysis.labels.length > 5) score += 0.1;
    if (imageAnalysis.analysis.objects.length > 2) score += 0.1;
    if (imageAnalysis.analysis.colors.length > 2) score += 0.1;

    // Add points for craft-specific indicators
    const craftIndicators = ['handmade', 'traditional', 'artisan', 'craft'];
    const hasCraftIndicators = imageAnalysis.analysis.labels.some((label: any) =>
      craftIndicators.some(indicator => 
        label.description.toLowerCase().includes(indicator)
      )
    );
    
    if (hasCraftIndicators) score += 0.2;

    return Math.min(score, 1.0);
  }

  private calculateAuthenticityScore(imageAnalysis: any, content: any): number {
    // Simple authenticity scoring
    let score = 0.6; // Base score

    // Add points for traditional materials and techniques
    const traditionalMaterials = ['clay', 'silk', 'cotton', 'wood', 'metal', 'stone'];
    const hasTraditionalMaterials = content.materials?.some((material: string) =>
      traditionalMaterials.some(traditional => 
        material.toLowerCase().includes(traditional)
      )
    );
    
    if (hasTraditionalMaterials) score += 0.2;

    // Add points for cultural significance
    if (content.culturalSignificance && content.culturalSignificance.length > 50) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private async generateSEOKeywords(content: any, craftType: string): Promise<string[]> {
    const baseKeywords = [
      'handmade',
      'artisan',
      'traditional',
      'indian craft',
      craftType,
      content.category,
      ...(content.materials || []),
      ...(content.tags || [])
    ];

    // Add regional keywords
    const regionalKeywords = [
      'india',
      'indian handicraft',
      'authentic',
      'cultural',
      'heritage'
    ];

    return [...new Set([...baseKeywords, ...regionalKeywords])].slice(0, 15);
  }
}
