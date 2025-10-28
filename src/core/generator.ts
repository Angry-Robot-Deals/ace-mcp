/**
 * Generator component for the ACE framework.
 * 
 * The Generator creates trajectories by using LLM providers with playbook context.
 * It tracks which bullets were helpful or harmful during generation.
 */

import { LLMProvider } from '../llm/provider';
import { Playbook } from './playbook';
import { ACEError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Trajectory } from './types';
import { 
  GENERATOR_SYSTEM_PROMPT, 
  formatBulletsForPrompt, 
  extractBulletTracking 
} from './prompts';

/**
 * Error thrown by Generator operations.
 */
export class GeneratorError extends ACEError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'GeneratorError';
    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

/**
 * Options for trajectory generation.
 */
export interface GenerationOptions {
  /** Temperature for LLM generation (0.0 to 1.0) */
  temperature?: number;
  
  /** Maximum tokens for response */
  maxTokens?: number;
  
  /** Specific model to use (overrides provider default) */
  model?: string;
  
  /** Custom system prompt (overrides default) */
  systemPrompt?: string;
  
  /** Maximum number of bullets to include in context */
  maxBullets?: number;
  
  /** Sections to prioritize when selecting bullets */
  prioritySections?: string[];
}

/**
 * Generator creates trajectories using LLM providers with playbook context.
 * 
 * Features:
 * - Uses playbook bullets as system context
 * - Tracks helpful/harmful bullet feedback
 * - Supports configurable generation options
 * - Handles LLM provider errors gracefully
 * - Logs generation metrics
 */
export class Generator {
  constructor(
    private llmProvider: LLMProvider,
    private playbook: Playbook
  ) {
    logger.info('Generator initialized', {
      provider: this.llmProvider.name,
      bulletCount: this.playbook.getBulletCount()
    });
  }

  /**
   * Generate a trajectory for the given query.
   */
  async generate(query: string, options: GenerationOptions = {}): Promise<Trajectory> {
    if (!query.trim()) {
      throw new GeneratorError('Query cannot be empty');
    }

    const startTime = Date.now();
    
    try {
      // Select bullets for context
      const selectedBullets = this.selectBullets(options);
      
      // Format system prompt
      const systemPrompt = this.buildSystemPrompt(selectedBullets, options.systemPrompt);
      
      // Generate response
      logger.debug('Generating trajectory', {
        query: query.substring(0, 100),
        bulletCount: selectedBullets.length,
        model: options.model || 'default'
      });

      const response = await this.llmProvider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ], {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        model: options.model
      });

      // Extract bullet tracking from response
      const bulletTracking = extractBulletTracking(response);
      
      // Create trajectory
      const trajectory: Trajectory = {
        query,
        response,
        bullets_used: selectedBullets.map(b => b.id),
        bullets_helpful: bulletTracking.helpful,
        bullets_harmful: bulletTracking.harmful,
        metadata: {
          model: options.model || this.llmProvider.name,
          timestamp: new Date(),
          tokens_used: this.estimateTokens(query + response)
        }
      };

      // Update playbook with feedback
      if (bulletTracking.helpful.length > 0) {
        this.playbook.updateBulletFeedback(bulletTracking.helpful, 'helpful');
      }
      
      if (bulletTracking.harmful.length > 0) {
        this.playbook.updateBulletFeedback(bulletTracking.harmful, 'harmful');
      }

      const duration = Date.now() - startTime;
      
      logger.info('Trajectory generated', {
        duration,
        bulletCount: selectedBullets.length,
        helpfulBullets: bulletTracking.helpful.length,
        harmfulBullets: bulletTracking.harmful.length,
        responseLength: response.length
      });

      return trajectory;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Trajectory generation failed', {
        duration,
        query: query.substring(0, 100),
        error: (error as Error).message
      });

      if (error instanceof ACEError) {
        throw error;
      }

      throw new GeneratorError(
        `Failed to generate trajectory: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  /**
   * Select bullets to include in the system prompt.
   */
  private selectBullets(options: GenerationOptions): Array<{ id: string; section: string; content: string }> {
    const maxBullets = options.maxBullets || 20;
    const prioritySections = options.prioritySections || [];
    
    let bullets = this.playbook.getBullets();
    
    // If no bullets available, return empty array
    if (bullets.length === 0) {
      return [];
    }

    // Sort bullets by priority and helpfulness
    bullets.sort((a, b) => {
      // Priority sections first
      const aPriority = prioritySections.includes(a.section) ? 1 : 0;
      const bPriority = prioritySections.includes(b.section) ? 1 : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by helpfulness ratio
      const aRatio = this.calculateHelpfulnessRatio(a);
      const bRatio = this.calculateHelpfulnessRatio(b);
      
      if (aRatio !== bRatio) {
        return bRatio - aRatio;
      }
      
      // Finally by recency
      const aTime = a.metadata.last_used?.getTime() || 0;
      const bTime = b.metadata.last_used?.getTime() || 0;
      
      return bTime - aTime;
    });

    // Take top bullets up to maxBullets
    const selectedBullets = bullets.slice(0, maxBullets);
    
    return selectedBullets.map(b => ({
      id: b.id,
      section: b.section,
      content: b.content
    }));
  }

  /**
   * Calculate helpfulness ratio for a bullet.
   */
  private calculateHelpfulnessRatio(bullet: { metadata: { helpful_count: number; harmful_count: number } }): number {
    const total = bullet.metadata.helpful_count + bullet.metadata.harmful_count;
    
    if (total === 0) {
      return 0.5; // Neutral for unused bullets
    }
    
    return bullet.metadata.helpful_count / total;
  }

  /**
   * Build the system prompt with bullets.
   */
  private buildSystemPrompt(bullets: Array<{ id: string; section: string; content: string }>, customPrompt?: string): string {
    if (customPrompt) {
      return customPrompt.replace('{bullets}', formatBulletsForPrompt(bullets));
    }
    
    return GENERATOR_SYSTEM_PROMPT.replace('{bullets}', formatBulletsForPrompt(bullets));
  }

  /**
   * Estimate token count (rough approximation).
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Get generation statistics.
   */
  getStats(): {
    totalGenerations: number;
    averageBulletsUsed: number;
    helpfulnessRate: number;
  } {
    // This would be implemented with persistent storage in a real system
    // For now, return placeholder values
    return {
      totalGenerations: 0,
      averageBulletsUsed: 0,
      helpfulnessRate: 0
    };
  }

  /**
   * Test the generator with a simple query.
   */
  async test(query: string = "Hello, how are you?"): Promise<boolean> {
    try {
      const trajectory = await this.generate(query, {
        temperature: 0.1,
        maxTokens: 50
      });
      
      return trajectory.response.length > 0;
    } catch (error) {
      logger.error('Generator test failed', { error: (error as Error).message });
      return false;
    }
  }
}
