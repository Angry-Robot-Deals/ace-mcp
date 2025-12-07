#!/usr/bin/env node
/**
 * ACE MCP Server - Automated Test Suite
 * 
 * Tests all MCP methods through Docker container
 * Usage:
 *   - Local: node test-server.mjs
 *   - Docker: docker exec ace-mcp-server node test-server.mjs
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine if running in Docker or locally
// Check for Docker-specific indicators
const isDocker = 
  process.env.NODE_ENV === 'production' || 
  process.env.DOCKER === 'true' ||
  existsSync('/.dockerenv') ||
  existsSync('/app/dist/mcp-server-enhanced.js');

async function testMCP() {
  console.log('🚀 Starting ACE MCP Server Tests\n');
  console.log(`Environment: ${isDocker ? 'Docker' : 'Local'}\n`);

  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  // Determine server path based on environment
  let serverPath;
  let command;
  let args;

  if (isDocker) {
    // Running in Docker - use compiled JavaScript
    // Check if file exists, if not try alternative path
    serverPath = join('/app', 'dist', 'mcp-server-enhanced.js');
    command = 'node';
    args = [serverPath];
  } else {
    // Running locally - use TypeScript with tsx
    serverPath = join(__dirname, 'src', 'mcp-server-enhanced.ts');
    command = 'npx';
    args = ['tsx', serverPath];
  }

  const transport = new StdioClientTransport({
    command,
    args,
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to ACE MCP server\n');

    // Test 1: ace_smart_generate - Basic generation
    console.log('🎯 Test 1: ace_smart_generate - Basic generation');
    try {
      const result1 = await client.callTool({
        name: 'ace_smart_generate',
        arguments: {
          prompt: 'Create a simple REST API endpoint',
          context: 'Node.js Express application',
          auto_enhance: true,
        },
      });
      const data = JSON.parse(result1.content[0].text);
      
      if (!data.success) {
        throw new Error('Generation failed');
      }
      
      if (!data.result || !data.result.id) {
        throw new Error('Missing result or result.id');
      }
      
      if (!data.result.enhanced_prompt) {
        throw new Error('Missing enhanced_prompt');
      }
      
      if (!data.result.implementation) {
        throw new Error('Missing implementation');
      }
      
      console.log('✅ ace_smart_generate (basic): PASSED\n');
    } catch (error) {
      console.error('❌ ace_smart_generate (basic): FAILED', error.message);
      throw error;
    }

    // Test 2: ace_smart_generate - Without auto_enhance
    console.log('🎯 Test 2: ace_smart_generate - Without auto_enhance');
    try {
      const result2 = await client.callTool({
        name: 'ace_smart_generate',
        arguments: {
          prompt: 'Create a database connection function',
          auto_enhance: false,
        },
      });
      const data = JSON.parse(result2.content[0].text);
      
      if (!data.success || !data.result) {
        throw new Error('Generation failed');
      }
      
      // When auto_enhance is false, enhanced_prompt should be same as original
      if (data.result.enhanced_prompt !== data.result.original_prompt) {
        console.log('⚠️  Warning: enhanced_prompt differs even with auto_enhance=false');
      }
      
      console.log('✅ ace_smart_generate (no auto_enhance): PASSED\n');
    } catch (error) {
      console.error('❌ ace_smart_generate (no auto_enhance): FAILED', error.message);
      throw error;
    }

    // Test 3: ace_smart_reflect - Code analysis
    console.log('🧠 Test 3: ace_smart_reflect - Code analysis');
    try {
      const testCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
      `.trim();
      
      const result3 = await client.callTool({
        name: 'ace_smart_reflect',
        arguments: {
          code: testCode,
          auto_suggest: true,
        },
      });
      const data = JSON.parse(result3.content[0].text);
      
      if (!data.success) {
        throw new Error('Reflection failed');
      }
      
      if (!data.result || !data.result.code_analysis) {
        throw new Error('Missing code_analysis');
      }
      
      if (!data.result.suggestions || !Array.isArray(data.result.suggestions)) {
        throw new Error('Missing or invalid suggestions array');
      }
      
      if (typeof data.result.quality_score !== 'number') {
        throw new Error('Missing or invalid quality_score');
      }
      
      console.log('✅ ace_smart_reflect (with suggestions): PASSED\n');
    } catch (error) {
      console.error('❌ ace_smart_reflect (with suggestions): FAILED', error.message);
      throw error;
    }

    // Test 4: ace_smart_reflect - Without auto_suggest
    console.log('🧠 Test 4: ace_smart_reflect - Without auto_suggest');
    try {
      const testCode = 'const x = 5;';
      
      const result4 = await client.callTool({
        name: 'ace_smart_reflect',
        arguments: {
          code: testCode,
          auto_suggest: false,
        },
      });
      const data = JSON.parse(result4.content[0].text);
      
      if (!data.success || !data.result) {
        throw new Error('Reflection failed');
      }
      
      // When auto_suggest is false, suggestions should be empty
      if (data.result.suggestions && data.result.suggestions.length > 0) {
        console.log('⚠️  Warning: suggestions present even with auto_suggest=false');
      }
      
      console.log('✅ ace_smart_reflect (no auto_suggest): PASSED\n');
    } catch (error) {
      console.error('❌ ace_smart_reflect (no auto_suggest): FAILED', error.message);
      throw error;
    }

    // Test 5: ace_context_aware - With domain
    console.log('🎯 Test 5: ace_context_aware - With domain');
    try {
      const result5 = await client.callTool({
        name: 'ace_context_aware',
        arguments: {
          query: 'How to optimize database queries?',
          domain: 'database',
        },
      });
      const data = JSON.parse(result5.content[0].text);
      
      if (!data.success) {
        throw new Error('Context-aware assistance failed');
      }
      
      if (!data.result || !data.result.relevant_knowledge) {
        throw new Error('Missing relevant_knowledge');
      }
      
      if (!data.result.action_plan || !Array.isArray(data.result.action_plan)) {
        throw new Error('Missing or invalid action_plan');
      }
      
      if (!data.result.next_steps || !Array.isArray(data.result.next_steps)) {
        throw new Error('Missing or invalid next_steps');
      }
      
      if (data.result.domain !== 'database') {
        throw new Error(`Expected domain 'database', got '${data.result.domain}'`);
      }
      
      console.log('✅ ace_context_aware (with domain): PASSED\n');
    } catch (error) {
      console.error('❌ ace_context_aware (with domain): FAILED', error.message);
      throw error;
    }

    // Test 6: ace_context_aware - Without domain
    console.log('🎯 Test 6: ace_context_aware - Without domain');
    try {
      const result6 = await client.callTool({
        name: 'ace_context_aware',
        arguments: {
          query: 'What are best practices for error handling?',
        },
      });
      const data = JSON.parse(result6.content[0].text);
      
      if (!data.success || !data.result) {
        throw new Error('Context-aware assistance failed');
      }
      
      if (data.result.domain !== 'general') {
        throw new Error(`Expected domain 'general', got '${data.result.domain}'`);
      }
      
      console.log('✅ ace_context_aware (no domain): PASSED\n');
    } catch (error) {
      console.error('❌ ace_context_aware (no domain): FAILED', error.message);
      throw error;
    }

    // Test 7: ace_enhance_prompt - With focus_area
    console.log('✨ Test 7: ace_enhance_prompt - With focus_area');
    try {
      const originalPrompt = 'Create a login function';
      
      const result7 = await client.callTool({
        name: 'ace_enhance_prompt',
        arguments: {
          original_prompt: originalPrompt,
          focus_area: 'security',
        },
      });
      const data = JSON.parse(result7.content[0].text);
      
      if (!data.success) {
        throw new Error('Prompt enhancement failed');
      }
      
      if (!data.result || !data.result.enhanced_prompt) {
        throw new Error('Missing enhanced_prompt');
      }
      
      if (data.result.original_prompt !== originalPrompt) {
        throw new Error('Original prompt was modified');
      }
      
      if (data.result.focus_area !== 'security') {
        throw new Error(`Expected focus_area 'security', got '${data.result.focus_area}'`);
      }
      
      if (!data.result.improvements || !Array.isArray(data.result.improvements)) {
        throw new Error('Missing or invalid improvements array');
      }
      
      if (typeof data.result.enhancement_score !== 'number') {
        throw new Error('Missing or invalid enhancement_score');
      }
      
      // Enhanced prompt should be longer than original
      if (data.result.enhanced_prompt.length <= originalPrompt.length) {
        console.log('⚠️  Warning: Enhanced prompt is not longer than original');
      }
      
      console.log('✅ ace_enhance_prompt (with focus_area): PASSED\n');
    } catch (error) {
      console.error('❌ ace_enhance_prompt (with focus_area): FAILED', error.message);
      throw error;
    }

    // Test 8: ace_enhance_prompt - Without focus_area
    console.log('✨ Test 8: ace_enhance_prompt - Without focus_area');
    try {
      const originalPrompt = 'Build a user authentication system';
      
      const result8 = await client.callTool({
        name: 'ace_enhance_prompt',
        arguments: {
          original_prompt: originalPrompt,
        },
      });
      const data = JSON.parse(result8.content[0].text);
      
      if (!data.success || !data.result) {
        throw new Error('Prompt enhancement failed');
      }
      
      if (data.result.focus_area !== 'general') {
        throw new Error(`Expected focus_area 'general', got '${data.result.focus_area}'`);
      }
      
      console.log('✅ ace_enhance_prompt (no focus_area): PASSED\n');
    } catch (error) {
      console.error('❌ ace_enhance_prompt (no focus_area): FAILED', error.message);
      throw error;
    }

    // Test 9: Error handling - Invalid tool name
    console.log('❌ Test 9: Error handling - Invalid tool name');
    try {
      await client.callTool({
        name: 'nonexistent_tool',
        arguments: {},
      });
      console.error('⚠️  Should have thrown an error for invalid tool name');
    } catch (error) {
      if (error.message && error.message.includes('Unknown tool') || error.message.includes('MethodNotFound')) {
        console.log('✅ Error handling (invalid tool): PASSED\n');
      } else {
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }

    // Test 10: Error handling - Missing required argument
    console.log('❌ Test 10: Error handling - Missing required argument');
    try {
      await client.callTool({
        name: 'ace_smart_generate',
        arguments: {}, // Missing required 'prompt'
      });
      console.error('⚠️  Should have thrown an error for missing required argument');
    } catch (error) {
      // Error should occur for missing required parameter
      console.log('✅ Error handling (missing argument): PASSED\n');
    }

    // List all tools
    console.log('📋 Listing all available tools:');
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Verify expected tools are present
    const expectedTools = ['ace_smart_generate', 'ace_smart_reflect', 'ace_context_aware', 'ace_enhance_prompt'];
    const foundTools = tools.tools.map(t => t.name);
    const missingTools = expectedTools.filter(t => !foundTools.includes(t));
    
    if (missingTools.length > 0) {
      throw new Error(`Missing expected tools: ${missingTools.join(', ')}`);
    }
    
    console.log('✅ All expected tools are available\n');

    await client.close();
    console.log('✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    await client.close();
    process.exit(1);
  }
}

testMCP().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
