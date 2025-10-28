import { DeepSeekProvider } from '../deepseek';
import { LLMProviderError } from '../../utils/errors';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn()
  }))
}));

describe('DeepSeekProvider', () => {
  let provider: DeepSeekProvider;
  let mockClient: any;

  beforeEach(() => {
    const axios = require('axios');
    mockClient = {
      post: jest.fn(),
      get: jest.fn()
    };
    axios.create.mockReturnValue(mockClient);

    provider = new DeepSeekProvider({
      apiKey: 'test-key'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(provider.name).toBe('deepseek');
    });

    it('should use custom config values', () => {
      const customProvider = new DeepSeekProvider({
        apiKey: 'custom-key',
        model: 'deepseek-reasoner',
        timeout: 120000
      });

      expect(customProvider.name).toBe('deepseek');
    });
  });

  describe('chat()', () => {
    it('should return chat completion', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Hello, world!' } }],
          model: 'deepseek-chat',
          usage: { total_tokens: 10 }
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const result = await provider.chat(messages);

      expect(result).toBe('Hello, world!');
      expect(mockClient.post).toHaveBeenCalledWith('/chat/completions', {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      });
    });

    it('should use deepseek-reasoner with higher token limit', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Reasoning response' } }],
          model: 'deepseek-reasoner',
          usage: { total_tokens: 100 }
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'Complex question' }];
      const result = await provider.chat(messages, { model: 'deepseek-reasoner' });

      expect(result).toBe('Reasoning response');
      expect(mockClient.post).toHaveBeenCalledWith('/chat/completions', {
        model: 'deepseek-reasoner',
        messages: [{ role: 'user', content: 'Complex question' }],
        temperature: 0.7,
        max_tokens: 32000, // Higher limit for reasoner
        stream: false
      });
    });

    it('should throw LLMProviderError on API failure', async () => {
      const error = new Error('API Error');
      mockClient.post.mockRejectedValue(error);

      const messages = [{ role: 'user' as const, content: 'Hello' }];

      await expect(provider.chat(messages)).rejects.toThrow(LLMProviderError);
      await expect(provider.chat(messages)).rejects.toThrow('DeepSeek chat failed: API Error');
    });
  });

  describe('embed()', () => {
    it('should return embeddings', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockResponse = {
        data: {
          data: [{ embedding: mockEmbedding }]
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await provider.embed('test text');

      expect(result).toEqual(mockEmbedding);
      expect(mockClient.post).toHaveBeenCalledWith('/embeddings', {
        model: 'text-embedding-ada-002',
        input: 'test text'
      });
    });

    it('should throw LLMProviderError on failure', async () => {
      const error = new Error('Embedding Error');
      mockClient.post.mockRejectedValue(error);

      await expect(provider.embed('test')).rejects.toThrow(LLMProviderError);
    });
  });

  describe('listModels()', () => {
    it('should return list of models', async () => {
      const mockModels = [
        { id: 'deepseek-chat' },
        { id: 'deepseek-reasoner' }
      ];
      const mockResponse = { data: { data: mockModels } };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await provider.listModels();

      expect(result).toEqual(['deepseek-chat', 'deepseek-reasoner']);
      expect(mockClient.get).toHaveBeenCalledWith('/models');
    });

    it('should return known models on API failure', async () => {
      const error = new Error('Models Error');
      mockClient.get.mockRejectedValue(error);

      const result = await provider.listModels();

      expect(result).toEqual(['deepseek-chat', 'deepseek-reasoner']);
    });
  });
});
