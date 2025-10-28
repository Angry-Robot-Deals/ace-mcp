/**
 * Represents a chat message with role and content.
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for chat completions.
 */
export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  timeout?: number;
}

/**
 * Base interface for all LLM providers.
 * All providers must implement these methods.
 */
export interface LLMProvider {
  /** Provider name for identification */
  readonly name: string;
  
  /**
   * Generate chat completion.
   * @param messages - Array of chat messages
   * @param options - Optional generation parameters
   * @returns Generated text response
   * @throws LLMProviderError on API failures
   */
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  
  /**
   * Generate text embeddings.
   * @param text - Text to embed
   * @returns Embedding vector
   * @throws LLMProviderError on API failures
   */
  embed(text: string): Promise<number[]>;
  
  /**
   * List available models (optional).
   * @returns Array of model names
   */
  listModels?(): Promise<string[]>;
}

/**
 * Configuration for OpenAI provider.
 */
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  embeddingModel?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Configuration for LM Studio provider.
 */
export interface LMStudioConfig {
  baseUrl: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Configuration for Anthropic Claude provider.
 */
export interface AnthropicConfig {
  apiKey: string;
  model?: string; // claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307
  timeout?: number;
  maxRetries?: number;
  maxTokens?: number;
}

/**
 * Configuration for Google Gemini provider.
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string; // gemini-1.5-pro, gemini-1.5-flash
  timeout?: number;
  maxRetries?: number;
}

/**
 * Configuration for Mistral provider.
 */
export interface MistralConfig {
  apiKey: string;
  model?: string; // mistral-large-latest, mixtral-8x7b-instruct
  baseUrl?: string; // For self-hosted instances
  timeout?: number;
  maxRetries?: number;
}

/**
 * Configuration for DeepSeek provider.
 */
export interface DeepSeekConfig {
  apiKey: string;
  model?: string; // deepseek-chat, deepseek-reasoner
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Union of all provider configurations.
 * Uses discriminated union for type safety.
 */
export type LLMProviderConfig = {
  provider: 'openai';
  openai: OpenAIConfig;
} | {
  provider: 'lmstudio';
  lmstudio: LMStudioConfig;
} | {
  provider: 'anthropic';
  anthropic: AnthropicConfig;
} | {
  provider: 'gemini';
  gemini: GeminiConfig;
} | {
  provider: 'mistral';
  mistral: MistralConfig;
} | {
  provider: 'deepseek';
  deepseek: DeepSeekConfig;
};
