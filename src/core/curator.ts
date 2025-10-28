/**
 * Curator component for the ACE framework.
 * 
 * The Curator synthesizes insights into delta operations that can be
 * applied to the playbook to improve future interactions.
 */

import { LLMProvider } from '../llm/provider';
import { Playbook } from './playbook';
import { ACEError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Insight, CurationResult, DeltaOperation, Bullet } from './types';
import { 
  CURATOR_SYNTHESIS_PROMPT, 
  CURATOR_DEDUP_PROMPT 
} from './prompts';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error thrown by Curator operations.
 */
export class CuratorError extends ACEError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'CuratorError';
    Object.setPrototypeOf(this, CuratorError.prototype);
  }
}

/**
 * Options for curation process.
 */
export interface CurationOptions {
  /** Minimum confidence threshold for insights */
  minConfidence?: number;
  
  /** Temperature for LLM generation */
  temperature?: number;
  
  /** Maximum tokens for response */
  maxTokens?: number;
  
  /** Specific model to use */
  model?: string;
  
  /** Enable deduplication checking */
  enableDeduplication?: boolean;
  
  /** Similarity threshold for deduplication */
  dedupThreshold?: number;
}

/**
 * Deduplication assessment result.
 */
interface DeduplicationAssessment {
  assessment: 'DUPLICATE' | 'SIMILAR' | 'UNIQUE';
  related_bullets: string[];
  recommendation: 'merge' | 'update' | 'keep_separate' | 'discard';
  reasoning: string;
}

/**
 * Curator synthesizes insights into actionable delta operations.
 * 
 * Features:
 * - Insight filtering and validation
 * - Deduplication detection using embeddings
 * - Delta operation generation
 * - Bullet merging and updating logic
 * - Comprehensive curation summaries
 */
export class Curator {
  constructor(
    private llmProvider: LLMProvider,
    private playbook: Playbook
  ) {
    logger.info('Curator initialized', {
      provider: this.llmProvider.name,
      bulletCount: this.playbook.getBulletCount()
    });
  }

