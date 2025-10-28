import axios from 'axios';
import { LLMProvider, Message, ChatOptions, LMStudioConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class LMStudioProvider implements LLMProvider {
  public readonly name = 'lmstudio';
  private client: any;
  private config: LMStudioConfig;

  constructor(config: LMStudioConfig) {
    this.config = {
      timeout: 60000,
      maxRetries: 3,
      ...config
    };
    
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('LM Studio provider initialized', {
      baseUrl: this.config.baseUrl,
      model: this.config.model
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('LM Studio chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      const response = await this.client.post('/chat/completions', {
        model: options?.model || this.config.model || 'local-model',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature,
        max_tokens: options?.maxTokens
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LM Studio');
      }

      logger.debug('LM Studio chat completed', {
        model: response.data.model,
        usage: response.data.usage
      });

      return content;
    } catch (error) {
      logger.error('LM Studio chat failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `LM Studio chat failed: ${message}`,
          'lmstudio',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `LM Studio chat failed: ${(error as Error).message}`,
        'lmstudio',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      logger.debug('LM Studio embedding request', {
        textLength: text.length,
        model: this.config.model
      });

      const response = await this.client.post('/embeddings', {
        model: this.config.model || 'local-model',
        input: text
      });

      const embedding = response.data.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Empty embedding from LM Studio');
      }

      logger.debug('LM Studio embedding completed', {
        dimensions: embedding.length
      });

      return embedding;
    } catch (error) {
      logger.error('LM Studio embedding failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `LM Studio embedding failed: ${message}`,
          'lmstudio',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `LM Studio embedding failed: ${(error as Error).message}`,
        'lmstudio',
        error as Error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      logger.debug('LM Studio list models request');

      const response = await this.client.get('/models');
      const models = response.data.data.map((m: any) => m.id);

      logger.debug('LM Studio list models completed', {
        modelCount: models.length
      });

      return models;
    } catch (error) {
      logger.error('LM Studio list models failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `LM Studio list models failed: ${message}`,
          'lmstudio',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `LM Studio list models failed: ${(error as Error).message}`,
        'lmstudio',
        error as Error
      );
    }
  }
}
