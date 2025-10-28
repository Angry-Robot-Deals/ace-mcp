/**
 * Playbook management system for the ACE framework.
 * 
 * The Playbook stores and manages context bullets that guide LLM behavior.
 * It supports CRUD operations, filtering, search, and delta operations.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ACEError } from '../utils/errors';
import {
  Bullet,
  DeltaOperation,
  PlaybookStats,
  BulletFilter,
  BulletSearchOptions,
  BulletSearchResult,
  ACEConfig
} from './types';
import { DEFAULT_ACE_CONFIG } from './prompts';

/**
 * Error thrown by Playbook operations.
 */
export class PlaybookError extends ACEError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'PlaybookError';
    Object.setPrototypeOf(this, PlaybookError.prototype);
  }
}

/**
 * Playbook manages a collection of context bullets.
 * 
 * Features:
 * - In-memory storage with optional persistence
 * - Section-based organization
 * - Metadata tracking (helpful/harmful counts)
 * - Filtering and search capabilities
 * - Delta operation application
 * - Deduplication support
 */
export class Playbook {
  private bullets: Map<string, Bullet> = new Map();
  private config: ACEConfig;

  constructor(config: Partial<ACEConfig> = {}) {
    this.config = { ...DEFAULT_ACE_CONFIG, ...config };
    logger.info('Playbook initialized', {
      maxSize: this.config.maxPlaybookSize,
      dedupThreshold: this.config.dedupThreshold,
      defaultSections: this.config.defaultSections.length
    });
  }

  /**
   * Add a new bullet to the playbook.
   */
  addBullet(section: string, content: string, metadata?: Partial<Bullet['metadata']>): Bullet {
    if (this.bullets.size >= this.config.maxPlaybookSize) {
      throw new PlaybookError(`Playbook size limit reached (${this.config.maxPlaybookSize})`);
    }

    if (!section || !content.trim()) {
      throw new PlaybookError('Section and content are required');
    }

    const bullet: Bullet = {
      id: uuidv4(),
      section: section.trim(),
      content: content.trim(),
      metadata: {
        created: new Date(),
        helpful_count: 0,
        harmful_count: 0,
        ...metadata
      }
    };

    this.bullets.set(bullet.id, bullet);
    
    logger.debug('Bullet added', {
      id: bullet.id,
      section: bullet.section,
      contentLength: bullet.content.length
    });

    return bullet;
  }

  /**
   * Get a bullet by ID.
   */
  getBullet(id: string): Bullet | undefined {
    return this.bullets.get(id);
  }

  /**
   * Update an existing bullet.
   */
  updateBullet(id: string, updates: Partial<Bullet>): Bullet {
    const bullet = this.bullets.get(id);
    if (!bullet) {
      throw new PlaybookError(`Bullet not found: ${id}`);
    }

    // Create updated bullet
    const updatedBullet: Bullet = {
      ...bullet,
      ...updates,
      id: bullet.id, // Preserve ID
      metadata: {
        ...bullet.metadata,
        ...updates.metadata
      }
    };

    // Validate required fields
    if (!updatedBullet.section || !updatedBullet.content.trim()) {
      throw new PlaybookError('Section and content are required');
    }

    this.bullets.set(id, updatedBullet);
    
    logger.debug('Bullet updated', {
      id,
      section: updatedBullet.section,
      contentLength: updatedBullet.content.length
    });

    return updatedBullet;
  }

  /**
   * Delete a bullet by ID.
   */
  deleteBullet(id: string): boolean {
    const existed = this.bullets.delete(id);
    
    if (existed) {
      logger.debug('Bullet deleted', { id });
    }

    return existed;
  }