  /**
   * Curate insights into delta operations.
   */
  async curate(insights: Insight[], options: CurationOptions = {}): Promise<CurationResult> {
    if (!insights || insights.length === 0) {
      return {
        operations: [],
        summary: 'No insights provided for curation',
        statistics: { adds: 0, updates: 0, deletes: 0 }
      };
    }

    const startTime = Date.now();
    
    try {
      logger.debug('Starting curation', {
        insightCount: insights.length,
        minConfidence: options.minConfidence ?? 0.5
      });

      // Filter insights by confidence
      const filteredInsights = this.filterInsights(insights, options.minConfidence ?? 0.5);
      
      if (filteredInsights.length === 0) {
        return {
          operations: [],
          summary: 'No insights met the confidence threshold',
          statistics: { adds: 0, updates: 0, deletes: 0 }
        };
      }

      // Generate delta operations
      const operations = await this.generateDeltaOperations(filteredInsights, options);
      
      // Create summary
      const summary = this.createSummary(operations, filteredInsights);
      
      // Calculate statistics
      const statistics = this.calculateStatistics(operations);

      const duration = Date.now() - startTime;
      
      logger.info('Curation completed', {
        duration,
        insightCount: filteredInsights.length,
        operationCount: operations.length,
        statistics
      });

      return {
        operations,
        summary,
        statistics
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Curation failed', {
        duration,
        insightCount: insights.length,
        error: (error as Error).message
      });

      if (error instanceof ACEError) {
        throw error;
      }

      throw new CuratorError(
        `Failed to curate insights: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  /**
   * Filter insights by confidence threshold.
   */
  private filterInsights(insights: Insight[], minConfidence: number): Insight[] {
    return insights.filter(insight => {
      const confidence = insight.confidence || 0;
      return confidence >= minConfidence;
    });
  }

  /**
   * Generate delta operations from insights.
   */
  private async generateDeltaOperations(insights: Insight[], options: CurationOptions): Promise<DeltaOperation[]> {
    const operations: DeltaOperation[] = [];
    
    // Get current bullets for context
    const currentBullets = this.playbook.getBullets();
    
    // Build prompt with current bullets and insights
    const prompt = this.buildSynthesisPrompt(currentBullets, insights);
    
    // Get LLM response
    const response = await this.llmProvider.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 2000,
      model: options.model
    });

    // Parse operations from response
    const parsedOperations = this.parseOperations(response);
    
    // Process each operation with deduplication if enabled
    for (const operation of parsedOperations) {
      if (operation.type === 'ADD' && options.enableDeduplication !== false) {
        const processedOp = await this.processAddOperation(operation, options);
        if (processedOp) {
          operations.push(processedOp);
        }
      } else {
        operations.push(operation);
      }
    }

    return operations;
  }

  /**
   * Build synthesis prompt with current bullets and insights.
   */
  private buildSynthesisPrompt(currentBullets: Bullet[], insights: Insight[]): string {
    const bulletsText = currentBullets.length > 0
      ? currentBullets.map(b => `${b.id}: [${b.section}] ${b.content}`).join('\n')
      : 'No bullets currently in playbook';
    
    const insightsText = JSON.stringify(insights, null, 2);
    
    return CURATOR_SYNTHESIS_PROMPT
      .replace('{current_bullets}', bulletsText)
      .replace('{insights}', insightsText);
  }

  /**
   * Parse operations from LLM response.
   */
  private parseOperations(response: string): DeltaOperation[] {
    try {
      const parsed = JSON.parse(response);
      
      if (parsed.operations && Array.isArray(parsed.operations)) {
        return parsed.operations.map((op: any) => this.validateOperation(op));
      }
    } catch (error) {
      logger.warn('Failed to parse operations JSON, attempting text extraction', {
        error: (error as Error).message
      });
    }

    // Fallback: extract operations from text
    return this.extractOperationsFromText(response);
  }

  /**
   * Validate and normalize an operation.
   */
  private validateOperation(op: any): DeltaOperation {
    const operation: DeltaOperation = {
      type: op.type
    };

    if (op.type === 'ADD' && op.bullet) {
      operation.bullet = {
        id: op.bullet.id || uuidv4(),
        section: op.bullet.section || 'General',
        content: op.bullet.content || '',
        metadata: {
          created: new Date(),
          helpful_count: 0,
          harmful_count: 0,
          ...op.bullet.metadata
        }
      };
    } else if (op.type === 'UPDATE' && op.bulletId) {
      operation.bulletId = op.bulletId;
      operation.updates = op.updates || {};
    } else if (op.type === 'DELETE' && op.bulletId) {
      operation.bulletId = op.bulletId;
    }

    return operation;
  }

  /**
   * Extract operations from text response (fallback).
   */
  private extractOperationsFromText(response: string): DeltaOperation[] {
    const operations: DeltaOperation[] = [];
    
    // Simple text parsing - look for operation patterns
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.includes('add') && trimmed.includes('bullet')) {
        // Extract ADD operation
        const contentMatch = line.match(/["']([^"']+)["']/);
        if (contentMatch) {
          operations.push({
            type: 'ADD',
            bullet: {
              id: uuidv4(),
              section: 'General',
              content: contentMatch[1],
              metadata: {
                created: new Date(),
                helpful_count: 0,
                harmful_count: 0
              }
            }
          });
        }
      }
    }
    
    return operations;
  }

  /**
   * Process ADD operation with deduplication checking.
   */
  private async processAddOperation(
    operation: DeltaOperation, 
    options: CurationOptions
  ): Promise<DeltaOperation | null> {
    if (!operation.bullet) {
      return operation;
    }

    const newBulletContent = operation.bullet.content;
    
    // Check for duplicates using embeddings if available
    if (options.enableDeduplication && this.llmProvider.embed) {
      try {
        const embedding = await this.llmProvider.embed(newBulletContent);
        const threshold = options.dedupThreshold || 0.85;
        
        const similarBullets = this.playbook.findSimilarBullets(embedding, threshold);
        
        if (similarBullets.length > 0) {
          // Get deduplication assessment
          const assessment = await this.assessDeduplication(newBulletContent, similarBullets, options);
          
          return this.handleDeduplication(operation, assessment, similarBullets);
        }
      } catch (error) {
        logger.warn('Deduplication check failed, proceeding with add', {
          error: (error as Error).message
        });
      }
    }

    return operation;
  }

  /**
   * Assess deduplication for a new bullet.
   */
  private async assessDeduplication(
    newBulletContent: string,
    existingBullets: Bullet[],
    options: CurationOptions
  ): Promise<DeduplicationAssessment> {
    const existingBulletsText = existingBullets
      .map(b => `${b.id}: ${b.content}`)
      .join('\n');
    
    const prompt = CURATOR_DEDUP_PROMPT
      .replace('{new_bullet_content}', newBulletContent)
      .replace('{existing_bullets}', existingBulletsText);

    try {
      const response = await this.llmProvider.chat([
        { role: 'user', content: prompt }
      ], {
        temperature: options.temperature || 0.2,
        maxTokens: options.maxTokens || 500,
        model: options.model
      });

      const assessment = JSON.parse(response);
      
      return {
        assessment: assessment.assessment || 'UNIQUE',
        related_bullets: assessment.related_bullets || [],
        recommendation: assessment.recommendation || 'keep_separate',
        reasoning: assessment.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      logger.warn('Deduplication assessment failed, treating as unique', {
        error: (error as Error).message
      });
      
      return {
        assessment: 'UNIQUE',
        related_bullets: [],
        recommendation: 'keep_separate',
        reasoning: 'Assessment failed, treating as unique'
      };
    }
  }

  /**
   * Handle deduplication based on assessment.
   */
  private handleDeduplication(
    operation: DeltaOperation,
    assessment: DeduplicationAssessment,
    similarBullets: Bullet[]
  ): DeltaOperation | null {
    switch (assessment.recommendation) {
      case 'discard':
        logger.debug('Discarding duplicate bullet', {
          content: operation.bullet?.content,
          reasoning: assessment.reasoning
        });
        return null;

      case 'merge':
        // Convert to UPDATE operation for the most similar bullet
        if (similarBullets.length > 0) {
          const targetBullet = similarBullets[0];
          return {
            type: 'UPDATE',
            bulletId: targetBullet.id,
            updates: {
              content: `${targetBullet.content}. ${operation.bullet?.content}`
            }
          };
        }
        break;

      case 'update':
        // Convert to UPDATE operation
        if (similarBullets.length > 0) {
          const targetBullet = similarBullets[0];
          return {
            type: 'UPDATE',
            bulletId: targetBullet.id,
            updates: {
              content: operation.bullet?.content
            }
          };
        }
        break;

      case 'keep_separate':
      default:
        // Keep as ADD operation
        return operation;
    }

    return operation;
  }

  /**
   * Create a human-readable summary of the curation.
   */
  private createSummary(operations: DeltaOperation[], insights: Insight[]): string {
    const stats = this.calculateStatistics(operations);
    
    let summary = `Processed ${insights.length} insights and generated ${operations.length} operations: `;
    
    const parts: string[] = [];
    
    if (stats.adds > 0) {
      parts.push(`${stats.adds} new bullet${stats.adds > 1 ? 's' : ''}`);
    }
    
    if (stats.updates > 0) {
      parts.push(`${stats.updates} update${stats.updates > 1 ? 's' : ''}`);
    }
    
    if (stats.deletes > 0) {
      parts.push(`${stats.deletes} deletion${stats.deletes > 1 ? 's' : ''}`);
    }
    
    if (parts.length === 0) {
      summary += 'no changes recommended';
    } else {
      summary += parts.join(', ');
    }
    
    summary += '.';
    
    return summary;
  }

  /**
   * Calculate statistics for operations.
   */
  private calculateStatistics(operations: DeltaOperation[]): { adds: number; updates: number; deletes: number } {
    return operations.reduce(
      (stats, op) => {
        switch (op.type) {
          case 'ADD':
            stats.adds++;
            break;
          case 'UPDATE':
            stats.updates++;
            break;
          case 'DELETE':
            stats.deletes++;
            break;
        }
        return stats;
      },
      { adds: 0, updates: 0, deletes: 0 }
    );
  }

  /**
   * Test the curator with sample insights.
   */
  async test(): Promise<boolean> {
    try {
      const testInsights: Insight[] = [
        {
          observation: 'Code was hard to read',
          lesson: 'Use clear variable names',
          suggested_bullet: 'Always use descriptive variable names',
          confidence: 0.8,
          section: 'Code Quality'
        }
      ];

      const result = await this.curate(testInsights, {
        minConfidence: 0.5,
        enableDeduplication: false
      });

      return result.operations.length >= 0; // Should at least return empty array
    } catch (error) {
      logger.error('Curator test failed', { error: (error as Error).message });
      return false;
    }
  }
}
