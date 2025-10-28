/**
 * Core types and interfaces for the ACE (Agentic Context Engineering) framework.
 * 
 * These types define the data structures used throughout the ACE system for
 * managing context bullets, trajectories, insights, and delta operations.
 */

/**
 * A context bullet containing guidance or information.
 */
export interface Bullet {
  /** Unique identifier for the bullet */
  id: string;
  
  /** Section/category this bullet belongs to (e.g., "Code Generation", "Testing") */
  section: string;
  
  /** The actual content/guidance text */
  content: string;
  
  /** Metadata about the bullet's usage and performance */
  metadata: {
    /** When this bullet was created */
    created: Date;
    
    /** Number of times this bullet was marked as helpful */
    helpful_count: number;
    
    /** Number of times this bullet was marked as harmful */
    harmful_count: number;
    
    /** Last time this bullet was used in a trajectory */
    last_used?: Date;
    
    /** Embedding vector for semantic similarity (optional) */
    embedding?: number[];
  };
}

/**
 * A delta operation that can be applied to modify the playbook.
 */
export interface DeltaOperation {
  /** Type of operation to perform */
  type: 'ADD' | 'UPDATE' | 'DELETE';
  
  /** New bullet to add (for ADD operations) */
  bullet?: Bullet;
  
  /** ID of bullet to update or delete */
  bulletId?: string;
  
  /** Partial updates to apply (for UPDATE operations) */
  updates?: Partial<Bullet>;
}

/**
 * A trajectory represents a single interaction with the LLM,
 * including the query, response, and bullet tracking.
 */
export interface Trajectory {
  /** The user's query/prompt */
  query: string;
  
  /** The LLM's response */
  response: string;
  
  /** IDs of bullets that were included in the system prompt */
  bullets_used: string[];
  
  /** IDs of bullets that were marked as helpful in the response */
  bullets_helpful: string[];
  
  /** IDs of bullets that were marked as harmful in the response */
  bullets_harmful: string[];
  
  /** Metadata about the trajectory generation */
  metadata: {
    /** LLM model used for generation */
    model: string;
    
    /** When this trajectory was generated */
    timestamp: Date;
    
    /** Number of tokens used (if available) */
    tokens_used?: number;
  };
}

/**
 * An insight extracted from analyzing a trajectory.
 */
export interface Insight {
  /** What was observed in the trajectory */
  observation: string;
  
  /** The lesson learned from this observation */
  lesson: string;
  
  /** Suggested bullet content based on this insight */
  suggested_bullet: string;
  
  /** Confidence score for this insight (0.0 to 1.0) */
  confidence: number;
  
  /** Suggested section for the bullet */
  section: string;
}

/**
 * Result of the reflection process.
 */
export interface ReflectionResult {
  /** Insights extracted from the trajectory */
  insights: Insight[];
  
  /** Number of refinement iterations performed */
  iterations: number;
  
  /** Overall quality score of the reflection (0.0 to 1.0) */
  quality_score: number;
}

/**
 * Result of the curation process.
 */
export interface CurationResult {
  /** Delta operations to apply to the playbook */
  operations: DeltaOperation[];
  
  /** Human-readable summary of the curation */
  summary: string;
  
  /** Statistics about the operations */
  statistics: {
    /** Number of ADD operations */
    adds: number;
    
    /** Number of UPDATE operations */
    updates: number;
    
    /** Number of DELETE operations */
    deletes: number;
  };
}

/**
 * Configuration for the ACE framework.
 */
export interface ACEConfig {
  /** Maximum number of bullets in a playbook */
  maxPlaybookSize: number;
  
  /** Similarity threshold for deduplication (0.0 to 1.0) */
  dedupThreshold: number;
  
  /** Maximum number of reflector iterations */
  maxReflectorIterations: number;
  
  /** Default sections for organizing bullets */
  defaultSections: string[];
}

/**
 * Statistics about a playbook.
 */
export interface PlaybookStats {
  /** Total number of bullets */
  total_bullets: number;
  
  /** Number of bullets by section */
  bullets_by_section: Record<string, number>;
  
  /** Average helpful count across all bullets */
  avg_helpful_count: number;
  
  /** Average harmful count across all bullets */
  avg_harmful_count: number;
  
  /** Most recently used bullet */
  most_recent_bullet?: Bullet;
  
  /** Most helpful bullet (highest helpful_count) */
  most_helpful_bullet?: Bullet;
}

/**
 * Options for filtering bullets.
 */
export interface BulletFilter {
  /** Filter by section */
  section?: string;
  
  /** Filter by minimum helpful count */
  min_helpful_count?: number;
  
  /** Filter by maximum harmful count */
  max_harmful_count?: number;
  
  /** Filter by content (substring match) */
  content_contains?: string;
  
  /** Filter by creation date range */
  created_after?: Date;
  created_before?: Date;
  
  /** Filter by last used date range */
  used_after?: Date;
  used_before?: Date;
}

/**
 * Options for searching bullets.
 */
export interface BulletSearchOptions {
  /** Search query */
  query: string;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Use embedding-based semantic search if available */
  use_embeddings?: boolean;
  
  /** Minimum similarity score for embedding search */
  min_similarity?: number;
}

/**
 * Search result for bullets.
 */
export interface BulletSearchResult {
  /** The matching bullet */
  bullet: Bullet;
  
  /** Similarity score (0.0 to 1.0) */
  score: number;
  
  /** Type of match (exact, substring, embedding) */
  match_type: 'exact' | 'substring' | 'embedding';
}
