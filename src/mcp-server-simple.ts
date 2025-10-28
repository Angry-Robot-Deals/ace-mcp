#!/usr/bin/env node

/**
 * ACE MCP Server - Simplified Implementation
 * 
 * This server implements the MCP protocol for Cursor AI integration
 * Communication happens via stdio (stdin/stdout) using JSON-RPC
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

class ACEMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ace-context-engineering',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupTools() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'ace_generate',
            description: 'Generate development trajectories using ACE framework',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The development prompt or task description',
                },
                context: {
                  type: 'string',
                  description: 'Additional context for the generation',
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'ace_reflect',
            description: 'Reflect on code or trajectories to extract insights',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Code to reflect on',
                },
                context: {
                  type: 'string',
                  description: 'Context for reflection',
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'ace_curate',
            description: 'Curate insights into the playbook',
            inputSchema: {
              type: 'object',
              properties: {
                insights: {
                  type: 'array',
                  description: 'Array of insights to curate',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      content: { type: 'string' },
                      confidence: { type: 'number' },
                    },
                  },
                },
              },
              required: ['insights'],
            },
          },
          {
            name: 'ace_playbook',
            description: 'Get current playbook contents',
            inputSchema: {
              type: 'object',
              properties: {
                section: {
                  type: 'string',
                  description: 'Specific section to retrieve (optional)',
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'ace_generate':
            return await this.handleGenerate(args);
          case 'ace_reflect':
            return await this.handleReflect(args);
          case 'ace_curate':
            return await this.handleCurate(args);
          case 'ace_playbook':
            return await this.handlePlaybook(args);
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

  private async handleGenerate(args: any) {
    const { prompt, context } = args;
    
    logger.info(`🎯 Generating trajectory for: ${prompt}`);
    
    // Simulate trajectory generation
    const trajectory = {
      id: `traj_${Date.now()}`,
      prompt,
      context: context || '',
      content: `Generated trajectory for: "${prompt}"\n\nContext: ${context || 'None'}\n\nThis is a simulated response from the ACE Generator component.`,
      generated_at: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'generator',
            trajectory,
            message: 'Trajectory generated successfully',
          }, null, 2),
        },
      ],
    };
  }

  private async handleReflect(args: any) {
    const { code, context } = args;
    
    logger.info(`🧠 Reflecting on code: ${code.substring(0, 50)}...`);
    
    // Simulate reflection insights
    const insights = [
      {
        id: `insight_${Date.now()}`,
        type: 'pattern',
        content: 'Code follows good practices with clear variable naming',
        confidence: 0.85,
        category: 'code_quality',
      },
      {
        id: `insight_${Date.now() + 1}`,
        type: 'improvement',
        content: 'Consider adding error handling for edge cases',
        confidence: 0.92,
        category: 'robustness',
      },
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'reflector',
            insights,
            reflected_at: new Date().toISOString(),
            message: 'Reflection completed successfully',
          }, null, 2),
        },
      ],
    };
  }

  private async handleCurate(args: any) {
    const { insights } = args;
    
    logger.info(`📚 Curating ${insights.length} insights`);
    
    // Simulate curation operations
    const operations = [
      {
        type: 'add',
        section: 'patterns',
        content: 'New pattern identified and added to playbook',
        confidence: 0.88,
      },
      {
        type: 'update',
        section: 'best_practices',
        content: 'Updated existing best practice with new insight',
        confidence: 0.94,
      },
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'curator',
            operations,
            playbook_updated: true,
            curated_at: new Date().toISOString(),
            message: 'Curation completed successfully',
          }, null, 2),
        },
      ],
    };
  }

  private async handlePlaybook(args: any) {
    const { section } = args;
    
    logger.info(`📖 Retrieving playbook${section ? ` section: ${section}` : ''}`);
    
    // Simulate playbook contents
    const sections = {
      patterns: [
        'Use TypeScript for type safety',
        'Implement proper error handling',
        'Follow REST API conventions',
      ],
      best_practices: [
        'Write comprehensive tests',
        'Use meaningful variable names',
        'Document complex logic',
      ],
      insights: [
        'Docker containers improve deployment consistency',
        'Bearer token authentication enhances security',
        'Health checks enable better monitoring',
      ],
    };

    const result = section ? { [section]: sections[section as keyof typeof sections] || [] } : sections;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            playbook: {
              id: 'main_playbook',
              sections: result,
              stats: {
                total_bullets: Object.values(sections).flat().length,
                last_update: new Date().toISOString(),
              },
            },
            message: 'Playbook retrieved successfully',
          }, null, 2),
        },
      ],
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      logger.error('❌ MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      logger.info('📤 Shutting down ACE MCP Server...');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🚀 ACE MCP Server running via stdio');
  }
}

// Start the server
async function main() {
  try {
    const server = new ACEMCPServer();
    await server.run();
  } catch (error) {
    logger.error('❌ Failed to start ACE MCP Server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
