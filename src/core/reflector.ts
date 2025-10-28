/**
 * Reflector component for the ACE framework.
 * 
 * The Reflector analyzes trajectories to extract insights and lessons
 * that can improve future LLM interactions.
 */

import { LLMProvider } from '../llm/provider';
import { ACEError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Trajectory, Insight, ReflectionResult } from './types';
import { 
  REFLECTOR_ANALYSIS_PROMPT, 
  REFLECTOR_REFINEMENT_PROMPT,
  QUALITY_ASSESSMENT_PROMPT 
} from './prompts';

/**
 * Error thrown by Reflector operations.
 */
export class ReflectorError extends ACEError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ReflectorError';
    Object.setPrototypeOf(this, ReflectorError.prototype);
  }
}

/**
 * Options for reflection process.
 */
export interface ReflectionOptions {
  /** Maximum number of refinement iterations */
  maxIterations?: number;
  
  /** Minimum quality threshold to stop refinement */
  qualityThreshold?: number;
  
  /** Temperature for LLM generation */
  temperature?: number;
  
  /** Maximum tokens for response */
  maxTokens?: number;
  
  /** Specific model to use */
  model?: string;
  
  /** Enable thinking mode for deeper analysis */
  thinkingMode?: boolean;
}

/**
 * Quality assessment result.
 */
interface QualityAssessment {
  overall_quality: number;
  insight_scores: Array<{
    insight_index: number;
    specificity: number;
    relevance: number;
    novelty: number;
    confidence: number;
    overall: number;
  }>;
  improvement_suggestions: string[];
  should_refine: boolean;
}

/**
 * Reflector analyzes trajectories to extract actionable insights.
 * 
 * Features:
 * - Iterative refinement process
 * - Quality scoring and assessment
 * - Insight extraction and validation
 * - Support for thinking mode
 * - Configurable refinement parameters
 */
export class Reflector {
  constructor(
    private llmProvider: LLMProvider,
    private maxIterations: number = 5
  ) {
    logger.info('Reflector initialized', {
      provider: this.llmProvider.name,
      maxIterations: this.maxIterations
    });
  }

