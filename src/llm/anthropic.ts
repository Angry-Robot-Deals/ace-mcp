import axios from 'axios';
import { LLMProvider, Message, ChatOptions, AnthropicConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AnthropicProvider implements LLMProvider {
  public readonly name = 'anthropic';
  private client: any;
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    this.config = {
      model: 'claude-3-sonnet-20240229', // Default to Sonnet (balanced cost/performance)
      timeout: 60000,
      maxRetries: 3,
      maxTokens: 4000,
      ...config
    };
    
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    
    logger.info('Anthropic provider initialized', {
      model: this.config.model,
      maxTokens: this.config.maxTokens
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('Anthropic chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      // Convert messages to Anthropic format
      const anthropicMessages = this.convertMessages(messages);
      
      const response = await this.client.post('/messages', {
        model: options?.model || this.config.model,
        messages: anthropicMessages.messages,
        system: anthropicMessages.system,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature
      });

      const content = response.data.content[0]?.text;
      if (!content) {
        throw new Error('Empty response from Anthropic');
      }

      logger.debug('Anthropic chat completed', {
        model: response.data.model,
        usage: response.data.usage,
        stopReason: response.data.stop_reason
      });

      return content;
    } catch (error) {
      logger.error('Anthropic chat failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `Anthropic chat failed: ${message}`,
          'anthropic',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `Anthropic chat failed: ${(error as Error).message}`,
        'anthropic',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    // Anthropic doesn't provide embeddings API
    // Use a fallback or throw an informative error
    throw new LLMProviderError(
      'Anthropic does not provide embeddings API. Consider using OpenAI or another provider for embeddings.',
      'anthropic'
    );
  }

  async listModels(): Promise<string[]> {
    // Anthropic doesn't provide a models endpoint, return known models
    const knownModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
    
    logger.debug('Returning known Anthropic models', {
      modelCount: knownModels.length
    });
    
    return knownModels;
  }

  private convertMessages(messages: Message[]): { messages: any[], system?: string } {
    let system: string | undefined;
    const anthropicMessages: any[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        // Anthropic uses separate system parameter
        system = message.content;
      } else {
        anthropicMessages.push({
          role: message.role,
          content: message.content
        });
      }
    }

    return { messages: anthropicMessages, system };
  }
}
