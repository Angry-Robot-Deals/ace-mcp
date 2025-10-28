import { OpenAIProvider } from '../openai';
import { LLMProviderError } from '../../utils/errors';

// Mock OpenAI SDK
jest.mock('openai');

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  },
  embeddings: {
    create: jest.fn()
  },
  models: {
    list: jest.fn()
  }
};

// Mock the OpenAI constructor
const OpenAIMock = jest.fn().mockImplementation(() => mockOpenAI);
require('openai').default = OpenAIMock;

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OpenAIProvider({
      apiKey: 'test-key'
    });
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(provider.name).toBe('openai');
      expect(OpenAIMock).toHaveBeenCalledWith({
        apiKey: 'test-key',
        timeout: 30000,
        maxRetries: 3
      });
    });

    it('should use custom config values', () => {
      const customProvider = new OpenAIProvider({
        apiKey: 'custom-key',
        model: 'gpt-3.5-turbo',
        timeout: 60000
      });

      expect(customProvider.name).toBe('openai');
    });
  });

  describe('chat()', () => {
    it('should return chat completion', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hello, world!' } }],
        model: 'gpt-4',
        usage: { total_tokens: 10 }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const result = await provider.chat(messages);

      expect(result).toBe('Hello, world!');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: undefined,
        max_tokens: undefined
      }, {
        timeout: 30000
      });
    });

    it('should use custom options', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
        model: 'gpt-3.5-turbo',
        usage: { total_tokens: 5 }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'Test' }];
      const options = {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 100
      };

      await provider.chat(messages, options);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.7,
        max_tokens: 100
      }, {
        timeout: 30000
      });
    });

    it('should throw LLMProviderError on API failure', async () => {
      const error = new Error('API Error');
      mockOpenAI.chat.completions.create.mockRejectedValue(error);

      const messages = [{ role: 'user' as const, content: 'Hello' }];

      await expect(provider.chat(messages)).rejects.toThrow(LLMProviderError);
      await expect(provider.chat(messages)).rejects.toThrow('OpenAI chat failed: API Error');
    });

    it('should throw error on empty response', async () => {
      const mockResponse = {
        choices: [{ message: { content: null } }],
        model: 'gpt-4'
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'Hello' }];

      await expect(provider.chat(messages)).rejects.toThrow(LLMProviderError);
    });
  });

  describe('embed()', () => {
    it('should return embeddings', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockResponse = {
        data: [{ embedding: mockEmbedding }],
        model: 'text-embedding-3-small'
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockResponse);

      const result = await provider.embed('test text');

      expect(result).toEqual(mockEmbedding);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'test text'
      });
    });

    it('should throw LLMProviderError on failure', async () => {
      const error = new Error('Embedding Error');
      mockOpenAI.embeddings.create.mockRejectedValue(error);

      await expect(provider.embed('test')).rejects.toThrow(LLMProviderError);
    });
  });

  describe('listModels()', () => {
    it('should return list of models', async () => {
      const mockModels = [
        { id: 'gpt-4' },
        { id: 'gpt-3.5-turbo' }
      ];
      const mockResponse = { data: mockModels };

      mockOpenAI.models.list.mockResolvedValue(mockResponse);

      const result = await provider.listModels();

      expect(result).toEqual(['gpt-4', 'gpt-3.5-turbo']);
      expect(mockOpenAI.models.list).toHaveBeenCalled();
    });

    it('should throw LLMProviderError on failure', async () => {
      const error = new Error('Models Error');
      mockOpenAI.models.list.mockRejectedValue(error);

      await expect(provider.listModels()).rejects.toThrow(LLMProviderError);
    });
  });
});