  /**
   * Get all bullets, optionally filtered.
   */
  getBullets(filter?: BulletFilter): Bullet[] {
    let bullets = Array.from(this.bullets.values());

    if (!filter) {
      return bullets;
    }

    // Apply filters
    if (filter.section) {
      bullets = bullets.filter(b => b.section === filter.section);
    }

    if (filter.min_helpful_count !== undefined) {
      bullets = bullets.filter(b => b.metadata.helpful_count >= filter.min_helpful_count!);
    }

    if (filter.max_harmful_count !== undefined) {
      bullets = bullets.filter(b => b.metadata.harmful_count <= filter.max_harmful_count!);
    }

    if (filter.content_contains) {
      const query = filter.content_contains.toLowerCase();
      bullets = bullets.filter(b => b.content.toLowerCase().includes(query));
    }

    if (filter.created_after) {
      bullets = bullets.filter(b => b.metadata.created >= filter.created_after!);
    }

    if (filter.created_before) {
      bullets = bullets.filter(b => b.metadata.created <= filter.created_before!);
    }

    if (filter.used_after && filter.used_after) {
      bullets = bullets.filter(b => 
        b.metadata.last_used && b.metadata.last_used >= filter.used_after!
      );
    }

    if (filter.used_before) {
      bullets = bullets.filter(b => 
        b.metadata.last_used && b.metadata.last_used <= filter.used_before!
      );
    }

    return bullets;
  }

  /**
   * Search bullets using text search and optional embeddings.
   */
  async searchBullets(options: BulletSearchOptions): Promise<BulletSearchResult[]> {
    const { query, limit = 10, use_embeddings = false, min_similarity = 0.5 } = options;
    const results: BulletSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const bullet of this.bullets.values()) {
      const contentLower = bullet.content.toLowerCase();
      
      // Exact match
      if (contentLower === queryLower) {
        results.push({
          bullet,
          score: 1.0,
          match_type: 'exact'
        });
        continue;
      }

      // Substring match
      if (contentLower.includes(queryLower)) {
        const score = queryLower.length / contentLower.length;
        results.push({
          bullet,
          score: Math.min(score * 2, 0.9), // Boost substring matches but cap at 0.9
          match_type: 'substring'
        });
        continue;
      }

      // Embedding-based search (if available and requested)
      if (use_embeddings && bullet.metadata.embedding) {
        // Note: This would require query embedding, which needs LLM provider
        // For now, we'll skip embedding search in the base implementation
        // This can be enhanced when integrated with LLM providers
      }
    }

    // Sort by score descending and apply limit
    results.sort((a, b) => b.score - a.score);
    
    // Filter by minimum similarity
    const filtered = results.filter(r => r.score >= min_similarity);
    
