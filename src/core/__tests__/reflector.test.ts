/**
 * Unit tests for the Reflector component.
 */

import { Reflector, ReflectorError } from '../reflector';
import { LLMProvider, Message, ChatOptions } from '../../llm/provider';
import { Trajectory } from '../types';

// Mock LLM Provider for Reflector
class MockReflectorProvider implements LLMProvider {
  public readonly name = 'mock-reflector';
  
  constructor(private mockResponse?: string) {}

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (this.mockResponse) {
      return this.mockResponse;
    }

    // Default mock response with valid JSON
    return JSON.stringify({
      insights: [
        {
          observation: 'The response provided good structure',
          lesson: 'Structured responses are more helpful',
          suggested_bullet: 'Always structure responses with numbered points',
          confidence: 0.8,
          section: 'Response Structure'
        }
      ]
    });
  }

  async embed(text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3];
  }
}

describe('Reflector', () => {
  let reflector: Reflector;
  let mockProvider: MockReflectorProvider;
  let testTrajectory: Trajectory;

  beforeEach(() => {
    mockProvider = new MockReflectorProvider();
    reflector = new Reflector(mockProvider, 3);
    
    testTrajectory = {
      query: 'How do I write better code?',
      response: 'To write better code: 1) Use clear names 2) Write tests 3) Add comments',
      bullets_used: ['bullet-1', 'bullet-2'],
      bullets_helpful: ['bullet-1'],
      bullets_harmful: ['bullet-2'],
      metadata: {
        model: 'test-model',
        timestamp: new Date(),
        tokens_used: 50
      }
    };
  });

  describe('reflect', () => {
    it('should extract insights from trajectory successfully', async () => {
      const result = await reflector.reflect(testTrajectory);
      
      expect(result.insights).toHaveLength(1);
      expect(result.insights[0].observation).toBe('The response provided good structure');
      expect(result.insights[0].lesson).toBe('Structured responses are more helpful');
      expect(result.insights[0].suggested_bullet).toBe('Always structure responses with numbered points');
      expect(result.insights[0].confidence).toBe(0.8);
      expect(result.insights[0].section).toBe('Response Structure');
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.quality_score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty trajectory gracefully', async () => {
      const emptyTrajectory: Trajectory = {
        query: '',
        response: '',
        bullets_used: [],
        bullets_helpful: [],
        bullets_harmful: [],
        metadata: {
          model: 'test',
          timestamp: new Date()
        }
      };

      await expect(reflector.reflect(emptyTrajectory)).rejects.toThrow(ReflectorError);
    });

    it('should handle LLM provider errors', async () => {
      const errorProvider = new (class extends MockReflectorProvider {
        async chat(): Promise<string> {
          throw new Error('LLM provider error');
        }
      })();

      const errorReflector = new Reflector(errorProvider);
      
      await expect(errorReflector.reflect(testTrajectory)).rejects.toThrow(ReflectorError);
    });

    it('should handle malformed JSON responses', async () => {
      const malformedProvider = new MockReflectorProvider('Invalid JSON response');
      const malformedReflector = new Reflector(malformedProvider);
      
      const result = await malformedReflector.reflect(testTrajectory);
      
      // Should still work with text parsing fallback
      expect(result.insights).toBeDefined();
    });

    it('should extract insights from text when JSON parsing fails', async () => {
      const textResponse = `
        Observation: The code structure was unclear
        Lesson: Clear structure improves readability
        Suggested_bullet: Use consistent indentation and naming
        Confidence: 0.7
        Section: Code Quality
      `;
      
      const textProvider = new MockReflectorProvider(textResponse);
      const textReflector = new Reflector(textProvider);
      
      const result = await textReflector.reflect(testTrajectory);
      
      expect(result.insights).toHaveLength(1);
      expect(result.insights[0].observation).toContain('code structure was unclear');
    });
  });

  describe('test method', () => {
    it('should return true for successful test', async () => {
      const result = await reflector.test();
      expect(result).toBe(true);
    });

    it('should return false when reflection fails', async () => {
      const errorProvider = new (class extends MockReflectorProvider {
        async chat(): Promise<string> {
          throw new Error('Test error');
        }
      })();

      const errorReflector = new Reflector(errorProvider);
      const result = await errorReflector.test();
      
      expect(result).toBe(false);
    });
  });
});
