import axios from 'axios';
import { LLMProvider, Message, ChatOptions, GeminiConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  private client: any;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-1.5-pro', // Default to Pro version
      timeout: 60000,
      maxRetries: 3,
      ...config
    };
    
    this.client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('Gemini provider initialized', {
      model: this.config.model
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('Gemini chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      const model = options?.model || this.config.model;
      const geminiMessages = this.convertMessages(messages);
      
      const response = await this.client.post(
        `/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          contents: geminiMessages,
          generationConfig: {
            temperature: options?.temperature,
            maxOutputTokens: options?.maxTokens,
          }
        }
      );

      const content = response.data.candidates[0]?.content?.parts[0]?.text;
      if (!content) {
        throw new Error('Empty response from Gemini');
      }

      logger.debug('Gemini chat completed', {
        model: model,
        usage: response.data.usageMetadata,
        finishReason: response.data.candidates[0]?.finishReason
      });

      return content;
    } catch (error) {
      logger.error('Gemini chat failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `Gemini chat failed: ${message}`,
          'gemini',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `Gemini chat failed: ${(error as Error).message}`,
        'gemini',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      logger.debug('Gemini embedding request', {
        textLength: text.length
      });

      // Use text-embedding-004 model for embeddings
      const response = await this.client.post(
        `/models/text-embedding-004:embedContent?key=${this.config.apiKey}`,
        {
          content: {
            parts: [{ text: text }]
          }
        }
      );

      const embedding = response.data.embedding?.values;
      if (!embedding) {
        throw new Error('Empty embedding from Gemini');
      }

      logger.debug('Gemini embedding completed', {
        dimensions: embedding.length
      });

      return embedding;
    } catch (error) {
      logger.error('Gemini embedding failed', { error });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new LLMProviderError(
          `Gemini embedding failed: ${message}`,
          'gemini',
          axiosError
        );
      }
      
      throw new LLMProviderError(
        `Gemini embedding failed: ${(error as Error).message}`,
        'gemini',
        error as Error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      logger.debug('Gemini list models request');

      const response = await this.client.get(`/models?key=${this.config.apiKey}`);
      const models = response.data.models
        .filter((m: any) => m.name.includes('gemini'))
        .map((m: any) => m.name.split('/').pop());

      logger.debug('Gemini list models completed', {
        modelCount: models.length
      });

      return models;
    } catch (error) {
      logger.error('Gemini list models failed', { error });
      
      // Return known models if API fails
      const knownModels = ['gemini-1.5-pro', 'gemini-1.5-flash'];
      logger.info('Returning known Gemini models', { models: knownModels });
      return knownModels;
    }
  }

  private convertMessages(messages: Message[]): any[] {
    const geminiMessages: any[] = [];
    
    for (const message of messages) {
      // Gemini uses 'user' and 'model' roles
      const role = message.role === 'assistant' ? 'model' : 
                   message.role === 'system' ? 'user' : message.role;
      
      geminiMessages.push({
        role: role,
        parts: [{ text: message.content }]
      });
    }

    return geminiMessages;
  }
}