    return filtered.slice(0, limit);
  }

  /**
   * Get bullets by section.
   */
  getBulletsBySection(section: string): Bullet[] {
    return this.getBullets({ section });
  }

  /**
   * Get all sections in the playbook.
   */
  getSections(): string[] {
    const sections = new Set<string>();
    for (const bullet of this.bullets.values()) {
      sections.add(bullet.section);
    }
    return Array.from(sections).sort();
  }

  /**
   * Mark bullets as helpful or harmful based on trajectory feedback.
   */
  updateBulletFeedback(bulletIds: string[], type: 'helpful' | 'harmful'): void {
    const now = new Date();
    
    for (const id of bulletIds) {
      const bullet = this.bullets.get(id);
      if (bullet) {
        if (type === 'helpful') {
          bullet.metadata.helpful_count++;
        } else {
          bullet.metadata.harmful_count++;
        }
        bullet.metadata.last_used = now;
        
        logger.debug('Bullet feedback updated', {
          id,
          type,
          helpful_count: bullet.metadata.helpful_count,
          harmful_count: bullet.metadata.harmful_count
        });
      }
    }
  }

  /**
   * Apply delta operations to the playbook.
   */
  async applyDeltas(operations: DeltaOperation[]): Promise<void> {
    const results = {
      added: 0,
      updated: 0,
      deleted: 0,
      errors: 0
    };

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'ADD':
            if (!operation.bullet) {
              throw new PlaybookError('ADD operation requires bullet data');
            }
            
            // Generate new ID if not provided
            const bulletToAdd = {
              ...operation.bullet,
              id: operation.bullet.id || uuidv4()
            };
            
            this.bullets.set(bulletToAdd.id, bulletToAdd);
            results.added++;
            break;

          case 'UPDATE':
            if (!operation.bulletId || !operation.updates) {
              throw new PlaybookError('UPDATE operation requires bulletId and updates');
            }
            
            this.updateBullet(operation.bulletId, operation.updates);
            results.updated++;
            break;

          case 'DELETE':
            if (!operation.bulletId) {
              throw new PlaybookError('DELETE operation requires bulletId');
            }
            
            const deleted = this.deleteBullet(operation.bulletId);
            if (deleted) {
              results.deleted++;
            }
            break;

          default:
            throw new PlaybookError(`Unknown operation type: ${(operation as any).type}`);
        }
      } catch (error) {
        results.errors++;
        logger.error('Delta operation failed', {
          operation: operation.type,
          bulletId: operation.bulletId,
          error: (error as Error).message
        });
      }
    }

    logger.info('Delta operations applied', results);
  }

  /**
   * Get playbook statistics.
   */
  getStats(): PlaybookStats {
    const bullets = Array.from(this.bullets.values());
    
    if (bullets.length === 0) {
      return {
        total_bullets: 0,
        bullets_by_section: {},
        avg_helpful_count: 0,
        avg_harmful_count: 0
      };
    }

    // Count bullets by section
    const bullets_by_section: Record<string, number> = {};
    for (const bullet of bullets) {
      bullets_by_section[bullet.section] = (bullets_by_section[bullet.section] || 0) + 1;
    }

    // Calculate averages
    const totalHelpful = bullets.reduce((sum, b) => sum + b.metadata.helpful_count, 0);
    const totalHarmful = bullets.reduce((sum, b) => sum + b.metadata.harmful_count, 0);
    
    // Find most recent and most helpful bullets
    const mostRecent = bullets
      .filter(b => b.metadata.last_used)
      .sort((a, b) => (b.metadata.last_used?.getTime() || 0) - (a.metadata.last_used?.getTime() || 0))[0];
    
    const mostHelpful = bullets
      .sort((a, b) => b.metadata.helpful_count - a.metadata.helpful_count)[0];

    return {
      total_bullets: bullets.length,
      bullets_by_section,
      avg_helpful_count: totalHelpful / bullets.length,
      avg_harmful_count: totalHarmful / bullets.length,
      most_recent_bullet: mostRecent,
      most_helpful_bullet: mostHelpful
    };
  }

  /**
   * Get the total number of bullets.
   */
  getBulletCount(): number {
    return this.bullets.size;
  }

  /**
   * Clear all bullets from the playbook.
   */
  clear(): void {
    const count = this.bullets.size;
    this.bullets.clear();
    logger.info('Playbook cleared', { bulletCount: count });
  }

  /**
   * Export playbook data for persistence.
   */
  export(): Bullet[] {
    return Array.from(this.bullets.values());
  }

  /**
   * Import playbook data from persistence.
   */
  import(bullets: Bullet[]): void {
    this.bullets.clear();
    
    for (const bullet of bullets) {
      // Validate bullet structure
      if (!bullet.id || !bullet.section || !bullet.content || !bullet.metadata) {
        logger.warn('Skipping invalid bullet during import', { bullet });
        continue;
      }
      
      this.bullets.set(bullet.id, bullet);
    }
    
    logger.info('Playbook imported', { bulletCount: this.bullets.size });
  }

  /**
   * Calculate cosine similarity between two embedding vectors.
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new PlaybookError('Embedding vectors must have the same length');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Find similar bullets using embedding similarity.
   */
  findSimilarBullets(embedding: number[], threshold: number = this.config.dedupThreshold): Bullet[] {
    const similar: Bullet[] = [];
    
    for (const bullet of this.bullets.values()) {
      if (bullet.metadata.embedding) {
        const similarity = Playbook.cosineSimilarity(embedding, bullet.metadata.embedding);
        if (similarity >= threshold) {
          similar.push(bullet);
        }
      }
    }
    
    return similar.sort((a, b) => {
      const simA = Playbook.cosineSimilarity(embedding, a.metadata.embedding!);
      const simB = Playbook.cosineSimilarity(embedding, b.metadata.embedding!);
      return simB - simA;
    });
  }
}
