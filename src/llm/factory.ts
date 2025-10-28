import { LLMProvider, LLMProviderConfig } from './provider';
import { OpenAIProvider } from './openai';
import { LMStudioProvider } from './lmstudio';
import { DeepSeekProvider } from './deepseek';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { MistralProvider } from './mistral';
import { logger } from '../utils/logger';

/**
 * Creates an LLM provider instance based on configuration.
 * 
 * @param config - Provider configuration
 * @returns Instantiated provider
 * @throws Error if provider type is unknown
 * 
 * @example
 * ```typescript
 * const provider = createLLMProvider({
 *   provider: 'deepseek',
 *   deepseek: { apiKey: 'sk-xxx' }
 * });
 * ```
 */
export function createLLMProvider(config: LLMProviderConfig): LLMProvider {
  logger.info('Creating LLM provider', { provider: config.provider });

  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config.openai);
    
    case 'lmstudio':
      return new LMStudioProvider(config.lmstudio);
    
    case 'deepseek':
      return new DeepSeekProvider(config.deepseek);
    
    case 'anthropic':
      return new AnthropicProvider(config.anthropic);
    
    case 'gemini':
      return new GeminiProvider(config.gemini);
    
    case 'mistral':
      return new MistralProvider(config.mistral);
    
    default:
      // TypeScript should prevent this, but handle runtime case
      throw new Error(`Unknown LLM provider: ${(config as any).provider}`);
  }
}

/**
 * Re-export provider types for convenience.
 */
export type { LLMProvider, LLMProviderConfig, Message, ChatOptions } from './provider';
export { OpenAIProvider } from './openai';
export { LMStudioProvider } from './lmstudio';
export { DeepSeekProvider } from './deepseek';
export { AnthropicProvider } from './anthropic';
export { GeminiProvider } from './gemini';
export { MistralProvider } from './mistral';
