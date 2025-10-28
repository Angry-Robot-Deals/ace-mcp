import axios from 'axios';
import { LLMProvider, Message, ChatOptions, MistralConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class MistralProvider implements LLMProvider {
  public readonly name = 'mistral';
  private client: any;
  private config: MistralConfig;

  constructor(config: MistralConfig) {
    this.config = {
      model: 'mistral-large-latest', // Default to Large model
      baseUrl: 'https://api.mistral.ai/v1',
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
    
    logger.info('Mistral provider initialized', {
      model: this.config.model,
      baseUrl: this.config.baseUrl
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('Mistral chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      const response = await this.client.post('/chat/completions', {
        model: options?.model || this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        stream: false
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Mistral');
      }

      logger.debug('Mistral chat completed', {
        model: response.data.model,
        usage: response.data.usage,
        finishReason: response.data.choices[0]?.finish_reason
      });

      return content;
    } catch (error) {
      logger.error('Mistral chat failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `Mistral chat failed: ${message}`,
          'mistral',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `Mistral chat failed: ${(error as Error).message}`,
        'mistral',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      logger.debug('Mistral embedding request', {
        textLength: text.length
      });

      // Mistral uses mistral-embed model for embeddings
      const response = await this.client.post('/embeddings', {
        model: 'mistral-embed',
        input: text
      });

      const embedding = response.data.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Empty embedding from Mistral');
      }

      logger.debug('Mistral embedding completed', {
        dimensions: embedding.length
      });

      return embedding;
    } catch (error) {
      logger.error('Mistral embedding failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `Mistral embedding failed: ${message}`,
          'mistral',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `Mistral embedding failed: ${(error as Error).message}`,
        'mistral',
        error as Error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      logger.debug('Mistral list models request');

      const response = await this.client.get('/models');
      const models = response.data.data.map((m: any) => m.id);

      logger.debug('Mistral list models completed', {
        modelCount: models.length
      });

      return models;
    } catch (error) {
      logger.error('Mistral list models failed', { error });
      
      // Return known models if API fails
      const knownModels = [
        'mistral-large-latest',
        'mistral-medium-latest',
        'mistral-small-latest',
        'mixtral-8x7b-instruct',
        'mixtral-8x22b-instruct'
      ];
      logger.info('Returning known Mistral models', { models: knownModels });
      return knownModels;
    }
  }
}
