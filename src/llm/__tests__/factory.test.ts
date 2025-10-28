import { createLLMProvider } from '../factory';
import { OpenAIProvider } from '../openai';
import { LMStudioProvider } from '../lmstudio';
import { DeepSeekProvider } from '../deepseek';
import { AnthropicProvider } from '../anthropic';
import { GeminiProvider } from '../gemini';
import { MistralProvider } from '../mistral';

// Mock the provider classes
jest.mock('../openai');
jest.mock('../lmstudio');
jest.mock('../deepseek');
jest.mock('../anthropic');
jest.mock('../gemini');
jest.mock('../mistral');

const MockedOpenAIProvider = OpenAIProvider as jest.MockedClass<typeof OpenAIProvider>;
const MockedLMStudioProvider = LMStudioProvider as jest.MockedClass<typeof LMStudioProvider>;
const MockedDeepSeekProvider = DeepSeekProvider as jest.MockedClass<typeof DeepSeekProvider>;
const MockedAnthropicProvider = AnthropicProvider as jest.MockedClass<typeof AnthropicProvider>;
const MockedGeminiProvider = GeminiProvider as jest.MockedClass<typeof GeminiProvider>;
const MockedMistralProvider = MistralProvider as jest.MockedClass<typeof MistralProvider>;

describe('createLLMProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create OpenAI provider', () => {
    const config = {
      provider: 'openai' as const,
      openai: { apiKey: 'test-key' }
    };

    const provider = createLLMProvider(config);

    expect(MockedOpenAIProvider).toHaveBeenCalledWith(config.openai);
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('should create LM Studio provider', () => {
    const config = {
      provider: 'lmstudio' as const,
      lmstudio: { baseUrl: 'http://localhost:1234/v1' }
    };

    const provider = createLLMProvider(config);

    expect(MockedLMStudioProvider).toHaveBeenCalledWith(config.lmstudio);
    expect(provider).toBeInstanceOf(LMStudioProvider);
  });

  it('should throw on unknown provider', () => {
    const config = { provider: 'unknown' } as any;

    expect(() => {
      createLLMProvider(config);
    }).toThrow('Unknown LLM provider: unknown');
  });

  it('should pass correct config to OpenAI provider', () => {
    const openaiConfig = {
      apiKey: 'sk-test123',
      model: 'gpt-3.5-turbo',
      timeout: 60000
    };

    const config = {
      provider: 'openai' as const,
      openai: openaiConfig
    };

    createLLMProvider(config);

    expect(MockedOpenAIProvider).toHaveBeenCalledWith(openaiConfig);
  });

  it('should pass correct config to LM Studio provider', () => {
    const lmstudioConfig = {
      baseUrl: 'http://10.242.247.136:11888/v1',
      model: 'llama-2',
      timeout: 120000
    };

    const config = {
      provider: 'lmstudio' as const,
      lmstudio: lmstudioConfig
    };

    createLLMProvider(config);

    expect(MockedLMStudioProvider).toHaveBeenCalledWith(lmstudioConfig);
  });

  it('should create DeepSeek provider', () => {
    const config = {
      provider: 'deepseek' as const,
      deepseek: { apiKey: 'sk-test-key' }
    };

    const provider = createLLMProvider(config);

    expect(MockedDeepSeekProvider).toHaveBeenCalledWith(config.deepseek);
    expect(provider).toBeInstanceOf(DeepSeekProvider);
  });

  it('should create Anthropic provider', () => {
    const config = {
      provider: 'anthropic' as const,
      anthropic: { apiKey: 'sk-ant-test-key' }
    };

    const provider = createLLMProvider(config);

    expect(MockedAnthropicProvider).toHaveBeenCalledWith(config.anthropic);
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('should create Gemini provider', () => {
    const config = {
      provider: 'gemini' as const,
      gemini: { apiKey: 'google-api-key' }
    };

    const provider = createLLMProvider(config);

    expect(MockedGeminiProvider).toHaveBeenCalledWith(config.gemini);
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('should create Mistral provider', () => {
    const config = {
      provider: 'mistral' as const,
      mistral: { apiKey: 'mistral-api-key' }
    };

    const provider = createLLMProvider(config);

    expect(MockedMistralProvider).toHaveBeenCalledWith(config.mistral);
    expect(provider).toBeInstanceOf(MistralProvider);
  });
});
