import axios from 'axios';
import { LLMProvider, Message, ChatOptions, DeepSeekConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class DeepSeekProvider implements LLMProvider {
  public readonly name = 'deepseek';
  private client: any;
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = {
      model: 'deepseek-chat', // Default to V3.2-Exp non-thinking mode
      baseUrl: 'https://api.deepseek.com/v1',
      timeout: 60000,
      maxRetries: 3,
      ...config
    };
    
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });
    
    logger.info('DeepSeek provider initialized', {
      model: this.config.model,
      baseUrl: this.config.baseUrl
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('DeepSeek chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      const model = options?.model || this.config.model;
      
      // DeepSeek V3.2-Exp supports both deepseek-chat and deepseek-reasoner
      const response = await this.client.post('/chat/completions', {
        model: model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || (model === 'deepseek-reasoner' ? 32000 : 4000),
        stream: false
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from DeepSeek');
      }

      logger.debug('DeepSeek chat completed', {
        model: response.data.model,
        usage: response.data.usage,
        finishReason: response.data.choices[0]?.finish_reason
      });

      return content;
    } catch (error) {
      logger.error('DeepSeek chat failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `DeepSeek chat failed: ${message}`,
          'deepseek',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `DeepSeek chat failed: ${(error as Error).message}`,
        'deepseek',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      logger.debug('DeepSeek embedding request', {
        textLength: text.length
      });

      // DeepSeek uses text-embedding-ada-002 compatible endpoint
      const response = await this.client.post('/embeddings', {
        model: 'text-embedding-ada-002',
        input: text
      });

      const embedding = response.data.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Empty embedding from DeepSeek');
      }

      logger.debug('DeepSeek embedding completed', {
        dimensions: embedding.length
      });

      return embedding;
    } catch (error) {
      logger.error('DeepSeek embedding failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `DeepSeek embedding failed: ${message}`,
          'deepseek',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `DeepSeek embedding failed: ${(error as Error).message}`,
        'deepseek',
        error as Error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      logger.debug('DeepSeek list models request');

      const response = await this.client.get('/models');
      const models = response.data.data.map((m: any) => m.id);

      logger.debug('DeepSeek list models completed', {
        modelCount: models.length
      });

      return models;
    } catch (error) {
      logger.error('DeepSeek list models failed', { error });
      
      // Return known models if API fails
      const knownModels = ['deepseek-chat', 'deepseek-reasoner'];
      logger.info('Returning known DeepSeek models', { models: knownModels });
      return knownModels;
    }
  }
}
