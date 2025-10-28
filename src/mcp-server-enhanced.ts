#!/usr/bin/env node

/**
 * ACE MCP Server - Enhanced with Auto-Invocation
 * 
 * This server automatically invokes appropriate ACE methods based on context
 * and enhances prompts using accumulated knowledge from the playbook
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from './utils/logger.js';

interface PlaybookKnowledge {
  patterns: string[];
  best_practices: string[];
  insights: string[];
  common_mistakes: string[];
  optimization_tips: string[];
}

class EnhancedACEMCPServer {
  private server: Server;
  private playbook: PlaybookKnowledge;

  constructor() {
    this.server = new Server(
      {
        name: 'ace-context-engineering',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.playbook = this.initializePlaybook();
    this.setupTools();
    this.setupErrorHandling();
  }

  private initializePlaybook(): PlaybookKnowledge {
    return {
      patterns: [
        'Use TypeScript for type safety in large projects',
        'Implement proper error handling with try-catch blocks',
        'Follow REST API conventions for consistent endpoints',
        'Use async/await instead of callbacks for better readability',
        'Implement input validation for all user-facing functions',
      ],
      best_practices: [
        'Write comprehensive unit tests for critical functions',
        'Use meaningful variable and function names',
        'Document complex logic with clear comments',
        'Keep functions small and focused on single responsibility',
        'Use environment variables for configuration',
      ],
      insights: [
        'Docker containers improve deployment consistency',
        'Bearer token authentication enhances API security',
        'Health checks enable better service monitoring',
        'Proper logging helps with debugging and monitoring',
        'Code reviews catch bugs early in development',
      ],
      common_mistakes: [
        'Not handling edge cases in user input',
        'Forgetting to validate API responses',
        'Using synchronous operations in async contexts',
        'Not cleaning up resources (files, connections)',
        'Hardcoding configuration values',
      ],
      optimization_tips: [
        'Use database indexes for frequently queried fields',
        'Implement caching for expensive operations',
        'Batch API calls when possible to reduce overhead',
        'Use connection pooling for database operations',
        'Compress responses for better network performance',
      ],
    };
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'ace_smart_generate',
            description: 'Automatically generate enhanced code with ACE insights',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'What you want to create or implement',
                },
                context: {
                  type: 'string',
                  description: 'Additional context about your project',
                },
                auto_enhance: {
                  type: 'boolean',
                  description: 'Automatically enhance prompt with playbook knowledge',
                  default: true,
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'ace_smart_reflect',
            description: 'Automatically analyze code and suggest improvements',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Code to analyze',
                },
                auto_suggest: {
                  type: 'boolean',
                  description: 'Automatically suggest improvements',
                  default: true,
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'ace_context_aware',
            description: 'Get contextually relevant suggestions based on your request',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Your development question or task',
                },
                domain: {
                  type: 'string',
                  description: 'Domain (web, api, database, frontend, backend, etc.)',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'ace_enhance_prompt',
            description: 'Enhance any prompt with accumulated knowledge',
            inputSchema: {
              type: 'object',
              properties: {
                original_prompt: {
                  type: 'string',
                  description: 'Original prompt to enhance',
                },
                focus_area: {
                  type: 'string',
                  description: 'Focus area (security, performance, maintainability, etc.)',
                },
              },
              required: ['original_prompt'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'ace_smart_generate':
            return await this.handleSmartGenerate(args);
          case 'ace_smart_reflect':
            return await this.handleSmartReflect(args);
          case 'ace_context_aware':
            return await this.handleContextAware(args);
          case 'ace_enhance_prompt':
            return await this.handleEnhancePrompt(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Tool ${name} failed:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private async handleSmartGenerate(args: any) {
    const { prompt, context, auto_enhance = true } = args;
    
    logger.info(`🎯 Smart generating for: ${prompt}`);
    
    let enhancedPrompt = prompt;
    
    if (auto_enhance) {
      enhancedPrompt = this.enhancePromptWithPlaybook(prompt, context);
    }

    // Determine the best approach based on prompt analysis
    const approach = this.analyzePromptType(prompt);
    
    const result = {
      id: `smart_gen_${Date.now()}`,
      original_prompt: prompt,
      enhanced_prompt: enhancedPrompt,
      approach: approach,
      generated_at: new Date().toISOString(),
      recommendations: this.getRelevantRecommendations(prompt),
      implementation: this.generateImplementation(enhancedPrompt, approach),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'smart_generator',
            result,
            message: 'Smart generation completed with ACE enhancements',
          }, null, 2),
        },
      ],
    };
  }

  private async handleSmartReflect(args: any) {
    const { code, auto_suggest = true } = args;
    
    logger.info(`🧠 Smart reflecting on code: ${code.substring(0, 50)}...`);
    
    const analysis = this.analyzeCode(code);
    const suggestions = auto_suggest ? this.generateSuggestions(code, analysis) : [];
    
    const result = {
      id: `smart_reflect_${Date.now()}`,
      code_analysis: analysis,
      suggestions: suggestions,
      quality_score: this.calculateQualityScore(analysis),
      reflected_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'smart_reflector',
            result,
            message: 'Smart reflection completed with actionable insights',
          }, null, 2),
        },
      ],
    };
  }

  private async handleContextAware(args: any) {
    const { query, domain } = args;
    
    logger.info(`🎯 Context-aware assistance for: ${query}`);
    
    const relevantKnowledge = this.getContextualKnowledge(query, domain);
    const actionPlan = this.generateActionPlan(query, relevantKnowledge);
    
    const result = {
      id: `context_aware_${Date.now()}`,
      query,
      domain: domain || 'general',
      relevant_knowledge: relevantKnowledge,
      action_plan: actionPlan,
      next_steps: this.suggestNextSteps(query, domain),
      generated_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'context_aware',
            result,
            message: 'Context-aware assistance provided',
          }, null, 2),
        },
      ],
    };
  }

  private async handleEnhancePrompt(args: any) {
    const { original_prompt, focus_area } = args;
    
    logger.info(`✨ Enhancing prompt: ${original_prompt.substring(0, 50)}...`);
    
    const enhanced = this.enhancePromptWithPlaybook(original_prompt, '', focus_area);
    const improvements = this.identifyImprovements(original_prompt, enhanced);
    
    const result = {
      id: `enhance_${Date.now()}`,
      original_prompt,
      enhanced_prompt: enhanced,
      focus_area: focus_area || 'general',
      improvements,
      enhancement_score: this.calculateEnhancementScore(original_prompt, enhanced),
      enhanced_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'prompt_enhancer',
            result,
            message: 'Prompt enhanced with ACE knowledge',
          }, null, 2),
        },
      ],
    };
  }

  private enhancePromptWithPlaybook(prompt: string, context: string = '', focusArea?: string): string {
    const relevantPatterns = this.findRelevantPatterns(prompt);
    const relevantPractices = this.findRelevantPractices(prompt);
    const relevantInsights = this.findRelevantInsights(prompt);
    
    let enhanced = prompt;
    
    if (relevantPatterns.length > 0) {
      enhanced += `\n\nRelevant patterns to consider:\n${relevantPatterns.map(p => `- ${p}`).join('\n')}`;
    }
    
    if (relevantPractices.length > 0) {
      enhanced += `\n\nBest practices to follow:\n${relevantPractices.map(p => `- ${p}`).join('\n')}`;
    }
    
    if (relevantInsights.length > 0) {
      enhanced += `\n\nInsights to apply:\n${relevantInsights.map(i => `- ${i}`).join('\n')}`;
    }
    
    if (focusArea) {
      const focusSpecific = this.getFocusSpecificGuidance(focusArea);
      if (focusSpecific.length > 0) {
        enhanced += `\n\n${focusArea} considerations:\n${focusSpecific.map(g => `- ${g}`).join('\n')}`;
      }
    }
    
    return enhanced;
  }

  private analyzePromptType(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('function') || lowerPrompt.includes('method')) {
      return 'function_creation';
    } else if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint')) {
      return 'api_development';
    } else if (lowerPrompt.includes('database') || lowerPrompt.includes('query')) {
      return 'database_operation';
    } else if (lowerPrompt.includes('test') || lowerPrompt.includes('testing')) {
      return 'testing';
    } else if (lowerPrompt.includes('fix') || lowerPrompt.includes('debug')) {
      return 'debugging';
    } else {
      return 'general_development';
    }
  }

  private analyzeCode(code: string): any {
    return {
      complexity: this.calculateComplexity(code),
      patterns_used: this.identifyPatterns(code),
      potential_issues: this.identifyIssues(code),
      strengths: this.identifyStrengths(code),
      language: this.detectLanguage(code),
    };
  }

  private generateSuggestions(code: string, analysis: any): any[] {
    const suggestions = [];
    
    if (analysis.complexity > 7) {
      suggestions.push({
        type: 'refactor',
        priority: 'high',
        suggestion: 'Consider breaking this into smaller functions',
        reason: 'High complexity detected',
      });
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push({
        type: 'error_handling',
        priority: 'medium',
        suggestion: 'Add error handling with try-catch blocks',
        reason: 'No error handling detected',
      });
    }
    
    return suggestions;
  }

  private getRelevantRecommendations(prompt: string): string[] {
    const recommendations = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('api')) {
      recommendations.push('Implement proper input validation');
      recommendations.push('Add authentication and authorization');
      recommendations.push('Include comprehensive error responses');
    }
    
    if (lowerPrompt.includes('database')) {
      recommendations.push('Use parameterized queries to prevent SQL injection');
      recommendations.push('Implement connection pooling');
      recommendations.push('Add proper indexing for performance');
    }
    
    return recommendations;
  }

  private generateImplementation(prompt: string, approach: string): string {
    return `Implementation approach: ${approach}\n\nBased on the enhanced prompt, here's the recommended implementation strategy:\n\n1. Start with a clear interface definition\n2. Implement core functionality with proper error handling\n3. Add comprehensive tests\n4. Document the implementation\n5. Consider performance and security implications`;
  }

  private findRelevantPatterns(prompt: string): string[] {
    return this.playbook.patterns.filter(pattern => 
      this.isRelevant(pattern, prompt)
    );
  }

  private findRelevantPractices(prompt: string): string[] {
    return this.playbook.best_practices.filter(practice => 
      this.isRelevant(practice, prompt)
    );
  }

  private findRelevantInsights(prompt: string): string[] {
    return this.playbook.insights.filter(insight => 
      this.isRelevant(insight, prompt)
    );
  }

  private isRelevant(item: string, prompt: string): boolean {
    const itemWords = item.toLowerCase().split(' ');
    const promptWords = prompt.toLowerCase().split(' ');
    
    return itemWords.some(word => 
      promptWords.some(pWord => 
        pWord.includes(word) || word.includes(pWord)
      )
    );
  }

  private getFocusSpecificGuidance(focusArea: string): string[] {
    const guidance: Record<string, string[]> = {
      security: [
        'Validate all inputs',
        'Use HTTPS for all communications',
        'Implement proper authentication',
        'Sanitize user data',
      ],
      performance: [
        'Use efficient algorithms',
        'Implement caching where appropriate',
        'Minimize database queries',
        'Optimize for the common case',
      ],
      maintainability: [
        'Write clear, self-documenting code',
        'Use consistent naming conventions',
        'Keep functions small and focused',
        'Add comprehensive tests',
      ],
    };
    
    return guidance[focusArea.toLowerCase()] || [];
  }

  private calculateComplexity(code: string): number {
    // Simple complexity calculation based on control structures
    const complexityIndicators = [
      /if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
    ];
    
    let complexity = 1;
    complexityIndicators.forEach(regex => {
      const matches = code.match(regex);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  private identifyPatterns(code: string): string[] {
    const patterns = [];
    
    if (code.includes('async') && code.includes('await')) {
      patterns.push('async/await pattern');
    }
    if (code.includes('try') && code.includes('catch')) {
      patterns.push('error handling pattern');
    }
    if (code.includes('class') && code.includes('constructor')) {
      patterns.push('class-based pattern');
    }
    
    return patterns;
  }

  private identifyIssues(code: string): string[] {
    const issues = [];
    
    if (code.includes('var ')) {
      issues.push('Use of var instead of let/const');
    }
    if (code.includes('==') && !code.includes('===')) {
      issues.push('Use of loose equality operator');
    }
    
    return issues;
  }

  private identifyStrengths(code: string): string[] {
    const strengths = [];
    
    if (code.includes('const ') || code.includes('let ')) {
      strengths.push('Modern variable declarations');
    }
    if (code.includes('===')) {
      strengths.push('Strict equality comparisons');
    }
    
    return strengths;
  }

  private detectLanguage(code: string): string {
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('function') || code.includes('=>')) return 'javascript';
    if (code.includes('public class') || code.includes('private ')) return 'java';
    return 'unknown';
  }

  private calculateQualityScore(analysis: any): number {
    let score = 50; // Base score
    
    // Adjust based on complexity
    if (analysis.complexity <= 5) score += 20;
    else if (analysis.complexity > 10) score -= 20;
    
    // Adjust based on patterns
    score += analysis.patterns_used.length * 5;
    
    // Adjust based on issues
    score -= analysis.potential_issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private getContextualKnowledge(query: string, domain?: string): any {
    const knowledge: any = {
      patterns: this.findRelevantPatterns(query),
      practices: this.findRelevantPractices(query),
      insights: this.findRelevantInsights(query),
    };
    
    if (domain) {
      knowledge[`${domain}_specific`] = this.getDomainSpecificKnowledge(domain);
    }
    
    return knowledge;
  }

  private getDomainSpecificKnowledge(domain: string): string[] {
    const domainKnowledge: Record<string, string[]> = {
      web: ['Use semantic HTML', 'Implement responsive design', 'Optimize for accessibility'],
      api: ['Follow REST principles', 'Implement proper status codes', 'Version your APIs'],
      database: ['Normalize data structure', 'Use appropriate indexes', 'Implement backup strategies'],
    };
    
    return domainKnowledge[domain.toLowerCase()] || [];
  }

  private generateActionPlan(query: string, knowledge: any): string[] {
    return [
      'Analyze requirements and constraints',
      'Apply relevant patterns and best practices',
      'Implement with proper error handling',
      'Test thoroughly',
      'Document the solution',
    ];
  }

  private suggestNextSteps(query: string, domain?: string): string[] {
    return [
      'Review the generated recommendations',
      'Implement the suggested approach',
      'Test the implementation',
      'Refactor based on insights',
      'Update documentation',
    ];
  }

  private identifyImprovements(original: string, enhanced: string): string[] {
    const improvements = [];
    
    if (enhanced.includes('patterns to consider')) {
      improvements.push('Added relevant design patterns');
    }
    if (enhanced.includes('best practices')) {
      improvements.push('Included best practices guidance');
    }
    if (enhanced.includes('insights')) {
      improvements.push('Applied accumulated insights');
    }
    
    return improvements;
  }

  private calculateEnhancementScore(original: string, enhanced: string): number {
    const improvementRatio = enhanced.length / original.length;
    return Math.min(100, Math.max(0, (improvementRatio - 1) * 100));
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      logger.error('❌ Enhanced MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      logger.info('📤 Shutting down Enhanced ACE MCP Server...');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🚀 Enhanced ACE MCP Server running via stdio');
  }
}

// Start the enhanced server
async function main() {
  try {
    const server = new EnhancedACEMCPServer();
    await server.run();
  } catch (error) {
    logger.error('❌ Failed to start Enhanced ACE MCP Server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
