# 🚀 Automatic ACE Usage in Cursor AI

## 📋 Overview

This document describes how to configure Cursor AI for automatic ACE method calls and prompt enhancement.

## 🎯 New Features of Enhanced ACE MCP Server

### ✨ Smart Tools:

1. **`ace_smart_generate`** - Automatically enhances prompts and generates code
2. **`ace_smart_reflect`** - Analyzes code and suggests improvements
3. **`ace_context_aware`** - Provides contextual recommendations
4. **`ace_enhance_prompt`** - Enhances any prompt with accumulated knowledge

## 🔧 Enhanced MCP Server Configuration

### 1. Update Cursor AI Configuration

Replace in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "$HOME/code/perplexity/ace-mcp-server/src/mcp-server-enhanced.ts"],
      "env": {
        "NODE_ENV": "development",
        "ACE_LOG_LEVEL": "info",
        "ACE_AUTO_ENHANCE": "true",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

### 2. Update Cursor AI Settings

In `~/Library/Application Support/Cursor/User/settings.json`:

```json
{
  "mcp.servers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "$HOME/code/perplexity/ace-mcp-server/src/mcp-server-enhanced.ts"],
      "env": {
        "NODE_ENV": "development",
        "ACE_LOG_LEVEL": "info",
        "ACE_AUTO_ENHANCE": "true",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

## 🎯 How to Use Automatic Enhancements

### 1. Smart Code Generation

Instead of a regular request:
```
Create a function to sort an array
```

Use:
```
@ace_smart_generate create a function to sort an array
```

**Result:** ACE automatically:
- ✅ Adds relevant design patterns
- ✅ Includes best practices
- ✅ Applies accumulated insights
- ✅ Suggests optimizations

### 2. Smart Code Analysis

```
@ace_smart_reflect 
```typescript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

**Result:** ACE automatically:
- 🔍 Analyzes code complexity
- 🎯 Identifies potential issues
- 💡 Suggests specific improvements
- 📊 Provides code quality assessment

### 3. Contextual Assistance

```
@ace_context_aware how to optimize API for high load domain:api
```

**Result:** ACE will provide:
- 📚 Relevant knowledge from playbook
- 🎯 Action plan
- 🔧 API-specific recommendations
- 📋 Next steps

### 4. Prompt Enhancement

```
@ace_enhance_prompt create REST API for users focus_area:security
```

**Result:** ACE will enhance the prompt:
- 🔒 Add security considerations
- 📋 Include best practices
- 🎯 Apply relevant patterns

## 🤖 Automatic Triggers

### Automatic Call Configuration

Create `.cursor/rules` file in project root:

```markdown
# ACE Auto-Enhancement Rules

## Code Generation
When user asks to create/implement/build something:
- Automatically use @ace_smart_generate
- Include context from current file/project
- Apply security and performance considerations

## Code Review
When user asks to review/analyze/improve code:
- Automatically use @ace_smart_reflect
- Provide actionable suggestions
- Include quality metrics

## Problem Solving
When user asks how to solve a problem:
- Automatically use @ace_context_aware
- Determine domain from context
- Provide step-by-step guidance

## Prompt Enhancement
For complex requests:
- Automatically use @ace_enhance_prompt
- Focus on relevant areas (security, performance, etc.)
- Include accumulated knowledge
```

## 🎯 Automatic Usage Examples

### Example 1: API Creation

**Your request:**
```
Create an endpoint for user registration
```

**ACE automatically:**
1. Calls `ace_smart_generate`
2. Enhances prompt with:
   - Input validation
   - Password hashing
   - Error handling
   - API security
3. Suggests complete implementation

### Example 2: Code Analysis

**Your request:**
```
Check this code for issues
```

**ACE automatically:**
1. Calls `ace_smart_reflect`
2. Analyzes:
   - Code complexity
   - Potential vulnerabilities
   - Performance
   - Best practices compliance
3. Suggests specific improvements

## 🔄 Knowledge Updates

ACE automatically updates its knowledge base based on:
- ✅ Successful solutions
- ❌ Found issues
- 🎯 Usage patterns
- 📊 Quality metrics

## 🚀 Starting Enhanced MCP Server

```bash
cd $HOME/code/perplexity/ace-mcp-server

# Stop old server
pkill -f "mcp-server-simple"

# Start enhanced server
npx tsx src/mcp-server-enhanced.ts
```

## ✅ Verification

After setup, try:

```
@ace_smart_generate create a function to validate email
```

You should see:
- 🎯 Enhanced prompt with best practices
- 🔧 Implementation recommendations
- 📋 Step-by-step plan
- 💡 Additional insights

## 🎉 Result

After setup, Cursor AI will:
- 🤖 Automatically enhance your prompts
- 🎯 Apply accumulated knowledge
- 💡 Suggest better solutions
- 📊 Learn from every interaction

**ACE will turn Cursor AI into a self-improving developer assistant!** 🚀
