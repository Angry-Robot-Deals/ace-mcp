import OpenAI from 'openai';
import { LLMProvider, Message, ChatOptions, OpenAIConfig } from './provider';
import { LLMProviderError } from '../utils/errors';
import { logger } from '../utils/logger';

export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      embeddingModel: 'text-embedding-3-small',
      timeout: 30000,
      maxRetries: 3,
      ...config
    };
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    });
    
    logger.info('OpenAI provider initialized', {
      model: this.config.model,
      embeddingModel: this.config.embeddingModel
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      logger.debug('OpenAI chat request', {
        messageCount: messages.length,
        model: options?.model || this.config.model
      });

      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model!,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature,
        max_tokens: options?.maxTokens
      }, {
        timeout: options?.timeout || this.config.timeout
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      logger.debug('OpenAI chat completed', {
        model: response.model,
        usage: response.usage
      });

      return content;
    } catch (error) {
      logger.error('OpenAI chat failed', { error });
      throw new LLMProviderError(
        `OpenAI chat failed: ${(error as Error).message}`,
        'openai',
        error as Error
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      logger.debug('OpenAI embedding request', {
        textLength: text.length,
        model: this.config.embeddingModel
      });

      const response = await this.client.embeddings.create({
        model: this.config.embeddingModel!,
        input: text
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Empty embedding from OpenAI');
      }

      logger.debug('OpenAI embedding completed', {
        model: response.model,
        dimensions: embedding.length
      });

      return embedding;
    } catch (error) {
      logger.error('OpenAI embedding failed', { error });
      throw new LLMProviderError(
        `OpenAI embedding failed: ${(error as Error).message}`,
        'openai',
        error as Error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      logger.debug('OpenAI list models request');

      const response = await this.client.models.list();
      const models = response.data.map(m => m.id);

      logger.debug('OpenAI list models completed', {
        modelCount: models.length
      });

      return models;
    } catch (error) {
      logger.error('OpenAI list models failed', { error });
      throw new LLMProviderError(
        `OpenAI list models failed: ${(error as Error).message}`,
        'openai',
        error as Error
      );
    }
  }
}
