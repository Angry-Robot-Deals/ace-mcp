/**
 * Unit tests for the Generator component.
 */

import { Generator, GeneratorError } from '../generator';
import { Playbook } from '../playbook';
import { LLMProvider, Message, ChatOptions } from '../../llm/provider';

// Mock LLM Provider
class MockLLMProvider implements LLMProvider {
  public readonly name = 'mock';
  
  constructor(private mockResponse: string = 'Mock response') {}

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    // Simulate bullet tracking in response
    if (this.mockResponse.includes('BULLET TRACKING:')) {
      return this.mockResponse;
    }
    
    return `${this.mockResponse}\n\nBULLET TRACKING:\n#helpful-test-bullet-1 - This was helpful\n#harmful-test-bullet-2 - This was not applicable`;
  }

  async embed(text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3];
  }
}

describe('Generator', () => {
  let generator: Generator;
  let playbook: Playbook;
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    playbook = new Playbook();
    mockProvider = new MockLLMProvider();
    generator = new Generator(mockProvider, playbook);
  });

  describe('generate', () => {
    it('should generate a trajectory successfully', async () => {
      const trajectory = await generator.generate('Test query');
      
      expect(trajectory.query).toBe('Test query');
      expect(trajectory.response).toContain('Mock response');
      expect(trajectory.bullets_used).toEqual([]);
      expect(trajectory.bullets_helpful).toEqual(['test-bullet-1']);
      expect(trajectory.bullets_harmful).toEqual(['test-bullet-2']);
      expect(trajectory.metadata.timestamp).toBeInstanceOf(Date);
      expect(trajectory.metadata.model).toBe('mock');
    });

    it('should include bullets in context when available', async () => {
      // Add some bullets to playbook
      const bullet1 = playbook.addBullet('Testing', 'Always write tests');
      const bullet2 = playbook.addBullet('Documentation', 'Document your code');
      
      const trajectory = await generator.generate('How to code?');
      
      expect(trajectory.bullets_used).toHaveLength(2);
      expect(trajectory.bullets_used).toContain(bullet1.id);
      expect(trajectory.bullets_used).toContain(bullet2.id);
    });

    it('should respect maxBullets option', async () => {
      // Add multiple bullets
      for (let i = 0; i < 5; i++) {
        playbook.addBullet('Testing', `Test bullet ${i}`);
      }
      
      const trajectory = await generator.generate('Test query', {
        maxBullets: 2
      });
      
      expect(trajectory.bullets_used).toHaveLength(2);
    });

    it('should prioritize sections when specified', async () => {
      const bullet1 = playbook.addBullet('Testing', 'Test bullet');
      const bullet2 = playbook.addBullet('Priority', 'Priority bullet');
      
      const trajectory = await generator.generate('Test query', {
        prioritySections: ['Priority'],
        maxBullets: 1
      });
      
      expect(trajectory.bullets_used).toHaveLength(1);
      expect(trajectory.bullets_used[0]).toBe(bullet2.id);
    });

    it('should use custom system prompt when provided', async () => {
      const customPrompt = 'Custom prompt with {bullets}';
      
      // Mock provider that checks the system message
      const checkingProvider = new (class extends MockLLMProvider {
        async chat(messages: Message[]): Promise<string> {
          expect(messages[0].role).toBe('system');
          expect(messages[0].content).toContain('Custom prompt');
          return super.chat(messages);
        }
      })();
      
      const customGenerator = new Generator(checkingProvider, playbook);
      
      await customGenerator.generate('Test query', {
        systemPrompt: customPrompt
      });
    });

    it('should throw error for empty query', async () => {
      await expect(generator.generate('')).rejects.toThrow(GeneratorError);
      await expect(generator.generate('   ')).rejects.toThrow(GeneratorError);
    });

    it('should handle LLM provider errors', async () => {
      const errorProvider = new (class extends MockLLMProvider {
        async chat(): Promise<string> {
          throw new Error('LLM provider error');
        }
      })();
      
      const errorGenerator = new Generator(errorProvider, playbook);
      
      await expect(errorGenerator.generate('Test query')).rejects.toThrow(GeneratorError);
    });

    it('should update playbook with bullet feedback', async () => {
      const bullet1 = playbook.addBullet('Testing', 'Test bullet 1');
      const bullet2 = playbook.addBullet('Testing', 'Test bullet 2');
      
      // Mock response with specific bullet tracking
      const trackingProvider = new MockLLMProvider(
        `Response\n\nBULLET TRACKING:\n#helpful-${bullet1.id} - Helpful\n#harmful-${bullet2.id} - Not helpful`
      );
      
      const trackingGenerator = new Generator(trackingProvider, playbook);
      
      await trackingGenerator.generate('Test query');
      
      const updatedBullet1 = playbook.getBullet(bullet1.id)!;
      const updatedBullet2 = playbook.getBullet(bullet2.id)!;
      
      expect(updatedBullet1.metadata.helpful_count).toBe(1);
      expect(updatedBullet2.metadata.harmful_count).toBe(1);
    });

    it('should pass generation options to LLM provider', async () => {
      const optionsProvider = new (class extends MockLLMProvider {
        async chat(messages: Message[], options?: ChatOptions): Promise<string> {
          expect(options?.temperature).toBe(0.7);
          expect(options?.maxTokens).toBe(100);
          expect(options?.model).toBe('test-model');
          return super.chat(messages, options);
        }
      })();
      
      const optionsGenerator = new Generator(optionsProvider, playbook);
      
      await optionsGenerator.generate('Test query', {
        temperature: 0.7,
        maxTokens: 100,
        model: 'test-model'
      });
    });
  });

  describe('bullet selection', () => {
    beforeEach(() => {
      // Add bullets with different helpfulness ratios
      const bullet1 = playbook.addBullet('Testing', 'Very helpful bullet');
      const bullet2 = playbook.addBullet('Testing', 'Somewhat helpful bullet');
      const bullet3 = playbook.addBullet('Testing', 'Not helpful bullet');
      
      // Simulate feedback
      playbook.updateBulletFeedback([bullet1.id], 'helpful');
      playbook.updateBulletFeedback([bullet1.id], 'helpful');
      playbook.updateBulletFeedback([bullet2.id], 'helpful');
      playbook.updateBulletFeedback([bullet3.id], 'harmful');
    });

    it('should prioritize more helpful bullets', async () => {
      const trajectory = await generator.generate('Test query', {
        maxBullets: 2
      });
      
      // Should select the two most helpful bullets
      expect(trajectory.bullets_used).toHaveLength(2);
      
      const usedBullets = trajectory.bullets_used.map(id => playbook.getBullet(id)!);
      const helpfulnessRatios = usedBullets.map(b => 
        b.metadata.helpful_count / (b.metadata.helpful_count + b.metadata.harmful_count)
      );
      
      // Should be sorted by helpfulness (descending)
      expect(helpfulnessRatios[0]).toBeGreaterThanOrEqual(helpfulnessRatios[1]);
    });
  });

  describe('test method', () => {
    it('should return true for successful test', async () => {
      const result = await generator.test();
      expect(result).toBe(true);
    });

    it('should return false when generation fails', async () => {
      const errorProvider = new (class extends MockLLMProvider {
        async chat(): Promise<string> {
          throw new Error('Test error');
        }
      })();
      
      const errorGenerator = new Generator(errorProvider, playbook);
      const result = await errorGenerator.test();
      
      expect(result).toBe(false);
    });

    it('should use custom query when provided', async () => {
      const customProvider = new (class extends MockLLMProvider {
        async chat(messages: Message[]): Promise<string> {
          expect(messages[1].content).toBe('Custom test query');
          return super.chat(messages);
        }
      })();
      
      const customGenerator = new Generator(customProvider, playbook);
      
      await customGenerator.test('Custom test query');
    });
  });

  describe('getStats', () => {
    it('should return generation statistics', () => {
      const stats = generator.getStats();
      
      expect(stats).toHaveProperty('totalGenerations');
      expect(stats).toHaveProperty('averageBulletsUsed');
      expect(stats).toHaveProperty('helpfulnessRate');
    });
  });
});