  /**
   * Reflect on a trajectory to extract insights.
   */
  async reflect(trajectory: Trajectory, options: ReflectionOptions = {}): Promise<ReflectionResult> {
    const maxIterations = options.maxIterations || this.maxIterations;
    const qualityThreshold = options.qualityThreshold || 0.8;
    
    if (!trajectory.query || !trajectory.response) {
      throw new ReflectorError('Trajectory must have both query and response');
    }

    const startTime = Date.now();
    
    try {
      logger.debug('Starting reflection', {
        queryLength: trajectory.query.length,
        responseLength: trajectory.response.length,
        bulletsUsed: trajectory.bullets_used.length,
        maxIterations
      });

      // Initial analysis
      let insights = await this.performInitialAnalysis(trajectory, options);
      let currentQuality = 0;
      let iterations = 1;

      // Iterative refinement
      while (iterations < maxIterations) {
        const assessment = await this.assessQuality(insights, options);
        currentQuality = assessment.overall_quality;
        
        logger.debug('Quality assessment', {
          iteration: iterations,
          quality: currentQuality,
          threshold: qualityThreshold,
          shouldRefine: assessment.should_refine
        });

        if (currentQuality >= qualityThreshold || !assessment.should_refine) {
          break;
        }

        // Refine insights
        insights = await this.refineInsights(insights, assessment, options);
        iterations++;
      }

      const duration = Date.now() - startTime;
      
      logger.info('Reflection completed', {
        duration,
        iterations,
        finalQuality: currentQuality,
        insightCount: insights.length
      });

      return {
        insights,
        iterations,
        quality_score: currentQuality
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Reflection failed', {
        duration,
        error: (error as Error).message
      });

      if (error instanceof ACEError) {
        throw error;
      }

      throw new ReflectorError(
        `Failed to reflect on trajectory: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  /**
   * Perform initial analysis of the trajectory.
   */
  private async performInitialAnalysis(trajectory: Trajectory, options: ReflectionOptions): Promise<Insight[]> {
    const prompt = this.buildAnalysisPrompt(trajectory, options.thinkingMode);
    
    const response = await this.llmProvider.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 2000,
      model: options.model
    });

    return this.parseInsights(response);
  }

  /**
   * Build the analysis prompt for the trajectory.
   */
  private buildAnalysisPrompt(trajectory: Trajectory, thinkingMode?: boolean): string {
    const bulletsUsedText = trajectory.bullets_used.length > 0 
      ? trajectory.bullets_used.join(', ')
      : 'None';
    
    const bulletsHelpfulText = trajectory.bullets_helpful.length > 0
      ? trajectory.bullets_helpful.join(', ')
      : 'None';
    
    const bulletsHarmfulText = trajectory.bullets_harmful.length > 0
      ? trajectory.bullets_harmful.join(', ')
      : 'None';

    let prompt = REFLECTOR_ANALYSIS_PROMPT
      .replace('{query}', trajectory.query)
      .replace('{response}', trajectory.response)
      .replace('{bullets_used}', bulletsUsedText)
      .replace('{bullets_helpful}', bulletsHelpfulText)
      .replace('{bullets_harmful}', bulletsHarmfulText);

    if (thinkingMode) {
      prompt = `Think step by step about this interaction. Consider multiple perspectives and dig deep into the patterns.\n\n${prompt}`;
    }

    return prompt;
  }

  /**
   * Parse insights from LLM response.
   */
  private parseInsights(response: string): Insight[] {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      
      if (parsed.insights && Array.isArray(parsed.insights)) {
        return parsed.insights.map((insight: any) => ({
          observation: insight.observation || '',
          lesson: insight.lesson || '',
          suggested_bullet: insight.suggested_bullet || '',
          confidence: Math.max(0, Math.min(1, insight.confidence || 0.5)),
          section: insight.section || 'General'
        }));
      }
    } catch (error) {
      logger.warn('Failed to parse insights JSON, attempting text extraction', {
        error: (error as Error).message
      });
    }

    // Fallback: extract insights from text
    return this.extractInsightsFromText(response);
  }

  /**
   * Extract insights from text response (fallback).
   */
  private extractInsightsFromText(response: string): Insight[] {
    const insights: Insight[] = [];
    
    // Simple text parsing - look for structured patterns
    const lines = response.split('\n');
    let currentInsight: Partial<Insight> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('observation:')) {
        if (currentInsight.observation) {
          // Save previous insight
          if (this.isValidInsight(currentInsight)) {
            insights.push(this.completeInsight(currentInsight));
          }
          currentInsight = {};
        }
        currentInsight.observation = trimmed.replace(/observation:\s*/i, '');
      } else if (trimmed.toLowerCase().includes('lesson:')) {
        currentInsight.lesson = trimmed.replace(/lesson:\s*/i, '');
      } else if (trimmed.toLowerCase().includes('suggested_bullet:')) {
        currentInsight.suggested_bullet = trimmed.replace(/suggested_bullet:\s*/i, '');
      } else if (trimmed.toLowerCase().includes('confidence:')) {
        const confidenceMatch = trimmed.match(/confidence:\s*([0-9.]+)/i);
        if (confidenceMatch) {
          currentInsight.confidence = parseFloat(confidenceMatch[1]);
        }
      } else if (trimmed.toLowerCase().includes('section:')) {
        currentInsight.section = trimmed.replace(/section:\s*/i, '');
      }
    }
    
    // Save last insight
    if (this.isValidInsight(currentInsight)) {
      insights.push(this.completeInsight(currentInsight));
    }
    
    return insights;
  }

  /**
   * Check if insight has required fields.
   */
  private isValidInsight(insight: Partial<Insight>): boolean {
    return !!(insight.observation && insight.lesson && insight.suggested_bullet);
  }

  /**
   * Complete insight with defaults.
   */
  private completeInsight(insight: Partial<Insight>): Insight {
    return {
      observation: insight.observation || '',
      lesson: insight.lesson || '',
      suggested_bullet: insight.suggested_bullet || '',
      confidence: insight.confidence || 0.5,
      section: insight.section || 'General'
    };
  }

  /**
   * Assess the quality of insights.
   */
  private async assessQuality(insights: Insight[], options: ReflectionOptions): Promise<QualityAssessment> {
    if (insights.length === 0) {
      return {
        overall_quality: 0,
        insight_scores: [],
        improvement_suggestions: ['No insights were extracted'],
        should_refine: true
      };
    }

    const prompt = QUALITY_ASSESSMENT_PROMPT.replace(
      '{insights}', 
      JSON.stringify(insights, null, 2)
    );

    const response = await this.llmProvider.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: options.temperature || 0.2,
      maxTokens: options.maxTokens || 1000,
      model: options.model
    });

    try {
      const assessment = JSON.parse(response);
      return {
        overall_quality: Math.max(0, Math.min(1, assessment.overall_quality || 0)),
        insight_scores: assessment.insight_scores || [],
        improvement_suggestions: assessment.improvement_suggestions || [],
        should_refine: assessment.should_refine !== false
      };
    } catch (error) {
      logger.warn('Failed to parse quality assessment, using defaults');
      
      // Fallback assessment
      const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
      
      return {
        overall_quality: avgConfidence,
        insight_scores: [],
        improvement_suggestions: ['Could not assess quality properly'],
        should_refine: avgConfidence < 0.7
      };
    }
  }

  /**
   * Refine insights based on quality assessment.
   */
  private async refineInsights(
    insights: Insight[], 
    assessment: QualityAssessment, 
    options: ReflectionOptions
  ): Promise<Insight[]> {
    const prompt = REFLECTOR_REFINEMENT_PROMPT
      .replace('{current_insights}', JSON.stringify(insights, null, 2))
      .replace('{quality_feedback}', JSON.stringify({
        overall_quality: assessment.overall_quality,
        suggestions: assessment.improvement_suggestions
      }, null, 2));

    const response = await this.llmProvider.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 2000,
      model: options.model
    });

    const refinedInsights = this.parseInsights(response);
    
    // If refinement failed, return original insights
    if (refinedInsights.length === 0) {
      logger.warn('Refinement produced no insights, keeping original');
      return insights;
    }
    
    return refinedInsights;
  }

  /**
   * Test the reflector with a simple trajectory.
   */
  async test(): Promise<boolean> {
    try {
      const testTrajectory: Trajectory = {
        query: 'How do I write better code?',
        response: 'To write better code, follow these practices: 1) Write clear, readable code 2) Add proper comments 3) Use meaningful variable names 4) Write tests',
        bullets_used: [],
        bullets_helpful: [],
        bullets_harmful: [],
        metadata: {
          model: 'test',
          timestamp: new Date(),
          tokens_used: 50
        }
      };

      const result = await this.reflect(testTrajectory, {
        maxIterations: 1,
        qualityThreshold: 0.1
      });

      return result.insights.length > 0;
    } catch (error) {
      logger.error('Reflector test failed', { error: (error as Error).message });
      return false;
    }
  }
}
