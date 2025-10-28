#!/usr/bin/env node

/**
 * ACE MCP Server - Model Context Protocol Implementation
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

// ACE Components
import { Generator } from './core/generator.js';
import { Reflector } from './core/reflector.js';
import { Curator } from './core/curator.js';
import { Playbook } from './core/playbook.js';
import { Trajectory } from './core/types.js';
import { createLLMProvider } from './llm/factory.js';
import { logger } from './utils/logger.js';

class ACEMCPServer {
  private server: Server;
  private generator!: Generator;
  private reflector!: Reflector;
  private curator!: Curator;
  private playbook!: Playbook;

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
    this.initializeComponents();
  }

  private async initializeComponents() {
    try {
      // Initialize LLM provider from environment
      const provider = process.env.LLM_PROVIDER || 'deepseek';
      const llmConfig = { provider } as any;
      const llmProvider = createLLMProvider(llmConfig);
      
      // Initialize ACE components with proper config
      const contextDir = process.env.ACE_CONTEXT_DIR || './contexts';
      
      this.playbook = new Playbook();
      this.generator = new Generator(llmProvider, this.playbook);
      this.reflector = new Reflector(llmProvider);
      this.curator = new Curator(llmProvider, this.playbook);

      logger.info('🎯 ACE MCP Server components initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize ACE components:', error);
      throw error;
    }
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
                trajectory_id: {
                  type: 'string',
                  description: 'ID of trajectory to reflect on',
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
                section: {
                  type: 'string',
                  description: 'Playbook section to update',
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
    
    const trajectory = await this.generator.generate(prompt);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'generator',
            trajectory: {
              id: `traj_${Date.now()}`,
              prompt,
              context: context || '',
              response: trajectory.response,
              query: trajectory.query,
              generated_at: new Date().toISOString(),
            },
            message: 'Trajectory generated successfully',
          }, null, 2),
        },
      ],
    };
  }

  private async handleReflect(args: any) {
    const { code, trajectory_id, context } = args;
    
    logger.info(`🧠 Reflecting on code: ${code.substring(0, 50)}...`);
    
    // Create a proper trajectory object for reflection
    const trajectory: Trajectory = {
      query: code.substring(0, 200) || 'Code reflection',
      response: code,
      bullets_used: [],
      bullets_helpful: [],
      bullets_harmful: [],
      metadata: {
        model: 'code-reflection',
        timestamp: new Date(),
      },
    };
    
    const insights = await this.reflector.reflect(trajectory);

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
    const { insights, section } = args;
    
    logger.info(`📚 Curating ${insights.length} insights`);
    
    const operations = await this.curator.curate(insights, {
      minConfidence: 0.5,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            component: 'curator',
            operations: operations.operations || [],
            playbook_updated: operations.operations && operations.operations.length > 0,
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
    
    const bullets = await this.playbook.getBullets();
    
    // Group bullets by section
    const sections: Record<string, any[]> = {};
    bullets.forEach(bullet => {
      if (!sections[bullet.section]) {
        sections[bullet.section] = [];
      }
      sections[bullet.section].push({
        content: bullet.content,
        confidence: bullet.metadata.helpful_count / (bullet.metadata.helpful_count + bullet.metadata.harmful_count + 1),
        created_at: bullet.metadata.created.toISOString(),
      });
    });

    const result = section ? sections[section] || [] : sections;

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
                total_bullets: bullets.length,
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
